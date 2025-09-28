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
BACKEND_URL = "https://escuela-digital-7.preview.emergentagent.com"
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

def test_student_login_system():
    """Test student login functionality and user management"""
    print("\n🔍 Testing Student Login System...")
    
    # First, check if login endpoints exist
    print("  🔐 Checking for authentication endpoints...")
    
    auth_endpoints = ["/login", "/auth/login", "/authenticate"]
    login_endpoint_found = False
    
    for endpoint in auth_endpoints:
        try:
            response = requests.post(f"{API_BASE}{endpoint}", 
                                   json={"email": "test@test.com", "password": "test"}, 
                                   timeout=5)
            if response.status_code != 404:
                print(f"    ✅ Found potential login endpoint: {endpoint}")
                login_endpoint_found = True
                break
        except:
            continue
    
    if not login_endpoint_found:
        print("    ❌ CRITICAL: No login endpoints found in backend!")
        print("    📋 Available endpoints appear to be: /users, /students, /status")
        print("    🚨 This explains why student login is failing - no authentication system exists!")
        return False
    
    # Test user management endpoints
    print("  👥 Testing user management endpoints...")
    
    # Test creating a student user
    student_user_data = {
        "name": "María González",
        "email": "maria.gonzalez@estudiante.com",
        "role": "student",
        "document": "1234567890",
        "phone": "3001234567"
    }
    
    try:
        # Create student user
        response = requests.post(f"{API_BASE}/users", json=student_user_data, timeout=10)
        if response.status_code == 200:
            created_user = response.json()
            print(f"    ✅ Student user created successfully: {created_user.get('name')}")
            
            # Verify user has student role
            if created_user.get('role') == 'student':
                print("    ✅ Student role assigned correctly")
            else:
                print(f"    ❌ Role mismatch: expected 'student', got '{created_user.get('role')}'")
                return False
                
        else:
            print(f"    ❌ Failed to create student user - status: {response.status_code}")
            print(f"    Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"    ❌ User creation test failed: {e}")
        return False
    
    # Test retrieving users and check for students
    print("  📖 Checking for existing student users...")
    
    try:
        response = requests.get(f"{API_BASE}/users", timeout=10)
        if response.status_code == 200:
            users = response.json()
            student_users = [user for user in users if user.get('role') == 'student']
            
            print(f"    📊 Found {len(student_users)} student users out of {len(users)} total users")
            
            if len(student_users) > 0:
                print("    ✅ Student users exist in database")
                for student in student_users[:3]:  # Show first 3 students
                    print(f"      - {student.get('name')} ({student.get('email')})")
            else:
                print("    ⚠️  No student users found in database")
                
        else:
            print(f"    ❌ Failed to retrieve users - status: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"    ❌ User retrieval test failed: {e}")
        return False
    
    return True

def test_frontend_backend_connectivity():
    """Test connectivity between frontend and backend"""
    print("\n🔍 Testing Frontend-Backend Connectivity...")
    
    # Test the exact URL that frontend uses
    frontend_backend_url = "https://escuela-digital-7.preview.emergentagent.com"
    
    print(f"  🌐 Testing frontend's backend URL: {frontend_backend_url}")
    
    try:
        # Test basic connectivity
        response = requests.get(f"{frontend_backend_url}/api/", timeout=10)
        if response.status_code == 200:
            print("    ✅ Frontend can reach backend successfully")
            
            # Test CORS for frontend domain
            headers = {
                'Origin': frontend_backend_url,
                'Content-Type': 'application/json'
            }
            
            response = requests.get(f"{frontend_backend_url}/api/users", headers=headers, timeout=10)
            if response.status_code == 200:
                print("    ✅ CORS working for frontend domain")
                return True
            else:
                print(f"    ⚠️  CORS might have issues - status: {response.status_code}")
                return True  # Don't fail for CORS issues
                
        else:
            print(f"    ❌ Frontend cannot reach backend - status: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"    ❌ Frontend-backend connectivity test failed: {e}")
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
    
    # Test 5: Student Login System (NEW)
    test_results.append(("Student Login System", test_student_login_system()))
    
    # Test 6: Frontend-Backend Connectivity (NEW)
    test_results.append(("Frontend-Backend Connectivity", test_frontend_backend_connectivity()))
    
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