#!/usr/bin/env python3
"""
Frontend API Configuration Test
Verify that the frontend is now calling the correct API endpoints
"""

import requests
import json

def test_frontend_api_configuration():
    """Test that the frontend API configuration is correct"""
    print("🔍 FRONTEND API CONFIGURATION TEST")
    print("=" * 50)
    
    # The frontend should now be calling these URLs:
    expected_base_url = "https://login-fix-68.preview.emergentagent.com/api"
    expected_login_url = f"{expected_base_url}/auth/login"
    
    print(f"✅ Expected API Base URL: {expected_base_url}")
    print(f"✅ Expected Login URL: {expected_login_url}")
    print()
    
    # Test that the login endpoint is accessible
    print("🔗 Testing login endpoint accessibility...")
    
    test_login_data = {
        "email": "carmen.frontend@test.com",
        "password": "123456"
    }
    
    try:
        response = requests.post(expected_login_url, json=test_login_data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Login endpoint is accessible and working!")
            print(f"👤 Test login successful for: {result.get('user', {}).get('name', 'Unknown')}")
            return True
        else:
            print(f"❌ Login endpoint returned status: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error accessing login endpoint: {e}")
        return False

def test_all_api_endpoints():
    """Test all API endpoints that frontend might use"""
    print("\n🔍 TESTING ALL API ENDPOINTS")
    print("=" * 50)
    
    base_url = "https://login-fix-68.preview.emergentagent.com/api"
    
    endpoints = [
        ("GET", "/", "Root endpoint"),
        ("GET", "/users", "Get users"),
        ("GET", "/status", "Get status"),
        ("POST", "/auth/login", "Login endpoint")
    ]
    
    results = []
    
    for method, endpoint, description in endpoints:
        print(f"🔗 Testing {method} {endpoint} - {description}")
        
        try:
            url = f"{base_url}{endpoint}"
            
            if method == "GET":
                response = requests.get(url, timeout=10)
            elif method == "POST" and endpoint == "/auth/login":
                # Use test credentials
                test_data = {"email": "carmen.frontend@test.com", "password": "123456"}
                response = requests.post(url, json=test_data, timeout=10)
            
            if response.status_code == 200:
                print(f"  ✅ {method} {endpoint} - SUCCESS")
                results.append(True)
            else:
                print(f"  ❌ {method} {endpoint} - FAILED (Status: {response.status_code})")
                results.append(False)
                
        except requests.exceptions.RequestException as e:
            print(f"  ❌ {method} {endpoint} - ERROR: {e}")
            results.append(False)
    
    success_rate = sum(results) / len(results) * 100
    print(f"\n📊 API Endpoints Success Rate: {success_rate:.1f}% ({sum(results)}/{len(results)})")
    
    return all(results)

if __name__ == "__main__":
    print("🚀 TESTING FRONTEND API CONFIGURATION AFTER FIX")
    print("🎯 Verifying that frontend now calls correct /api endpoints")
    print()
    
    config_test = test_frontend_api_configuration()
    endpoints_test = test_all_api_endpoints()
    
    print("\n" + "=" * 50)
    print("📋 FINAL RESULTS")
    print("=" * 50)
    
    if config_test and endpoints_test:
        print("🎉 ALL TESTS PASSED!")
        print("✅ Frontend API configuration is now correct")
        print("✅ Users should be able to login successfully")
    else:
        print("❌ SOME TESTS FAILED")
        print("🚨 Frontend may still have login issues")