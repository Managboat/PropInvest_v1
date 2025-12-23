#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class RealEstateAPITester:
    def __init__(self, base_url="https://smart-realty-16.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.analysis_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        if details:
            print(f"   Details: {details}")
        print()

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                expected_keys = ["message", "version"]
                has_expected_data = all(key in data for key in expected_keys)
                success = has_expected_data
                details = f"Response: {data}" if has_expected_data else "Missing expected keys"
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test("Root Endpoint", success, details)
            return success
            
        except Exception as e:
            self.log_test("Root Endpoint", False, str(e))
            return False

    def test_analyze_manual_property(self):
        """Test property analysis with manual input"""
        try:
            payload = {
                "title": "Test Apartment Milan",
                "location": "Milan, Lombardy",
                "price": 300000,
                "property_type": "Apartment",
                "size_sqm": 90,
                "rooms": 3,
                "bathrooms": 2
            }
            
            response = requests.post(
                f"{self.api_url}/analyze", 
                json=payload, 
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                # Check required fields in response
                required_fields = ["id", "property_data", "metrics", "strategies", "ai_insights"]
                has_required_fields = all(field in data for field in required_fields)
                
                if has_required_fields:
                    # Store analysis ID for later tests
                    self.analysis_id = data["id"]
                    
                    # Check metrics structure
                    metrics = data["metrics"]
                    metric_fields = ["roi", "roe", "short_term_rental_yield", "long_term_rental_yield", "yoy_appreciation"]
                    has_metrics = all(field in metrics for field in metric_fields)
                    
                    # Check strategies
                    strategies = data["strategies"]
                    has_strategies = len(strategies) == 4
                    has_free_strategy = any(not s.get("is_premium", True) for s in strategies)
                    has_premium_strategies = sum(s.get("is_premium", False) for s in strategies) == 3
                    
                    success = has_required_fields and has_metrics and has_strategies and has_free_strategy and has_premium_strategies
                    details = f"Analysis ID: {self.analysis_id}, Strategies: {len(strategies)} (1 free, 3 premium)"
                else:
                    success = False
                    details = f"Missing required fields. Got: {list(data.keys())}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Manual Property Analysis", success, details)
            return success
            
        except Exception as e:
            self.log_test("Manual Property Analysis", False, str(e))
            return False

    def test_analyze_url_property(self):
        """Test property analysis with URL input"""
        try:
            payload = {
                "url": "https://www.immobiliare.it/annunci/12345/test-property"
            }
            
            response = requests.post(
                f"{self.api_url}/analyze", 
                json=payload, 
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                # Should have extracted data from URL (or fallback data)
                property_data = data.get("property_data", {})
                has_property_data = "title" in property_data and "price" in property_data
                success = has_property_data
                details = f"Extracted property: {property_data.get('title', 'N/A')}, Price: €{property_data.get('price', 0):,.0f}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("URL Property Analysis", success, details)
            return success
            
        except Exception as e:
            self.log_test("URL Property Analysis", False, str(e))
            return False

    def test_portfolio_endpoint_removed(self):
        """Test that portfolio endpoint returns 404 (removed)"""
        try:
            response = requests.get(f"{self.api_url}/portfolio", timeout=10)
            
            success = response.status_code == 404
            details = f"Status: {response.status_code} (expected 404 for removed endpoint)"
            
            self.log_test("Portfolio Endpoint Removed", success, details)
            return success
            
        except Exception as e:
            self.log_test("Portfolio Endpoint Removed", False, str(e))
            return False

    def test_seed_sample_data_endpoint_removed(self):
        """Test that seed-sample-data endpoint returns 404 (removed)"""
        try:
            response = requests.post(f"{self.api_url}/seed-sample-data", timeout=10)
            
            success = response.status_code == 404
            details = f"Status: {response.status_code} (expected 404 for removed endpoint)"
            
            self.log_test("Seed Sample Data Endpoint Removed", success, details)
            return success
            
        except Exception as e:
            self.log_test("Seed Sample Data Endpoint Removed", False, str(e))
            return False

    def test_investment_score_negative_metrics(self):
        """Test that investment score is low (max 3) when metrics are negative"""
        try:
            # Create a property with conditions that should result in negative metrics
            payload = {
                "title": "Expensive Property with High Costs",
                "location": "Milan, Lombardy", 
                "price": 1000000,  # Very high price
                "property_type": "Apartment",
                "size_sqm": 50,    # Small size = high price per sqm
                "rooms": 1,
                "bathrooms": 1,
                "purchase_details": {
                    "mortgage_percentage": 90,  # High leverage
                    "mortgage_rate": 6.0,      # High interest rate
                    "mortgage_years": 30,
                    "is_first_home": False,    # Higher taxes
                    "purchase_tax_rate": 9,    # High tax rate
                    "notary_fees": 5000,
                    "agency_fees_percentage": 5,  # High fees
                    "annual_property_tax": 8000,  # High property tax
                    "maintenance_percentage": 3   # High maintenance
                }
            }
            
            response = requests.post(
                f"{self.api_url}/analyze", 
                json=payload, 
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                metrics = data.get("metrics", {})
                
                investment_score = metrics.get("investment_score", 10)
                annual_net_cashflow = metrics.get("annual_net_cashflow", 0)
                roi_min = metrics.get("roi_range_min", 0)
                roi_max = metrics.get("roi_range_max", 0)
                roe_min = metrics.get("roe_range_min", 0)
                roe_max = metrics.get("roe_range_max", 0)
                
                # Check if any metrics are negative
                has_negative_cashflow = annual_net_cashflow < 0
                has_negative_roi = (roi_min + roi_max) / 2 < 0
                has_negative_roe = (roe_min + roe_max) / 2 < 0
                
                # If any metric is negative, score should be <= 3
                if has_negative_cashflow or has_negative_roi or has_negative_roe:
                    success = investment_score <= 3
                    details = f"Score: {investment_score}/10, Cash Flow: €{annual_net_cashflow:,.0f}, ROI: {roi_min}-{roi_max}%, ROE: {roe_min}-{roe_max}%"
                else:
                    # If no negative metrics, test passed but note it
                    success = True
                    details = f"No negative metrics found. Score: {investment_score}/10, Cash Flow: €{annual_net_cashflow:,.0f}"
                    
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Investment Score Negative Metrics Logic", success, details)
            return success
            
        except Exception as e:
            self.log_test("Investment Score Negative Metrics Logic", False, str(e))
            return False

    def test_invalid_requests(self):
        """Test error handling with invalid requests"""
        try:
            # Test missing required fields
            response = requests.post(
                f"{self.api_url}/analyze", 
                json={"title": "Test"}, 
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            success = response.status_code == 400  # Should return bad request
            details = f"Status: {response.status_code} (expected 400 for missing fields)"
            
            self.log_test("Error Handling - Missing Fields", success, details)
            return success
            
        except Exception as e:
            self.log_test("Error Handling - Missing Fields", False, str(e))
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🏠 Real Estate Investment API Testing")
        print("=" * 50)
        print(f"Testing API at: {self.api_url}")
        print()
        
        # Run tests in order
        tests = [
            self.test_root_endpoint,
            self.test_analyze_manual_property,
            self.test_analyze_url_property,
            self.test_save_analysis,
            self.test_get_portfolio,
            self.test_invalid_requests
        ]
        
        for test in tests:
            test()
        
        # Print summary
        print("=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    tester = RealEstateAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())