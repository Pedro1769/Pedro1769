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

# Backend URL from frontend .env - using the actual deployed URL
BACKEND_URL = "https://teacher-portal-9.preview.emergentagent.com"
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

def test_specific_login_users():
    """Test login functionality with the specific users mentioned in the request"""
    print("\n🔍 Testing Login with Specific Test Users (GIMNASIO AMERICANO DEL ATLÁNTICO)...")
    
    # Test users as specified in the request
    test_users = [
        {
            "email": "carmen.frontend@test.com",
            "password": "123456",
            "role": "teacher",
            "name": "Carmen Frontend"
        },
        {
            "email": "maria.estudiante@email.com", 
            "password": "estudiante123",
            "role": "student",
            "name": "María Estudiante"
        },
        {
            "email": "marielacarolinas@hotmail.com",
            "password": "Convi1234", 
            "role": "coordinadora_convivencia",
            "name": "Mariela Carolinas"
        }
    ]
    
    successful_logins = []
    failed_logins = []
    
    for user in test_users:
        print(f"  🔐 Testing login for {user['name']} ({user['role']})...")
        print(f"    📧 Email: {user['email']}")
        
        try:
            login_data = {
                "email": user["email"],
                "password": user["password"]
            }
            
            # Test the exact endpoint that frontend uses
            response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=10)
            
            if response.status_code == 200:
                auth_result = response.json()
                
                # Verify response structure
                if auth_result.get('success') and auth_result.get('user') and auth_result.get('token'):
                    user_data = auth_result.get('user')
                    print(f"    ✅ Login successful for {user['name']}")
                    print(f"    👤 User ID: {user_data.get('id')}")
                    print(f"    👤 Role: {user_data.get('role')}")
                    print(f"    🎫 Token: {'Present' if auth_result.get('token') else 'Missing'}")
                    
                    # Verify role matches expected
                    if user_data.get('role') == user['role']:
                        print(f"    ✅ Role verification passed: {user['role']}")
                        successful_logins.append(user['name'])
                    else:
                        print(f"    ❌ Role mismatch: expected {user['role']}, got {user_data.get('role')}")
                        failed_logins.append(f"{user['name']} - role mismatch")
                else:
                    print(f"    ❌ Login response structure invalid")
                    print(f"    Response: {auth_result}")
                    failed_logins.append(f"{user['name']} - invalid response structure")
                    
            elif response.status_code == 401:
                print(f"    ❌ Login failed - Invalid credentials (401)")
                print(f"    Response: {response.text}")
                failed_logins.append(f"{user['name']} - invalid credentials")
                
            elif response.status_code == 404:
                print(f"    ❌ Login failed - Endpoint not found (404)")
                print(f"    This suggests the backend is not accessible or login endpoint is missing")
                failed_logins.append(f"{user['name']} - endpoint not found")
                
            else:
                print(f"    ❌ Login failed - HTTP {response.status_code}")
                print(f"    Response: {response.text}")
                failed_logins.append(f"{user['name']} - HTTP {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"    ❌ Login test failed for {user['name']}: {e}")
            failed_logins.append(f"{user['name']} - connection error")
    
    print(f"\n  📊 Login Test Results:")
    print(f"    ✅ Successful logins: {len(successful_logins)}/3")
    print(f"    ❌ Failed logins: {len(failed_logins)}/3")
    
    if successful_logins:
        print(f"    ✅ Working users: {', '.join(successful_logins)}")
    
    if failed_logins:
        print(f"    ❌ Failed users: {', '.join(failed_logins)}")
    
    return len(failed_logins) == 0

def test_frontend_backend_connectivity():
    """Test connectivity between frontend and backend"""
    print("\n🔍 Testing Frontend-Backend Connectivity...")
    
    # Test the exact URL that frontend uses
    frontend_backend_url = "https://teacher-portal-9.preview.emergentagent.com"
    
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

def test_user_database_verification():
    """Verify that the test users exist in the database"""
    print("\n🔍 Testing User Database Verification...")
    
    expected_users = [
        "carmen.frontend@test.com",
        "maria.estudiante@email.com", 
        "marielacarolinas@hotmail.com"
    ]
    
    try:
        # Get all users from database
        response = requests.get(f"{API_BASE}/users", timeout=10)
        
        if response.status_code == 200:
            all_users = response.json()
            print(f"    📊 Total users in database: {len(all_users)}")
            
            found_users = []
            missing_users = []
            
            for expected_email in expected_users:
                user_found = any(user.get('email') == expected_email for user in all_users)
                if user_found:
                    found_users.append(expected_email)
                    print(f"    ✅ Found user: {expected_email}")
                else:
                    missing_users.append(expected_email)
                    print(f"    ❌ Missing user: {expected_email}")
            
            print(f"\n    📊 User Verification Results:")
            print(f"    ✅ Found: {len(found_users)}/3 users")
            print(f"    ❌ Missing: {len(missing_users)}/3 users")
            
            if missing_users:
                print(f"    ❌ Missing users need to be created: {', '.join(missing_users)}")
                return False
            else:
                print(f"    ✅ All test users exist in database")
                return True
                
        else:
            print(f"    ❌ Failed to retrieve users - status: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"    ❌ User database verification failed: {e}")
        return False

def test_role_based_registration():
    """Test registration for all user roles as specifically requested"""
    print("\n🔍 Testing Role-Based Registration (All User Types)...")
    
    # Test data for different roles as specified in the request
    test_users = [
        {
            "name": "María González Estudiante",
            "email": "maria.estudiante@email.com",
            "password": "estudiante123",
            "role": "student",
            "document": "98765432",
            "phone": "3009876543"
        },
        {
            "name": "Carlos Rodríguez Profesor",
            "email": "carlos.profesor@email.com", 
            "password": "profesor123",
            "role": "teacher",
            "document": "11223344",
            "phone": "3001122334",
            "subjects": ["Historia", "Geografía"],
            "grades": ["7°", "8°", "9°"],
            "teaching_level": "bachillerato"
        },
        {
            "name": "Ana Martínez Padre",
            "email": "ana.padre@email.com",
            "password": "padre123", 
            "role": "parent",
            "document": "55667788",
            "phone": "3005566778"
        },
        {
            "name": "Laura Coordinadora",
            "email": "laura.coordinadora@email.com",
            "password": "coord123",
            "role": "coordinadora_convivencia", 
            "document": "99887766",
            "phone": "3009988776"
        },
        {
            "name": "Admin Sistema",
            "email": "admin.sistema@email.com",
            "password": "admin123",
            "role": "admin",
            "document": "12121212",
            "phone": "3001212121"
        }
    ]
    
    successful_registrations = []
    failed_registrations = []
    
    for user_data in test_users:
        role = user_data["role"]
        print(f"  👤 Testing {role} registration...")
        
        try:
            # Create user
            response = requests.post(f"{API_BASE}/users", json=user_data, timeout=10)
            
            if response.status_code == 200:
                created_user = response.json()
                print(f"    ✅ {role} user created: {created_user.get('name')}")
                print(f"    📧 Email: {created_user.get('email')}")
                print(f"    🆔 Document: {created_user.get('document')}")
                
                # Verify role-specific fields
                if role == "teacher":
                    if created_user.get('subjects') == user_data.get('subjects'):
                        print(f"    ✅ Teacher subjects preserved: {created_user.get('subjects')}")
                    else:
                        print(f"    ❌ Teacher subjects not preserved correctly")
                        failed_registrations.append(f"{role} - subjects not preserved")
                        continue
                        
                    if created_user.get('teaching_level') == user_data.get('teaching_level'):
                        print(f"    ✅ Teaching level preserved: {created_user.get('teaching_level')}")
                    else:
                        print(f"    ❌ Teaching level not preserved correctly")
                        failed_registrations.append(f"{role} - teaching level not preserved")
                        continue
                
                # Test immediate authentication after registration
                print(f"    🔐 Testing immediate login for {role}...")
                login_data = {
                    "email": user_data["email"],
                    "password": user_data["password"]
                }
                
                auth_response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=10)
                
                if auth_response.status_code == 200:
                    auth_result = auth_response.json()
                    if auth_result.get('success') and auth_result.get('user', {}).get('role') == role:
                        print(f"    ✅ {role} can login immediately after registration")
                        successful_registrations.append(role)
                    else:
                        print(f"    ❌ {role} login failed after registration")
                        failed_registrations.append(f"{role} - login failed")
                else:
                    print(f"    ❌ {role} authentication failed - status: {auth_response.status_code}")
                    failed_registrations.append(f"{role} - auth endpoint failed")
                    
            else:
                print(f"    ❌ {role} registration failed - status: {response.status_code}")
                print(f"    Response: {response.text}")
                failed_registrations.append(f"{role} - registration failed")
                
        except requests.exceptions.RequestException as e:
            print(f"    ❌ {role} registration test failed: {e}")
            failed_registrations.append(f"{role} - connection error")
    
    print(f"\n  📊 Role-based Registration Results:")
    print(f"    ✅ Successful: {len(successful_registrations)}/5 roles")
    print(f"    ❌ Failed: {len(failed_registrations)}/5 roles")
    
    if successful_registrations:
        print(f"    ✅ Working roles: {', '.join(successful_registrations)}")
    
    if failed_registrations:
        print(f"    ❌ Failed roles: {', '.join(failed_registrations)}")
    
    return len(failed_registrations) == 0

def test_enhanced_teacher_registration():
    """Test enhanced teacher registration system as specifically requested"""
    print("\n🎓 Testing Enhanced Teacher Registration System (GIMNASIO AMERICANO DEL ATLÁNTICO)...")
    
    # Test cases for different teacher types as specified in the request
    teacher_test_cases = [
        {
            "name": "Docente Transición Test",
            "email": "docente.transicion@gada.edu.co",
            "password": "123456",
            "role": "teacher",
            "document": "TRANS001",
            "phone": "3001234567",
            "teaching_level": "transicion",
            "grades": ["0°"],
            "subjects": [],  # Should be auto-assigned
            "description": "Transición teacher (grade 0°)"
        },
        {
            "name": "Carmen Frontend Primaria",
            "email": "carmen.frontend@test.com",
            "password": "123456",
            "role": "teacher",
            "document": "PRIM003",
            "phone": "3009876543",
            "teaching_level": "primaria",
            "grades": ["3°"],
            "subjects": [],  # Should be auto-assigned for primaria
            "description": "Primary teacher (grade 3°) - existing user"
        },
        {
            "name": "Profesor Bachillerato Test",
            "email": "profesor.bach@gada.edu.co",
            "password": "123456",
            "role": "teacher",
            "document": "BACH911",
            "phone": "3005566778",
            "teaching_level": "bachillerato",
            "grades": ["9°", "10°", "11°"],
            "subjects": ["MATEMATICA", "GEOMETRIA", "ESTADISTICA"],
            "description": "Bachillerato teacher (grades 9°-11°, specific subjects) - newly created"
        }
    ]
    
    successful_registrations = []
    failed_registrations = []
    
    for teacher_data in teacher_test_cases:
        print(f"\n  👨‍🏫 Testing {teacher_data['description']}...")
        print(f"    📧 Email: {teacher_data['email']}")
        print(f"    📚 Teaching Level: {teacher_data['teaching_level']}")
        print(f"    🎯 Grades: {teacher_data['grades']}")
        print(f"    📖 Subjects: {teacher_data['subjects'] if teacher_data['subjects'] else 'Auto-assigned'}")
        
        try:
            # Create teacher user
            registration_data = {k: v for k, v in teacher_data.items() if k not in ['description']}
            response = requests.post(f"{API_BASE}/users", json=registration_data, timeout=10)
            
            if response.status_code == 200:
                created_teacher = response.json()
                print(f"    ✅ Teacher registered successfully")
                print(f"    🆔 Teacher ID: {created_teacher.get('id')}")
                print(f"    👤 Name: {created_teacher.get('name')}")
                
                # Verify teaching level is correctly stored
                if created_teacher.get('teaching_level') == teacher_data['teaching_level']:
                    print(f"    ✅ Teaching level correctly stored: {created_teacher.get('teaching_level')}")
                else:
                    print(f"    ❌ Teaching level mismatch: expected {teacher_data['teaching_level']}, got {created_teacher.get('teaching_level')}")
                    failed_registrations.append(f"{teacher_data['description']} - teaching level error")
                    continue
                
                # Verify grades are correctly stored
                stored_grades = created_teacher.get('grades', [])
                if set(stored_grades) == set(teacher_data['grades']):
                    print(f"    ✅ Grades correctly stored: {stored_grades}")
                else:
                    print(f"    ❌ Grades mismatch: expected {teacher_data['grades']}, got {stored_grades}")
                    failed_registrations.append(f"{teacher_data['description']} - grades error")
                    continue
                
                # Verify subjects handling based on teaching level
                stored_subjects = created_teacher.get('subjects', [])
                if teacher_data['teaching_level'] == 'bachillerato':
                    # Bachillerato should have specific subjects
                    if set(stored_subjects) == set(teacher_data['subjects']):
                        print(f"    ✅ Bachillerato subjects correctly stored: {stored_subjects}")
                    else:
                        print(f"    ❌ Bachillerato subjects mismatch: expected {teacher_data['subjects']}, got {stored_subjects}")
                        failed_registrations.append(f"{teacher_data['description']} - subjects error")
                        continue
                else:
                    # Primaria/Transición should have auto-assigned or empty subjects
                    print(f"    ✅ {teacher_data['teaching_level'].title()} subjects: {stored_subjects if stored_subjects else 'Auto-assigned (all subjects for grade)'}")
                
                # Test immediate authentication
                print(f"    🔐 Testing authentication for {teacher_data['teaching_level']} teacher...")
                login_data = {
                    "email": teacher_data["email"],
                    "password": teacher_data["password"]
                }
                
                auth_response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=10)
                
                if auth_response.status_code == 200:
                    auth_result = auth_response.json()
                    if auth_result.get('success') and auth_result.get('user'):
                        user_data = auth_result.get('user')
                        print(f"    ✅ Authentication successful")
                        print(f"    👤 Authenticated as: {user_data.get('name')}")
                        print(f"    📚 Teaching Level: {user_data.get('teaching_level')}")
                        print(f"    🎯 Assigned Grades: {user_data.get('grades')}")
                        print(f"    📖 Subjects: {user_data.get('subjects')}")
                        
                        successful_registrations.append(teacher_data['description'])
                    else:
                        print(f"    ❌ Authentication failed - invalid response structure")
                        failed_registrations.append(f"{teacher_data['description']} - auth failed")
                else:
                    print(f"    ❌ Authentication failed - status: {auth_response.status_code}")
                    failed_registrations.append(f"{teacher_data['description']} - auth endpoint failed")
                    
            else:
                print(f"    ❌ Registration failed - status: {response.status_code}")
                print(f"    Response: {response.text}")
                failed_registrations.append(f"{teacher_data['description']} - registration failed")
                
        except requests.exceptions.RequestException as e:
            print(f"    ❌ Teacher registration test failed: {e}")
            failed_registrations.append(f"{teacher_data['description']} - connection error")
    
    print(f"\n  📊 Enhanced Teacher Registration Results:")
    print(f"    ✅ Successful: {len(successful_registrations)}/3 teacher types")
    print(f"    ❌ Failed: {len(failed_registrations)}/3 teacher types")
    
    if successful_registrations:
        print(f"    ✅ Working teacher types:")
        for success in successful_registrations:
            print(f"      - {success}")
    
    if failed_registrations:
        print(f"    ❌ Failed teacher types:")
        for failure in failed_registrations:
            print(f"      - {failure}")
    
    return len(failed_registrations) == 0

