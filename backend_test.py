#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class RealEstateAPITester:
    def __init__(self, base_url="https://realestate-calc-10.preview.emergentagent.com"):
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

    def test_save_analysis(self):
        """Test saving analysis to portfolio"""
        if not self.analysis_id:
            self.log_test("Save Analysis", False, "No analysis ID available from previous test")
            return False
            
        try:
            payload = {
                "analysis_id": self.analysis_id,
                "user_notes": "Test property for portfolio"
            }
            
            response = requests.post(
                f"{self.api_url}/save-analysis", 
                json=payload, 
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                has_message = "message" in data and "id" in data
                success = has_message
                details = f"Saved analysis: {data.get('id', 'N/A')}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Save Analysis", success, details)
            return success
            
        except Exception as e:
            self.log_test("Save Analysis", False, str(e))
            return False

    def test_get_portfolio(self):
        """Test retrieving portfolio"""
        try:
            response = requests.get(f"{self.api_url}/portfolio", timeout=10)
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                is_list = isinstance(data, list)
                
                if is_list and len(data) > 0:
                    # Check structure of portfolio items
                    first_item = data[0]
                    has_analysis = "analysis" in first_item
                    success = has_analysis
                    details = f"Portfolio items: {len(data)}, First item has analysis: {has_analysis}"
                else:
                    success = is_list  # Empty portfolio is valid
                    details = f"Portfolio items: {len(data) if is_list else 'Not a list'}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            self.log_test("Get Portfolio", success, details)
            return success
            
        except Exception as e:
            self.log_test("Get Portfolio", False, str(e))
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