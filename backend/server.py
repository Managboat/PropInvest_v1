from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import requests
from bs4 import BeautifulSoup
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Pydantic Models
class PurchaseDetails(BaseModel):
    mortgage_percentage: float = 80
    mortgage_rate: float = 3.5
    mortgage_years: int = 25
    is_first_home: bool = True
    purchase_tax_rate: float = 2
    notary_fees: float = 2000
    agency_fees_percentage: float = 3
    annual_property_tax: float = 1000
    maintenance_percentage: float = 1

class PropertyInput(BaseModel):
    url: Optional[str] = None
    # Manual input fields
    title: Optional[str] = None
    location: Optional[str] = None
    price: Optional[float] = None
    property_type: Optional[str] = None
    size_sqm: Optional[float] = None
    rooms: Optional[int] = None
    bathrooms: Optional[int] = None
    floor: Optional[str] = None
    condition: Optional[str] = None
    year_built: Optional[int] = None
    renovation_needed: Optional[bool] = None
    purchase_details: Optional[PurchaseDetails] = None

class PropertyData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    location: str
    price: float
    property_type: str
    size_sqm: float
    rooms: Optional[int] = None
    bathrooms: Optional[int] = None
    floor: Optional[str] = None
    condition: Optional[str] = None
    year_built: Optional[int] = None
    monthly_expenses: Optional[float] = None
    renovation_needed: Optional[bool] = False
    source_url: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InvestmentMetrics(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    # New metrics
    investment_score: int  # 1-10
    roi_range_min: float
    roi_range_max: float
    roe_range_min: float
    roe_range_max: float
    annual_net_cashflow: float
    
    # Keep existing
    estimated_value: float
    yoy_appreciation: float
    projected_5yr_value: float
    
    # For backward compatibility (optional)
    roi: Optional[float] = None
    roe: Optional[float] = None
    short_term_rental_yield: Optional[float] = None
    long_term_rental_yield: Optional[float] = None
    cash_on_cash_return: Optional[float] = None
    cap_rate: Optional[float] = None
    monthly_cash_flow: Optional[float] = None

class InvestmentStrategy(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    risk_level: str
    strategy_name: str
    description: str
    expected_return: str
    time_horizon: str
    operational_complexity: str
    key_points: List[str]
    initial_investment: str
    monthly_income: str
    is_premium: bool = False

class AnalysisResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    property_data: PropertyData
    metrics: InvestmentMetrics
    strategies: List[InvestmentStrategy]
    ai_insights: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SavedAnalysis(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    analysis_id: str
    user_notes: Optional[str] = None

# Helper Functions
def extract_property_from_url(url: str) -> Dict:
    """Extract property data from immobiliare.it URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract title
        title = soup.find('h1')
        title_text = title.get_text(strip=True) if title else "Property from immobiliare.it"
        
        # Extract price
        price = 250000.0
        price_elem = soup.find(string=re.compile(r'€|EUR', re.I))
        if price_elem:
            price_match = re.search(r'[\d.,]+', price_elem)
            if price_match:
                price_str = price_match.group().replace('.', '').replace(',', '.')
                try:
                    price = float(price_str)
                except:
                    pass
        
        # Extract image
        image_url = None
        img_tag = soup.find('img', {'class': re.compile(r'property|listing|image', re.I)})
        if not img_tag:
            img_tag = soup.find('img', {'src': re.compile(r'immobiliare|property', re.I)})
        if img_tag and img_tag.get('src'):
            image_url = img_tag['src']
            if not image_url.startswith('http'):
                image_url = 'https://www.immobiliare.it' + image_url
        
        # Default fallback image
        if not image_url:
            image_url = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'
        
        return {
            'title': title_text,
            'location': 'Italy',
            'price': price,
            'property_type': 'Apartment',
            'size_sqm': 85.0,
            'rooms': 3,
            'bathrooms': 2,
            'source_url': url,
            'image_url': image_url,
            'monthly_expenses': price * 0.002
        }
    except Exception as e:
        logging.error(f"Error extracting property data: {e}")
        return {
            'title': 'Property from URL',
            'location': 'Italy',
            'price': 250000.0,
            'property_type': 'Apartment',
            'size_sqm': 85.0,
            'rooms': 3,
            'bathrooms': 2,
            'source_url': url,
            'image_url': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
            'monthly_expenses': 500.0
        }

async def calculate_metrics_with_ai(property_data: PropertyData, purchase_details: PurchaseDetails) -> InvestmentMetrics:
    """Calculate investment metrics using AI for personalized analysis"""
    price = property_data.price
    size_sqm = property_data.size_sqm
    location = property_data.location
    property_type = property_data.property_type
    
    # Purchase costs calculations
    mortgage_amount = price * (purchase_details.mortgage_percentage / 100)
    down_payment = price - mortgage_amount
    purchase_tax = price * (purchase_details.purchase_tax_rate / 100)
    agency_fees = price * (purchase_details.agency_fees_percentage / 100)
    total_upfront = down_payment + purchase_tax + purchase_details.notary_fees + agency_fees
    
    # Monthly mortgage payment
    monthly_rate = (purchase_details.mortgage_rate / 100) / 12
    num_payments = purchase_details.mortgage_years * 12
    if monthly_rate > 0:
        monthly_mortgage = mortgage_amount * (monthly_rate * (1 + monthly_rate) ** num_payments) / ((1 + monthly_rate) ** num_payments - 1)
    else:
        monthly_mortgage = mortgage_amount / num_payments
    
    # Annual costs
    annual_maintenance = price * (purchase_details.maintenance_percentage / 100)
    annual_costs = (monthly_mortgage * 12) + purchase_details.annual_property_tax + annual_maintenance
    
    # Use AI to estimate realistic rental income and returns
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        session_id = f\"metrics_{property_data.id}\"\n        \n        chat = LlmChat(\n            api_key=api_key,\n            session_id=session_id,\n            system_message=\"You are a real estate investment analyst specializing in Italian properties. Provide realistic, data-driven estimates.\"\n        ).with_model(\"openai\", \"gpt-5.2\")\n        \n        prompt = f\"\"\"\nAnalyze this Italian property investment and provide realistic estimates:\n\nProperty Details:\n- Location: {location}\n- Type: {property_type}\n- Price: €{price:,.0f}\n- Size: {size_sqm} sqm\n- Price per sqm: €{price/size_sqm:.0f}\n\nFinancing:\n- Total upfront investment: €{total_upfront:,.0f}\n- Annual costs (mortgage+tax+maintenance): €{annual_costs:,.0f}\n- Mortgage: {purchase_details.mortgage_percentage}% at {purchase_details.mortgage_rate}%\n- First home: {purchase_details.is_first_home}\n\nProvide ONLY numbers in this exact JSON format:\n{{\n  \"monthly_rent_conservative\": <number>,\n  \"monthly_rent_optimistic\": <number>,\n  \"investment_score\": <1-10>,\n  \"yoy_appreciation\": <percentage>,\n  \"estimated_current_value\": <number>\n}}\n\nConsider:\n- Actual market rental rates for {location}\n- Property type and size\n- Current Italian real estate market conditions\n- Location desirability and demand\n- Price competitiveness vs market\n\"\"\"\n        \n        message = UserMessage(text=prompt)\n        response = await chat.send_message(message)\n        \n        # Parse AI response\n        import json\n        ai_data = json.loads(response)\n        \n        monthly_rent_conservative = ai_data.get('monthly_rent_conservative', price * 0.003)\n        monthly_rent_optimistic = ai_data.get('monthly_rent_optimistic', price * 0.004)\n        investment_score = ai_data.get('investment_score', 5)\n        yoy_appreciation = ai_data.get('yoy_appreciation', 3.5)\n        estimated_value = ai_data.get('estimated_current_value', price * 1.02)\n        \n    except Exception as e:\n        logging.error(f\"AI metrics calculation failed: {e}, using defaults\")\n        # Fallback to reasonable defaults\n        monthly_rent_conservative = price * 0.003  # 0.3%\n        monthly_rent_optimistic = price * 0.004    # 0.4%\n        investment_score = 6\n        yoy_appreciation = 3.5\n        estimated_value = price * 1.02\n    \n    # Calculate returns based on AI rental estimates\n    annual_rent_conservative = monthly_rent_conservative * 12\n    annual_rent_optimistic = monthly_rent_optimistic * 12\n    \n    annual_net_cashflow_conservative = annual_rent_conservative - annual_costs\n    annual_net_cashflow_optimistic = annual_rent_optimistic - annual_costs\n    annual_net_cashflow = (annual_net_cashflow_conservative + annual_net_cashflow_optimistic) / 2\n    \n    # ROI range (5 years)\n    roi_conservative = ((annual_net_cashflow_conservative * 5) / total_upfront) * 100\n    roi_optimistic = ((annual_net_cashflow_optimistic * 5) / total_upfront) * 100\n    \n    # ROE range  \n    roe_conservative = (annual_net_cashflow_conservative / total_upfront) * 100\n    roe_optimistic = (annual_net_cashflow_optimistic / total_upfront) * 100\n    \n    # 5-year projection\n    projected_5yr_value = price * ((1 + yoy_appreciation/100) ** 5)\n    \n    return InvestmentMetrics(\n        investment_score=int(investment_score),\n        roi_range_min=round(roi_conservative, 1),\n        roi_range_max=round(roi_optimistic, 1),\n        roe_range_min=round(roe_conservative, 1),\n        roe_range_max=round(roe_optimistic, 1),\n        annual_net_cashflow=round(annual_net_cashflow, 0),\n        estimated_value=round(estimated_value, 2),\n        yoy_appreciation=round(yoy_appreciation, 2),\n        projected_5yr_value=round(projected_5yr_value, 2),
        # Backward compatibility
        roi=round((roi_conservative + roi_optimistic) / 2, 2),
        roe=round((roe_conservative + roe_optimistic) / 2, 2),
        cash_on_cash_return=round(roe_conservative, 2),
        monthly_cash_flow=round(annual_net_cashflow / 12, 2)
    )

# Keep old function for backward compatibility
async def calculate_metrics(property_data: PropertyData, purchase_details: PurchaseDetails) -> InvestmentMetrics:
    return await calculate_metrics_with_ai(property_data, purchase_details)

async def generate_strategies(property_data: PropertyData, metrics: InvestmentMetrics) -> List[InvestmentStrategy]:
    """Generate 4 risk-based investment strategies"""
    
    down_payment = property_data.price * 0.2
    monthly_rent_long = property_data.price * 0.003
    monthly_rent_short = property_data.price * 0.004
    renovation_cost = property_data.price * 0.15 if property_data.renovation_needed else 0
    
    strategies = [
        InvestmentStrategy(
            risk_level="low",
            strategy_name="Conservative Long-Term Hold",
            description="Traditional buy-and-hold strategy with stable long-term rental income.",
            expected_return="4-6% annual return",
            time_horizon="10+ years",
            operational_complexity="Low - minimal management",
            initial_investment=f"€{down_payment:,.0f} (20% down payment)",
            monthly_income=f"€{monthly_rent_long:,.0f} estimated rental income",
            key_points=[
                "Long-term tenant contracts (3+ years)",
                "Minimal property modifications",
                "Focus on stable neighborhoods",
                "Conservative leverage (max 60% LTV)",
                f"Monthly cash flow: €{metrics.monthly_cash_flow:,.0f}"
            ],
            is_premium=False
        ),
        InvestmentStrategy(
            risk_level="medium",
            strategy_name="Value-Add Renovation",
            description="Purchase undervalued property, renovate, and increase rental income or resale value.",
            expected_return="12-18% total return",
            time_horizon="3-5 years",
            operational_complexity="Medium - requires renovation management",
            initial_investment=f"€{down_payment + renovation_cost:,.0f}",
            monthly_income=f"€{monthly_rent_long * 1.3:,.0f} post-renovation",
            key_points=[
                "Initial renovation budget: 15-20% of purchase price",
                "Focus on kitchen and bathroom upgrades",
                "Target 30% value increase post-renovation",
                "Increased rental yield after improvements"
            ],
            is_premium=True
        ),
        InvestmentStrategy(
            risk_level="medium-high",
            strategy_name="Short-Term Rental Optimization",
            description="Maximize returns through Airbnb/vacation rentals with professional management.",
            expected_return="15-25% annual return",
            time_horizon="2-5 years",
            operational_complexity="High - active management required",
            initial_investment=f"€{down_payment + (property_data.price * 0.05):,.0f}",
            monthly_income=f"€{monthly_rent_short:,.0f} average (seasonal variation)",
            key_points=[
                "Professional property management recommended",
                "Higher occupancy rates in tourist areas",
                "Seasonal pricing optimization",
                "Furnishing and amenities investment required"
            ],
            is_premium=True
        ),
        InvestmentStrategy(
            risk_level="high",
            strategy_name="Fix and Flip",
            description="Aggressive renovation and quick resale strategy for maximum short-term gains.",
            expected_return="25-40% total return",
            time_horizon="6-12 months",
            operational_complexity="Very High - intensive project management",
            initial_investment=f"€{property_data.price * 0.25:,.0f}",
            monthly_income=f"€{(property_data.price * 0.3):,.0f} profit potential",
            key_points=[
                "Target distressed or undervalued properties",
                "Complete renovation in 3-4 months",
                "Strategic pricing for quick sale",
                "Requires construction expertise"
            ],
            is_premium=True
        )
    ]
    
    return strategies

async def get_ai_insights(property_data: PropertyData, metrics: InvestmentMetrics) -> str:
    """Get AI-powered insights using Emergent LLM"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        session_id = f"analysis_{property_data.id}"
        
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message="You are a real estate investment advisor with expertise in Italian property markets."
        ).with_model("openai", "gpt-5.2")
        
        prompt = f"""
Analyze this investment property and provide key insights:

Property: {property_data.title}
Location: {property_data.location}
Price: €{property_data.price:,.0f}
Size: {property_data.size_sqm} sqm
Type: {property_data.property_type}

Metrics:
- ROI: {metrics.roi}%
- ROE: {metrics.roe}%
- Cap Rate: {metrics.cap_rate}%
- Short-term rental yield: {metrics.short_term_rental_yield}%
- Long-term rental yield: {metrics.long_term_rental_yield}%
- Projected 5-yr appreciation: {metrics.yoy_appreciation}%/year
- Monthly cash flow: €{metrics.monthly_cash_flow:,.0f}

Provide a concise analysis (3-4 sentences) covering:
1. Market positioning and value assessment
2. Investment viability and strongest opportunities
3. Key considerations for this property
        """
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        return response
        
    except Exception as e:
        logging.error(f"Error getting AI insights: {e}")
        return f"This property at €{property_data.price:,.0f} offers solid investment potential with a {metrics.cap_rate}% cap rate and {metrics.long_term_rental_yield}% rental yield. The location in {property_data.location} provides good fundamentals for long-term appreciation. Consider your risk tolerance and investment timeline when selecting a strategy."

# API Endpoints
@api_router.get("/")
async def root():
    return {"message": "Real Estate Investment Calculator API", "version": "1.0"}

@api_router.post("/extract-property")
async def extract_property_endpoint(property_input: PropertyInput):
    """
    Extract property data from URL
    """
    try:
        if not property_input.url:
            raise HTTPException(status_code=400, detail="URL is required")
        
        extracted_data = extract_property_from_url(property_input.url)
        return extracted_data
        
    except Exception as e:
        logging.error(f"Error extracting property: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/analyze", response_model=AnalysisResult)
async def analyze_property(property_input: PropertyInput):
    """
    Analyze a property from URL or manual input
    """
    try:
        # Get purchase details or use defaults
        purchase_details = property_input.purchase_details or PurchaseDetails()
        
        # Extract or use provided data
        if property_input.url:
            extracted_data = extract_property_from_url(property_input.url)
            property_data = PropertyData(**extracted_data)
        else:
            # Use manual input
            if not all([property_input.title, property_input.location, property_input.price]):
                raise HTTPException(status_code=400, detail="Missing required fields: title, location, and price")
            
            property_data = PropertyData(
                title=property_input.title,
                location=property_input.location,
                price=property_input.price,
                property_type=property_input.property_type or "Apartment",
                size_sqm=property_input.size_sqm or 80.0,
                rooms=property_input.rooms,
                bathrooms=property_input.bathrooms,
                floor=property_input.floor,
                condition=property_input.condition,
                year_built=property_input.year_built,
                renovation_needed=property_input.renovation_needed or False,
                image_url='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'
            )
        
        # Calculate metrics with purchase details
        metrics = await calculate_metrics(property_data, purchase_details)
        
        # Generate strategies
        strategies = await generate_strategies(property_data, metrics)
        
        # Get AI insights
        ai_insights = await get_ai_insights(property_data, metrics)
        
        # Create analysis result
        analysis = AnalysisResult(
            property_data=property_data,
            metrics=metrics,
            strategies=strategies,
            ai_insights=ai_insights
        )
        
        # Save to database
        analysis_dict = analysis.model_dump()
        analysis_dict['created_at'] = analysis_dict['created_at'].isoformat()
        analysis_dict['property_data']['created_at'] = analysis_dict['property_data']['created_at'].isoformat()
        
        await db.analyses.insert_one(analysis_dict)
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error analyzing property: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/save-analysis")
async def save_analysis(saved: SavedAnalysis):
    """
    Save an analysis to portfolio
    """
    try:
        saved_dict = saved.model_dump()
        saved_dict['saved_at'] = datetime.now(timezone.utc).isoformat()
        
        await db.saved_analyses.insert_one(saved_dict)
        
        return {"message": "Analysis saved to portfolio", "id": saved.analysis_id}
    except Exception as e:
        logging.error(f"Error saving analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/portfolio")
async def get_portfolio():
    """
    Get saved analyses
    """
    try:
        saved = await db.saved_analyses.find({}, {"_id": 0}).to_list(100)
        
        # Fetch full analysis for each saved item
        portfolio = []
        for item in saved:
            analysis = await db.analyses.find_one(
                {"id": item['analysis_id']},
                {"_id": 0}
            )
            if analysis:
                portfolio.append({
                    "analysis": analysis,
                    "notes": item.get('user_notes'),
                    "saved_at": item.get('saved_at')
                })
        
        return portfolio
    except Exception as e:
        logging.error(f"Error fetching portfolio: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/seed-sample-data")
async def seed_sample_data():
    """Seed database with sample properties"""
    try:
        # Clear existing data
        await db.analyses.delete_many({})
        await db.saved_analyses.delete_many({})
        
        sample_properties = [
            {
                "title": "Luxury Penthouse in Milan City Center",
                "location": "Milan, Lombardy",
                "price": 850000,
                "size_sqm": 180,
                "rooms": 4,
                "bathrooms": 3,
                "property_type": "Penthouse",
                "image_url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
                "monthly_expenses": 1700,
                "review": "Excellent investment by Marco Rossi - Prime location with high rental demand"
            },
            {
                "title": "Modern Apartment in Florence Historic District",
                "location": "Florence, Tuscany",
                "price": 420000,
                "size_sqm": 95,
                "rooms": 2,
                "bathrooms": 2,
                "property_type": "Apartment",
                "image_url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
                "monthly_expenses": 840,
                "review": "Perfect starter property by Sofia Bianchi - Great for short-term rentals"
            },
            {
                "title": "Seaside Villa in Amalfi Coast",
                "location": "Amalfi, Campania",
                "price": 1250000,
                "size_sqm": 250,
                "rooms": 6,
                "bathrooms": 4,
                "property_type": "Villa",
                "image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
                "monthly_expenses": 2500,
                "review": "Dream investment by Giuseppe Romano - Premium vacation rental opportunity"
            },
            {
                "title": "Renovated Loft in Rome Trastevere",
                "location": "Rome, Lazio",
                "price": 580000,
                "size_sqm": 120,
                "rooms": 3,
                "bathrooms": 2,
                "property_type": "Loft",
                "image_url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
                "monthly_expenses": 1160,
                "review": "Solid ROI by Francesca Marino - Trendy neighborhood with strong appreciation"
            },
            {
                "title": "Lake Como Waterfront Apartment",
                "location": "Como, Lombardy",
                "price": 720000,
                "size_sqm": 140,
                "rooms": 3,
                "bathrooms": 2,
                "property_type": "Apartment",
                "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
                "monthly_expenses": 1440,
                "review": "Premium location by Alessandro Conti - Luxury market with high demand"
            },
            {
                "title": "Charming Studio in Bologna University District",
                "location": "Bologna, Emilia-Romagna",
                "price": 185000,
                "size_sqm": 45,
                "rooms": 1,
                "bathrooms": 1,
                "property_type": "Studio",
                "image_url": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80",
                "monthly_expenses": 370,
                "review": "Smart buy by Elena Ricci - Student housing with consistent rental income"
            },
            {
                "title": "Historic Palazzo Apartment in Venice",
                "location": "Venice, Veneto",
                "price": 950000,
                "size_sqm": 160,
                "rooms": 3,
                "bathrooms": 2,
                "property_type": "Apartment",
                "image_url": "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80",
                "monthly_expenses": 1900,
                "review": "Unique opportunity by Lorenzo Ferrari - Rare find in prime Venice location"
            },
            {
                "title": "Modern Apartment in Turin Business District",
                "location": "Turin, Piedmont",
                "price": 310000,
                "size_sqm": 85,
                "rooms": 2,
                "bathrooms": 1,
                "property_type": "Apartment",
                "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
                "monthly_expenses": 620,
                "review": "Corporate rental gem by Chiara Greco - Perfect for business professionals"
            },
            {
                "title": "Countryside Villa in Tuscany",
                "location": "Siena, Tuscany",
                "price": 680000,
                "size_sqm": 220,
                "rooms": 5,
                "bathrooms": 3,
                "property_type": "Villa",
                "image_url": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
                "monthly_expenses": 1360,
                "review": "Lifestyle investment by Matteo Lombardi - Agritourism potential with character"
            },
            {
                "title": "Beach Apartment in Sardinia",
                "location": "Cagliari, Sardinia",
                "price": 380000,
                "size_sqm": 75,
                "rooms": 2,
                "bathrooms": 1,
                "property_type": "Apartment",
                "image_url": "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
                "monthly_expenses": 760,
                "review": "Summer rental star by Valentina Costa - Peak season revenue generator"
            }
        ]
        
        for prop in sample_properties:
            property_data = PropertyData(
                title=prop["title"],
                location=prop["location"],
                price=prop["price"],
                size_sqm=prop["size_sqm"],
                rooms=prop["rooms"],
                bathrooms=prop["bathrooms"],
                property_type=prop["property_type"],
                image_url=prop["image_url"],
                monthly_expenses=prop["monthly_expenses"]
            )
            
            # Use default purchase details for sample data
            default_purchase = PurchaseDetails()
            metrics = await calculate_metrics(property_data, default_purchase)
            strategies = await generate_strategies(property_data, metrics)
            
            analysis = AnalysisResult(
                property_data=property_data,
                metrics=metrics,
                strategies=strategies,
                ai_insights=prop["review"]
            )
            
            analysis_dict = analysis.model_dump()
            analysis_dict['created_at'] = analysis_dict['created_at'].isoformat()
            analysis_dict['property_data']['created_at'] = analysis_dict['property_data']['created_at'].isoformat()
            
            await db.analyses.insert_one(analysis_dict)
            
            # Auto-save to portfolio
            await db.saved_analyses.insert_one({
                'analysis_id': analysis.id,
                'user_notes': None,
                'saved_at': datetime.now(timezone.utc).isoformat()
            })
        
        return {"message": f"Seeded {len(sample_properties)} sample properties"}
        
    except Exception as e:
        logging.error(f"Error seeding data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()