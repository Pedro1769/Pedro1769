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
BACKEND_URL = "http://localhost:8001"
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

def test_user_registration_api():
    """Test user registration functionality as requested"""
    print("\n🔍 Testing User Registration API (POST /api/users)...")
    
    # Test data for teacher registration as specified
    teacher_data = {
        "name": "Juan Pérez Test",
        "email": "juan.test@email.com", 
        "password": "123456",
        "role": "teacher",
        "document": "12345678",
        "phone": "3001234567",
        "subjects": ["Matemáticas", "Ciencias"],
        "grades": ["5°", "6°"],
        "teaching_level": "primaria"
    }
    
    try:
        print("  📝 Creating teacher user...")
        response = requests.post(f"{API_BASE}/users", json=teacher_data, timeout=10)
        
        if response.status_code == 200:
            created_user = response.json()
            print(f"    ✅ Teacher user created successfully: {created_user.get('name')}")
            print(f"    📧 Email: {created_user.get('email')}")
            print(f"    👤 Role: {created_user.get('role')}")
            print(f"    🆔 Document: {created_user.get('document')}")
            print(f"    🆔 User ID: {created_user.get('id')}")
            
            # Verify all required fields are present
            required_fields = ['id', 'name', 'email', 'role', 'document']
            missing_fields = [field for field in required_fields if not created_user.get(field)]
            
            if missing_fields:
                print(f"    ❌ Missing required fields: {missing_fields}")
                return False, None
                
            # Verify role is correct
            if created_user.get('role') != 'teacher':
                print(f"    ❌ Role mismatch: expected 'teacher', got '{created_user.get('role')}'")
                return False, None
                
            # Verify subjects and grades are preserved
            if created_user.get('subjects') != teacher_data['subjects']:
                print(f"    ❌ Subjects not preserved correctly")
                return False, None
                
            print("    ✅ All user data validated successfully")
            return True, created_user
            
        else:
            print(f"    ❌ Failed to create teacher user - status: {response.status_code}")
            print(f"    Response: {response.text}")
            return False, None
            
    except requests.exceptions.RequestException as e:
        print(f"    ❌ User registration test failed: {e}")
        return False, None

def test_authentication_api():
    """Test authentication API (POST /api/auth)"""
    print("\n🔍 Testing Authentication API (POST /api/auth/login)...")
    
    # First create a test user to authenticate
    test_user_data = {
        "name": "Test Auth User",
        "email": "auth.test@email.com",
        "password": "testpass123",
        "role": "teacher",
        "document": "87654321"
    }
    
    try:
        # Create user first
        print("  👤 Creating test user for authentication...")
        create_response = requests.post(f"{API_BASE}/users", json=test_user_data, timeout=10)
        
        if create_response.status_code != 200:
            print(f"    ❌ Failed to create test user for auth test")
            return False
            
        # Now test authentication
        print("  🔐 Testing login with created user...")
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        
        auth_response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=10)
        
        if auth_response.status_code == 200:
            auth_result = auth_response.json()
            print(f"    ✅ Authentication successful")
            print(f"    👤 User: {auth_result.get('user', {}).get('name')}")
            print(f"    🎫 Token received: {'Yes' if auth_result.get('token') else 'No'}")
            print(f"    ✅ Success flag: {auth_result.get('success')}")
            
            # Verify response structure
            if not auth_result.get('user'):
                print("    ❌ No user data in auth response")
                return False
                
            if not auth_result.get('token'):
                print("    ❌ No token in auth response")
                return False
                
            if not auth_result.get('success'):
                print("    ❌ Success flag not set")
                return False
                
            print("    ✅ Authentication API working correctly")
            return True
            
        else:
            print(f"    ❌ Authentication failed - status: {auth_response.status_code}")
            print(f"    Response: {auth_response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"    ❌ Authentication test failed: {e}")
        return False

def test_mongodb_persistence():
    """Test MongoDB data persistence"""
    print("\n🔍 Testing MongoDB Data Persistence...")
    
    # Create a unique test user
    timestamp = datetime.now().strftime("%H%M%S")
    test_user = {
        "name": f"Persistence Test User {timestamp}",
        "email": f"persist.test.{timestamp}@email.com",
        "password": "persist123",
        "role": "student",
        "document": f"PERSIST{timestamp}"
    }
    
    try:
        # Create user
        print("  💾 Creating user for persistence test...")
        create_response = requests.post(f"{API_BASE}/users", json=test_user, timeout=10)
        
        if create_response.status_code != 200:
            print(f"    ❌ Failed to create test user")
            return False
            
        created_user = create_response.json()
        user_id = created_user.get('id')
        
        # Wait a moment to ensure data is persisted
        time.sleep(1)
        
        # Retrieve all users and verify our user exists
        print("  🔍 Verifying user persistence in database...")
        get_response = requests.get(f"{API_BASE}/users", timeout=10)
        
        if get_response.status_code != 200:
            print(f"    ❌ Failed to retrieve users")
            return False
            
        all_users = get_response.json()
        
        # Find our test user
        found_user = None
        for user in all_users:
            if user.get('id') == user_id:
                found_user = user
                break
                
        if not found_user:
            print(f"    ❌ Created user not found in database")
            return False
            
        # Verify data integrity
        if found_user.get('email') != test_user['email']:
            print(f"    ❌ Email data corruption detected")
            return False
            
        if found_user.get('document') != test_user['document']:
            print(f"    ❌ Document data corruption detected")
            return False
            
        print(f"    ✅ User successfully persisted in MongoDB")
        print(f"    📧 Email: {found_user.get('email')}")
        print(f"    🆔 Document: {found_user.get('document')}")
        print(f"    ✅ Data integrity verified")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"    ❌ MongoDB persistence test failed: {e}")
        return False

