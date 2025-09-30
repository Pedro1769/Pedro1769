#!/usr/bin/env python3
"""
Specific User Registration Test for Gimnasio Americano del Atlántico
Tests the exact functionality requested by the user
"""

import requests
import json
import sys
from datetime import datetime

# Backend configuration
BACKEND_URL = "http://localhost:8001"
API_BASE = f"{BACKEND_URL}/api"

def test_specific_teacher_registration():
    """Test the exact teacher registration data requested"""
    print("🎯 Testing Specific Teacher Registration as Requested")
    print("=" * 60)
    
    # Exact data as specified in the request
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
    
    print(f"📝 Creating teacher with data:")
    print(f"   Name: {teacher_data['name']}")
    print(f"   Email: {teacher_data['email']}")
    print(f"   Role: {teacher_data['role']}")
    print(f"   Document: {teacher_data['document']}")
    
    try:
        # 1. Test POST /api/users (crear usuario)
        print("\n🔍 Step 1: Testing POST /api/users (crear usuario)")
        response = requests.post(f"{API_BASE}/users", json=teacher_data, timeout=10)
        
        if response.status_code == 200:
            created_user = response.json()
            print("✅ User created successfully!")
            print(f"   User ID: {created_user.get('id')}")
            print(f"   Name: {created_user.get('name')}")
            print(f"   Email: {created_user.get('email')}")
            print(f"   Role: {created_user.get('role')}")
            print(f"   Document: {created_user.get('document')}")
            
            # 2. Verify user is saved in MongoDB
            print("\n🔍 Step 2: Verifying user is saved in MongoDB")
            get_response = requests.get(f"{API_BASE}/users", timeout=10)
            
            if get_response.status_code == 200:
                all_users = get_response.json()
                found_user = None
                
                for user in all_users:
                    if user.get('email') == teacher_data['email']:
                        found_user = user
                        break
                
                if found_user:
                    print("✅ User found in MongoDB!")
                    print(f"   Persisted Name: {found_user.get('name')}")
                    print(f"   Persisted Email: {found_user.get('email')}")
                    print(f"   Persisted Document: {found_user.get('document')}")
                    print(f"   Persisted Role: {found_user.get('role')}")
                else:
                    print("❌ User not found in MongoDB!")
                    return False
            else:
                print(f"❌ Failed to retrieve users from MongoDB")
                return False
            
            # 3. Test POST /api/auth (login)
            print("\n🔍 Step 3: Testing POST /api/auth/login (login)")
            login_data = {
                "email": teacher_data["email"],
                "password": teacher_data["password"]
            }
            
            auth_response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=10)
            
            if auth_response.status_code == 200:
                auth_result = auth_response.json()
                print("✅ Authentication successful!")
                print(f"   Authenticated User: {auth_result.get('user', {}).get('name')}")
                print(f"   Token: {auth_result.get('token')}")
                print(f"   Success: {auth_result.get('success')}")
            else:
                print(f"❌ Authentication failed - status: {auth_response.status_code}")
                print(f"   Response: {auth_response.text}")
                return False
            
            # 4. Test GET /api/status (verificar estado general)
            print("\n🔍 Step 4: Testing GET /api/status (verificar estado general)")
            status_response = requests.get(f"{API_BASE}/status", timeout=10)
            
            if status_response.status_code == 200:
                status_data = status_response.json()
                print(f"✅ Status endpoint working - {len(status_data)} status checks found")
            else:
                print(f"❌ Status endpoint failed - status: {status_response.status_code}")
                return False
            
            # 5. Test GET /api/users (listar usuarios)
            print("\n🔍 Step 5: Testing GET /api/users (listar usuarios)")
            users_response = requests.get(f"{API_BASE}/users", timeout=10)
            
            if users_response.status_code == 200:
                users_data = users_response.json()
                print(f"✅ Users endpoint working - {len(users_data)} users found")
                
                # Show user statistics
                roles = {}
                for user in users_data:
                    role = user.get('role', 'unknown')
                    roles[role] = roles.get(role, 0) + 1
                
                print("   User roles distribution:")
                for role, count in roles.items():
                    print(f"     - {role}: {count}")
            else:
                print(f"❌ Users endpoint failed - status: {users_response.status_code}")
                return False
            
            print("\n🎉 ALL TESTS PASSED!")
            print("✅ User registration working correctly")
            print("✅ MongoDB persistence verified")
            print("✅ Authentication system functional")
            print("✅ All requested endpoints working")
            
            return True
            
        else:
            print(f"❌ Failed to create user - status: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Test failed with connection error: {e}")
        return False

def test_mongodb_connection():
    """Test MongoDB connection specifically"""
    print("\n🔍 Testing MongoDB Connection (mongodb://localhost:27017)")
    print("   Database: gimnasio_americano")
    
    try:
        # Test by creating a status check
        test_data = {"client_name": "MongoDB Connection Test"}
        response = requests.post(f"{API_BASE}/status", json=test_data, timeout=10)
        
        if response.status_code == 200:
            print("✅ MongoDB connection working")
            print("✅ Data can be written to database")
            return True
        else:
            print(f"❌ MongoDB connection failed - status: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ MongoDB connection test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Specific Registration Test for Gimnasio Americano del Atlántico")
    print(f"Backend: {BACKEND_URL}")
    print(f"MongoDB: mongodb://localhost:27017")
    print(f"Database: gimnasio_americano")
    print()
    
    # Test MongoDB connection first
    mongodb_ok = test_mongodb_connection()
    
    if not mongodb_ok:
        print("\n❌ MongoDB connection failed - cannot proceed with registration tests")
        sys.exit(1)
    
    # Test specific registration functionality
    success = test_specific_teacher_registration()
    
    if success:
        print("\n🎉 CONCLUSION: User registration functionality is WORKING CORRECTLY")
        print("✅ Teachers can register successfully")
        print("✅ Data is persisted in MongoDB")
        print("✅ Authentication works immediately after registration")
        print("✅ All API endpoints are functional")
        sys.exit(0)
    else:
        print("\n❌ CONCLUSION: User registration has ISSUES that need attention")
        sys.exit(1)