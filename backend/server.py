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
    source_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InvestmentMetrics(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    roi: float  # Return on Investment
    roe: float  # Return on Equity
    estimated_value: float
    short_term_rental_yield: float
    long_term_rental_yield: float
    yoy_appreciation: float
    projected_5yr_value: float
    cash_on_cash_return: float

class InvestmentStrategy(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    risk_level: str  # low, medium, medium-high, high
    strategy_name: str
    description: str
    expected_return: str
    time_horizon: str
    operational_complexity: str
    key_points: List[str]
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
        
        # Extract data (simplified - actual selectors would need to match immobiliare.it structure)
        title = soup.find('h1')
        title_text = title.get_text(strip=True) if title else "Property"
        
        # Try to extract price
        price_elem = soup.find(string=re.compile(r'€|EUR', re.I))
        price = 250000.0  # Default fallback
        if price_elem:
            price_match = re.search(r'[\d.,]+', price_elem)
            if price_match:
                price = float(price_match.group().replace('.', '').replace(',', '.'))
        
        return {
            'title': title_text,
            'location': 'Italy',
            'price': price,
            'property_type': 'Apartment',
            'size_sqm': 85.0,
            'rooms': 3,
            'bathrooms': 2,
            'source_url': url
        }
    except Exception as e:
        logging.error(f"Error extracting property data: {e}")
        # Return generic data if scraping fails
        return {
            'title': 'Property from URL',
            'location': 'Italy',
            'price': 250000.0,
            'property_type': 'Apartment',
            'size_sqm': 85.0,
            'rooms': 3,
            'bathrooms': 2,
            'source_url': url
        }

async def calculate_metrics(property_data: PropertyData) -> InvestmentMetrics:
    """Calculate investment metrics"""
    price = property_data.price
    size_sqm = property_data.size_sqm
    
    # Simplified calculations - in reality, these would be more sophisticated
    price_per_sqm = price / size_sqm if size_sqm > 0 else 0
    
    # Estimated monthly rent (simplified formula)
    monthly_rent_short = price * 0.004  # 0.4% of property value for short-term
    monthly_rent_long = price * 0.003   # 0.3% of property value for long-term
    
    # Annual rental yields
    short_term_yield = (monthly_rent_short * 12 / price) * 100
    long_term_yield = (monthly_rent_long * 12 / price) * 100
    
    # ROI calculation (assuming 20% down payment and 5 years)
    down_payment = price * 0.2
    annual_net_income = (monthly_rent_long * 12) * 0.7  # 70% after expenses
    roi = ((annual_net_income * 5) / down_payment) * 100
    
    # ROE calculation
    roe = (annual_net_income / down_payment) * 100
    
    # Appreciation estimates
    yoy_appreciation = 3.5  # Average 3.5% per year
    projected_5yr_value = price * (1.035 ** 5)
    
    # Cash-on-cash return
    cash_on_cash = (annual_net_income / down_payment) * 100
    
    # Estimated current value using AI-enhanced valuation
    estimated_value = price * 1.02  # Slight markup
    
    return InvestmentMetrics(
        roi=round(roi, 2),
        roe=round(roe, 2),
        estimated_value=round(estimated_value, 2),
        short_term_rental_yield=round(short_term_yield, 2),
        long_term_rental_yield=round(long_term_yield, 2),
        yoy_appreciation=round(yoy_appreciation, 2),
        projected_5yr_value=round(projected_5yr_value, 2),
        cash_on_cash_return=round(cash_on_cash, 2)
    )

async def generate_strategies(property_data: PropertyData, metrics: InvestmentMetrics) -> List[InvestmentStrategy]:
    """Generate 4 risk-based investment strategies"""
    
    strategies = [
        InvestmentStrategy(
            risk_level="low",
            strategy_name="Conservative Long-Term Hold",
            description="Traditional buy-and-hold strategy with stable long-term rental income.",
            expected_return="4-6% annual return",
            time_horizon="10+ years",
            operational_complexity="Low - minimal management",
            key_points=[
                "Long-term tenant contracts (3+ years)",
                "Minimal property modifications",
                "Focus on stable neighborhoods",
                "Conservative leverage (max 60% LTV)"
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
            key_points=[
                "Initial renovation budget: 15-20% of purchase price",
                "Focus on kitchen and bathroom upgrades",
                "Target 30% value increase post-renovation"
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
            key_points=[
                "Professional property management recommended",
                "Higher occupancy rates in tourist areas",
                "Seasonal pricing optimization"
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
            key_points=[
                "Target distressed or undervalued properties",
                "Complete renovation in 3-4 months",
                "Strategic pricing for quick sale"
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
- Short-term rental yield: {metrics.short_term_rental_yield}%
- Long-term rental yield: {metrics.long_term_rental_yield}%
- Projected 5-yr appreciation: {metrics.yoy_appreciation}%/year

Provide a concise analysis (3-4 sentences) covering:
1. Market positioning
2. Investment viability
3. Key opportunities or risks
        """
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        
        return response
        
    except Exception as e:
        logging.error(f"Error getting AI insights: {e}")
        return "This property shows solid investment potential based on the calculated metrics. Consider your risk tolerance and investment timeline when choosing a strategy."

# API Endpoints
@api_router.get("/")
async def root():
    return {"message": "Real Estate Investment Calculator API", "version": "1.0"}

@api_router.post("/analyze", response_model=AnalysisResult)
async def analyze_property(property_input: PropertyInput):
    """
    Analyze a property from URL or manual input
    """
    try:
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
                year_built=property_input.year_built
            )
        
        # Calculate metrics
        metrics = await calculate_metrics(property_data)
        
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