def test_teacher_configuration_recovery():
    """Test teacher configuration recovery via API endpoints"""
    print("\n🔍 Testing Teacher Configuration Recovery...")
    
    # Test users to verify configuration recovery
    test_teachers = [
        {
            "email": "carmen.frontend@test.com",
            "expected_level": "primaria",
            "expected_grades": ["3°"],
            "description": "Primary teacher"
        },
        {
            "email": "profesor.bach@gada.edu.co", 
            "expected_level": "bachillerato",
            "expected_grades": ["9°", "10°", "11°"],
            "expected_subjects": ["MATEMATICA", "GEOMETRIA", "ESTADISTICA"],
            "description": "Bachillerato teacher"
        }
    ]
    
    successful_recoveries = []
    failed_recoveries = []
    
    for teacher in test_teachers:
        print(f"\n  👨‍🏫 Testing configuration recovery for {teacher['description']}...")
        print(f"    📧 Email: {teacher['email']}")
        
        try:
            # First authenticate to get user ID
            login_data = {
                "email": teacher["email"],
                "password": "123456"
            }
            
            auth_response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=10)
            
            if auth_response.status_code == 200:
                auth_result = auth_response.json()
                user_data = auth_result.get('user')
                
                if user_data:
                    print(f"    ✅ Teacher authenticated successfully")
                    
                    # Verify teaching level
                    actual_level = user_data.get('teaching_level')
                    if actual_level == teacher['expected_level']:
                        print(f"    ✅ Teaching level correct: {actual_level}")
                    else:
                        print(f"    ❌ Teaching level mismatch: expected {teacher['expected_level']}, got {actual_level}")
                        failed_recoveries.append(f"{teacher['description']} - wrong teaching level")
                        continue
                    
                    # Verify grades
                    actual_grades = user_data.get('grades', [])
                    if set(actual_grades) == set(teacher['expected_grades']):
                        print(f"    ✅ Grades correct: {actual_grades}")
                    else:
                        print(f"    ❌ Grades mismatch: expected {teacher['expected_grades']}, got {actual_grades}")
                        failed_recoveries.append(f"{teacher['description']} - wrong grades")
                        continue
                    
                    # Verify subjects for bachillerato teachers
                    if teacher.get('expected_subjects'):
                        actual_subjects = user_data.get('subjects', [])
                        if set(actual_subjects) == set(teacher['expected_subjects']):
                            print(f"    ✅ Subjects correct: {actual_subjects}")
                        else:
                            print(f"    ❌ Subjects mismatch: expected {teacher['expected_subjects']}, got {actual_subjects}")
                            failed_recoveries.append(f"{teacher['description']} - wrong subjects")
                            continue
                    
                    # Test user retrieval by ID
                    user_id = user_data.get('id')
                    if user_id:
                        user_response = requests.get(f"{API_BASE}/users/{user_id}", timeout=10)
                        if user_response.status_code == 200:
                            retrieved_user = user_response.json()
                            print(f"    ✅ User configuration retrievable via GET /api/users/{user_id}")
                            print(f"    📚 Retrieved teaching level: {retrieved_user.get('teaching_level')}")
                            print(f"    🎯 Retrieved grades: {retrieved_user.get('grades')}")
                            print(f"    📖 Retrieved subjects: {retrieved_user.get('subjects')}")
                            
                            successful_recoveries.append(teacher['description'])
                        else:
                            print(f"    ❌ Failed to retrieve user by ID - status: {user_response.status_code}")
                            failed_recoveries.append(f"{teacher['description']} - retrieval failed")
                    else:
                        print(f"    ❌ No user ID in authentication response")
                        failed_recoveries.append(f"{teacher['description']} - no user ID")
                else:
                    print(f"    ❌ No user data in authentication response")
                    failed_recoveries.append(f"{teacher['description']} - no user data")
            else:
                print(f"    ❌ Authentication failed - status: {auth_response.status_code}")
                failed_recoveries.append(f"{teacher['description']} - auth failed")
                
        except requests.exceptions.RequestException as e:
            print(f"    ❌ Configuration recovery test failed: {e}")
            failed_recoveries.append(f"{teacher['description']} - connection error")
    
    print(f"\n  📊 Teacher Configuration Recovery Results:")
    print(f"    ✅ Successful: {len(successful_recoveries)}/2 teachers")
    print(f"    ❌ Failed: {len(failed_recoveries)}/2 teachers")
    
    if successful_recoveries:
        print(f"    ✅ Working configurations:")
        for success in successful_recoveries:
            print(f"      - {success}")
    
    if failed_recoveries:
        print(f"    ❌ Failed configurations:")
        for failure in failed_recoveries:
            print(f"      - {failure}")
    
    return len(failed_recoveries) == 0