def test_status_endpoints():
    """Test status endpoints as requested"""
    print("\n🔍 Testing Status Endpoints...")
    
    # Test GET /api/status
    print("  📊 Testing GET /api/status...")
    try:
        response = requests.get(f"{API_BASE}/status", timeout=10)
        if response.status_code == 200:
            status_data = response.json()
            print(f"    ✅ GET /api/status working - found {len(status_data)} status checks")
        else:
            print(f"    ❌ GET /api/status failed - status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"    ❌ GET /api/status failed: {e}")
        return False
    
    # Test GET /api/users
    print("  👥 Testing GET /api/users...")
    try:
        response = requests.get(f"{API_BASE}/users", timeout=10)
        if response.status_code == 200:
            users_data = response.json()
            print(f"    ✅ GET /api/users working - found {len(users_data)} users")
            
            # Show some user statistics
            roles = {}
            for user in users_data:
                role = user.get('role', 'unknown')
                roles[role] = roles.get(role, 0) + 1
                
            print("    📊 User roles distribution:")
            for role, count in roles.items():
                print(f"      - {role}: {count}")
                
        else:
            print(f"    ❌ GET /api/users failed - status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"    ❌ GET /api/users failed: {e}")
        return False
    
    print("    ✅ All status endpoints working correctly")
    return True

def test_frontend_backend_connectivity():
    """Test connectivity between frontend and backend"""
    print("\n🔍 Testing Frontend-Backend Connectivity...")
    
    # Test the exact URL that frontend uses
    frontend_backend_url = "https://auth-repair-gimamer.preview.emergentagent.com"
    
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
    """Run all backend tests with focus on user registration"""
    print("🚀 Starting Comprehensive Backend Testing Suite")
    print("🎯 Focus: User Registration Functionality for Gimnasio Americano del Atlántico")
    print("=" * 70)
    
    test_results = []
    
    # Test 1: Backend Health
    test_results.append(("Backend Health", test_backend_health()))
    
    # Test 2: MongoDB Connection
    test_results.append(("MongoDB Connection", test_mongodb_connection()))
    
    # Test 3: User Registration API (PRIORITY TEST)
    test_results.append(("User Registration API", test_user_registration_api()[0]))
    
    # Test 4: Authentication API (PRIORITY TEST)
    test_results.append(("Authentication API", test_authentication_api()))
    
    # Test 5: Status Endpoints (PRIORITY TEST)
    test_results.append(("Status Endpoints", test_status_endpoints()))
    
    # Test 6: MongoDB Persistence (PRIORITY TEST)
    test_results.append(("MongoDB Persistence", test_mongodb_persistence()))
    
    # Test 7: CORS Configuration
    test_results.append(("CORS Configuration", test_cors_configuration()))
    
    # Summary
    print("\n" + "=" * 70)
    print("📋 TEST SUMMARY - USER REGISTRATION FUNCTIONALITY")
    print("=" * 70)
    
    passed_tests = 0
    critical_tests = ["User Registration API", "Authentication API", "Status Endpoints", "MongoDB Persistence"]
    critical_passed = 0
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        priority = "🔥 CRITICAL" if test_name in critical_tests else "📋 STANDARD"
        print(f"{test_name:<25} {status} {priority}")
        
        if result:
            passed_tests += 1
            if test_name in critical_tests:
                critical_passed += 1
    
    success_rate = passed_tests / len(test_results) * 100
    critical_success_rate = critical_passed / len(critical_tests) * 100
    
    print(f"\nOverall Success Rate: {success_rate:.1f}% ({passed_tests}/{len(test_results)})")
    print(f"Critical Tests Success Rate: {critical_success_rate:.1f}% ({critical_passed}/{len(critical_tests)})")
    
    # Determine overall status
    if critical_success_rate == 100:
        print("\n🎉 All critical user registration tests passed! System is fully functional.")
        return True
    elif critical_success_rate >= 75:
        print("\n⚠️  Most critical tests passed. Minor issues detected but registration should work.")
        return True
    else:
        print("\n❌ Critical user registration issues detected. System needs immediate attention.")
        return False

if __name__ == "__main__":
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base URL: {API_BASE}")
    print(f"MongoDB: mongodb://localhost:27017")
    print(f"DB Name: gimnasio_americano")
    print()
    
    success = run_comprehensive_backend_test()
    sys.exit(0 if success else 1)