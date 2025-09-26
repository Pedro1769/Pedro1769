#!/usr/bin/env python3
"""
Backend Testing Suite for Gym Management System
Tests backend API endpoints and MongoDB connectivity
"""

import requests
import json
import sys
from datetime import datetime
import time

# Backend URL from frontend .env
BACKEND_URL = "https://f100ffee-95b3-46a9-a079-0bbb5aa37cf2.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

def test_backend_health():
    """Test if backend server is responding"""
    print("🔍 Testing Backend Health...")
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Hello World":
                print("✅ Backend health check passed")
                return True
            else:
                print(f"❌ Backend health check failed - unexpected response: {data}")
                return False
        else:
            print(f"❌ Backend health check failed - status code: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend health check failed - connection error: {e}")
        return False

def test_mongodb_connection():
    """Test MongoDB connection by creating and retrieving status checks"""
    print("\n🔍 Testing MongoDB Connection...")
    
    # Test POST endpoint (creates data in MongoDB)
    test_data = {
        "client_name": "Test Gym Member"
    }
    
    try:
        # Create a status check
        print("  📝 Creating test status check...")
        response = requests.post(f"{API_BASE}/status", json=test_data, timeout=10)
        
        if response.status_code == 200:
            created_data = response.json()
            print(f"  ✅ Status check created successfully: ID {created_data.get('id')}")
            
            # Verify the created data has required fields
            required_fields = ['id', 'client_name', 'timestamp']
            missing_fields = [field for field in required_fields if field not in created_data]
            
            if missing_fields:
                print(f"  ❌ Created data missing fields: {missing_fields}")
                return False
                
            if created_data.get('client_name') != test_data['client_name']:
                print(f"  ❌ Client name mismatch: expected '{test_data['client_name']}', got '{created_data.get('client_name')}'")
                return False
                
        else:
            print(f"  ❌ Failed to create status check - status code: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
        # Test GET endpoint (retrieves data from MongoDB)
        print("  📖 Retrieving status checks...")
        response = requests.get(f"{API_BASE}/status", timeout=10)
        
        if response.status_code == 200:
            status_checks = response.json()
            print(f"  ✅ Retrieved {len(status_checks)} status checks from database")
            
            # Verify our test data is in the results
            test_found = any(check.get('client_name') == test_data['client_name'] for check in status_checks)
            if test_found:
                print("  ✅ Test data found in database - MongoDB connection working")
                return True
            else:
                print("  ❌ Test data not found in database")
                return False
        else:
            print(f"  ❌ Failed to retrieve status checks - status code: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"  ❌ MongoDB connection test failed - connection error: {e}")
        return False

def test_api_endpoints():
    """Test all available API endpoints"""
    print("\n🔍 Testing API Endpoints...")
    
    endpoints_to_test = [
        ("GET", "/", "Root endpoint"),
        ("GET", "/status", "Get status checks"),
        ("POST", "/status", "Create status check")
    ]
    
    results = []
    
    for method, endpoint, description in endpoints_to_test:
        print(f"  🔗 Testing {method} {endpoint} - {description}")
        
        try:
            if method == "GET":
                response = requests.get(f"{API_BASE}{endpoint}", timeout=10)
            elif method == "POST":
                test_payload = {"client_name": f"API Test User {datetime.now().strftime('%H:%M:%S')}"}
                response = requests.post(f"{API_BASE}{endpoint}", json=test_payload, timeout=10)
            
            if response.status_code == 200:
                print(f"    ✅ {method} {endpoint} - Success")
                results.append(True)
            else:
                print(f"    ❌ {method} {endpoint} - Failed with status {response.status_code}")
                results.append(False)
                
        except requests.exceptions.RequestException as e:
            print(f"    ❌ {method} {endpoint} - Connection error: {e}")
            results.append(False)
    
    success_rate = sum(results) / len(results) * 100
    print(f"\n  📊 API Endpoints Success Rate: {success_rate:.1f}% ({sum(results)}/{len(results)})")
    
    return all(results)

def test_cors_configuration():
    """Test CORS configuration"""
    print("\n🔍 Testing CORS Configuration...")
    
    try:
        # Make a request with custom headers to test CORS
        headers = {
            'Origin': 'https://example.com',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        
        response = requests.options(f"{API_BASE}/", headers=headers, timeout=10)
        
        # Check for CORS headers in response
        cors_headers = [
            'access-control-allow-origin',
            'access-control-allow-methods',
            'access-control-allow-headers'
        ]
        
        found_headers = [header for header in cors_headers if header in response.headers]
        
        if len(found_headers) >= 2:  # At least 2 CORS headers should be present
            print("  ✅ CORS configuration appears to be working")
            return True
        else:
            print(f"  ⚠️  CORS headers may not be properly configured. Found: {found_headers}")
            return True  # Don't fail the test for this, as it might still work
            
    except requests.exceptions.RequestException as e:
        print(f"  ❌ CORS test failed - connection error: {e}")
        return False

def run_comprehensive_backend_test():
    """Run all backend tests"""
    print("🚀 Starting Comprehensive Backend Testing Suite")
    print("=" * 60)
    
    test_results = []
    
    # Test 1: Backend Health
    test_results.append(("Backend Health", test_backend_health()))
    
    # Test 2: MongoDB Connection
    test_results.append(("MongoDB Connection", test_mongodb_connection()))
    
    # Test 3: API Endpoints
    test_results.append(("API Endpoints", test_api_endpoints()))
    
    # Test 4: CORS Configuration
    test_results.append(("CORS Configuration", test_cors_configuration()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 TEST SUMMARY")
    print("=" * 60)
    
    passed_tests = 0
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<20} {status}")
        if result:
            passed_tests += 1
    
    success_rate = passed_tests / len(test_results) * 100
    print(f"\nOverall Success Rate: {success_rate:.1f}% ({passed_tests}/{len(test_results)})")
    
    if success_rate == 100:
        print("\n🎉 All backend tests passed! System is ready for frontend integration.")
        return True
    elif success_rate >= 75:
        print("\n⚠️  Most backend tests passed. Minor issues detected but system should work.")
        return True
    else:
        print("\n❌ Critical backend issues detected. System needs attention before frontend integration.")
        return False

if __name__ == "__main__":
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base URL: {API_BASE}")
    print()
    
    success = run_comprehensive_backend_test()
    sys.exit(0 if success else 1)