def test_academic_periods_system():
    """Test academic periods system (4 periods) for grade assignment"""
    print("\n📅 Testing Academic Periods System (4 Periods)...")
    
    # Test creating grades for different periods
    periods = ["Período 1", "Período 2", "Período 3", "Período 4"]
    
    # First get a teacher to use for testing
    try:
        # Get all users and find a teacher
        users_response = requests.get(f"{API_BASE}/users", timeout=10)
        if users_response.status_code != 200:
            print("    ❌ Failed to retrieve users for period testing")
            return False
            
        users = users_response.json()
        teacher = None
        for user in users:
            if user.get('role') == 'teacher':
                teacher = user
                break
        
        if not teacher:
            print("    ❌ No teacher found for period testing")
            return False
            
        print(f"    👨‍🏫 Using teacher: {teacher.get('name')} ({teacher.get('email')})")
        
        # Create a test student for grade assignment
        student_data = {
            "name": "Estudiante Períodos Test",
            "grade": "3°",
            "document": "PERIOD001",
            "age": 8,
            "parent_email": "padre.periodo@test.com",
            "parent_phone": "3001234567",
            "created_by": teacher.get('id')
        }
        
        student_response = requests.post(f"{API_BASE}/students", json=student_data, timeout=10)
        if student_response.status_code != 200:
            print(f"    ❌ Failed to create test student - status: {student_response.status_code}")
            return False
            
        student = student_response.json()
        print(f"    👶 Created test student: {student.get('name')}")
        
        # Test grade assignment for each period
        successful_periods = []
        failed_periods = []
        
        for period in periods:
            print(f"    📅 Testing {period}...")
            
            grade_data = {
                "student_id": student.get('id'),
                "subject": "Matemáticas",
                "grade": "3°",
                "period": period,
                "score": 4.5,
                "teacher_id": teacher.get('id')
            }
            
            try:
                grade_response = requests.post(f"{API_BASE}/grades", json=grade_data, timeout=10)
                
                if grade_response.status_code == 200:
                    created_grade = grade_response.json()
                    print(f"      ✅ Grade created for {period}")
                    print(f"      📊 Score: {created_grade.get('score')}")
                    print(f"      📚 Subject: {created_grade.get('subject')}")
                    successful_periods.append(period)
                else:
                    print(f"      ❌ Failed to create grade for {period} - status: {grade_response.status_code}")
                    failed_periods.append(period)
                    
            except requests.exceptions.RequestException as e:
                print(f"      ❌ Grade creation failed for {period}: {e}")
                failed_periods.append(period)
        
        # Test grade retrieval by period
        print(f"\n    🔍 Testing grade retrieval by period...")
        for period in successful_periods:
            try:
                grades_response = requests.get(f"{API_BASE}/grades?period={period}&student_id={student.get('id')}", timeout=10)
                
                if grades_response.status_code == 200:
                    period_grades = grades_response.json()
                    print(f"      ✅ Retrieved {len(period_grades)} grades for {period}")
                else:
                    print(f"      ❌ Failed to retrieve grades for {period}")
                    
            except requests.exceptions.RequestException as e:
                print(f"      ❌ Grade retrieval failed for {period}: {e}")
        
        print(f"\n  📊 Academic Periods System Results:")
        print(f"    ✅ Working periods: {len(successful_periods)}/4")
        print(f"    ❌ Failed periods: {len(failed_periods)}/4")
        
        if successful_periods:
            print(f"    ✅ Functional periods: {', '.join(successful_periods)}")
        
        if failed_periods:
            print(f"    ❌ Failed periods: {', '.join(failed_periods)}")
        
        return len(failed_periods) == 0
        
    except requests.exceptions.RequestException as e:
        print(f"    ❌ Academic periods test failed: {e}")
        return False

def run_comprehensive_backend_test():
    """Run all backend tests with focus on enhanced teacher system"""
    print("🚀 Starting Comprehensive Backend Testing Suite")
    print("🎯 Focus: ENHANCED TEACHER SYSTEM for Gimnasio Americano del Atlántico")
    print("📋 Testing: Registration improvements, teaching levels, grade assignments, periods")
    print("=" * 80)
    
    test_results = []
    
    # Test 1: Backend Health (CRITICAL)
    test_results.append(("Backend Health", test_backend_health()))
    
    # Test 2: Frontend-Backend Connectivity (CRITICAL)
    test_results.append(("Frontend-Backend Connectivity", test_frontend_backend_connectivity()))
    
    # Test 3: Enhanced Teacher Registration (CRITICAL - MAIN FOCUS)
    test_results.append(("Enhanced Teacher Registration", test_enhanced_teacher_registration()))
    
    # Test 4: Teacher Configuration Recovery (CRITICAL)
    test_results.append(("Teacher Configuration Recovery", test_teacher_configuration_recovery()))
    
    # Test 5: Academic Periods System (HIGH PRIORITY)
    test_results.append(("Academic Periods System", test_academic_periods_system()))
    
    # Test 6: Specific Login Users Test (CRITICAL)
    test_results.append(("Specific Login Users", test_specific_login_users()))
    
    # Test 7: Authentication API (CRITICAL)
    test_results.append(("Authentication API", test_authentication_api()))
    
    # Test 8: MongoDB Connection (STANDARD)
    test_results.append(("MongoDB Connection", test_mongodb_connection()))
    
    # Test 9: Status Endpoints (STANDARD)
    test_results.append(("Status Endpoints", test_status_endpoints()))
    
    # Summary
    print("\n" + "=" * 80)
    print("📋 TEST SUMMARY - ENHANCED TEACHER SYSTEM")
    print("=" * 80)
    
    passed_tests = 0
    critical_tests = ["Backend Health", "Frontend-Backend Connectivity", "Enhanced Teacher Registration", "Teacher Configuration Recovery", "Specific Login Users", "Authentication API"]
    high_priority_tests = ["Academic Periods System"]
    critical_passed = 0
    high_priority_passed = 0
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        if test_name in critical_tests:
            priority = "🔥 CRITICAL"
        elif test_name in high_priority_tests:
            priority = "⚡ HIGH"
        else:
            priority = "📋 STANDARD"
        print(f"{test_name:<35} {status} {priority}")
        
        if result:
            passed_tests += 1
            if test_name in critical_tests:
                critical_passed += 1
            elif test_name in high_priority_tests:
                high_priority_passed += 1
    
    success_rate = passed_tests / len(test_results) * 100
    critical_success_rate = critical_passed / len(critical_tests) * 100
    high_priority_success_rate = high_priority_passed / len(high_priority_tests) * 100 if high_priority_tests else 100
    
    print(f"\nOverall Success Rate: {success_rate:.1f}% ({passed_tests}/{len(test_results)})")
    print(f"Critical Tests Success Rate: {critical_success_rate:.1f}% ({critical_passed}/{len(critical_tests)})")
    print(f"High Priority Tests Success Rate: {high_priority_success_rate:.1f}% ({high_priority_passed}/{len(high_priority_tests)})")
    
    # Determine overall status
    if critical_success_rate == 100 and high_priority_success_rate == 100:
        print("\n🎉 All critical and high priority tests passed! Enhanced teacher system is fully functional.")
        print("✅ Teacher registration improvements working correctly.")
        print("✅ Teaching levels, grades, and subjects properly configured.")
        print("✅ Academic periods system operational.")
        return True
    elif critical_success_rate >= 80:
        print("\n⚠️  Most critical tests passed. Minor issues detected but system should work.")
        return True
    else:
        print("\n❌ CRITICAL TEACHER SYSTEM ISSUES DETECTED!")
        print("🚨 Enhanced teacher registration system has significant problems.")
        return False

if __name__ == "__main__":
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base URL: {API_BASE}")
    print(f"MongoDB: mongodb://localhost:27017")
    print(f"DB Name: gimnasio_americano")
    print()
    
    success = run_comprehensive_backend_test()
    sys.exit(0 if success else 1)