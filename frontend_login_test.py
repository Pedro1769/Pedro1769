#!/usr/bin/env python3
"""
Frontend Login Simulation Test
Simulates exactly what the frontend is doing when users try to login
"""

import requests
import json

# Use the exact same URL that frontend uses
FRONTEND_BACKEND_URL = "https://period-selector-fix.preview.emergentagent.com"
LOGIN_ENDPOINT = f"{FRONTEND_BACKEND_URL}/api/auth/login"

def test_frontend_login_simulation():
    """Simulate exactly what the frontend does when a user tries to login"""
    print("🔍 FRONTEND LOGIN SIMULATION TEST")
    print("=" * 50)
    
    # Test users as specified in the request
    test_users = [
        {
            "email": "carmen.frontend@test.com",
            "password": "123456",
            "name": "Carmen Frontend (Teacher)"
        },
        {
            "email": "maria.estudiante@email.com", 
            "password": "estudiante123",
            "name": "María Estudiante (Student)"
        },
        {
            "email": "marielacarolinas@hotmail.com",
            "password": "Convi1234", 
            "name": "Mariela Carolinas (Coordinadora)"
        }
    ]
    
    print(f"🌐 Frontend Backend URL: {FRONTEND_BACKEND_URL}")
    print(f"🔗 Login Endpoint: {LOGIN_ENDPOINT}")
    print()
    
    for user in test_users:
        print(f"🔐 Testing login for: {user['name']}")
        print(f"📧 Email: {user['email']}")
        print(f"🔑 Password: {user['password']}")
        
        # Simulate the exact request that frontend makes
        headers = {
            'Content-Type': 'application/json',
            'Origin': FRONTEND_BACKEND_URL,
            'Referer': f"{FRONTEND_BACKEND_URL}/",
            'User-Agent': 'Mozilla/5.0 (Frontend Simulation)'
        }
        
        login_data = {
            "email": user["email"],
            "password": user["password"]
        }
        
        try:
            print("  📤 Sending login request...")
            response = requests.post(
                LOGIN_ENDPOINT, 
                json=login_data, 
                headers=headers,
                timeout=10
            )
            
            print(f"  📥 Response Status: {response.status_code}")
            print(f"  📥 Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                result = response.json()
                print("  ✅ LOGIN SUCCESSFUL!")
                print(f"  👤 User: {result.get('user', {}).get('name', 'Unknown')}")
                print(f"  👤 Role: {result.get('user', {}).get('role', 'Unknown')}")
                print(f"  🎫 Token: {'Present' if result.get('token') else 'Missing'}")
                print(f"  ✅ Success Flag: {result.get('success', False)}")
                
            elif response.status_code == 401:
                print("  ❌ LOGIN FAILED - 401 Unauthorized")
                print(f"  📄 Response: {response.text}")
                
            elif response.status_code == 404:
                print("  ❌ LOGIN FAILED - 404 Not Found")
                print("  🚨 This means the login endpoint is not accessible!")
                print(f"  📄 Response: {response.text}")
                
            else:
                print(f"  ❌ LOGIN FAILED - HTTP {response.status_code}")
                print(f"  📄 Response: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"  ❌ CONNECTION ERROR: {e}")
            
        print("-" * 50)

def test_network_connectivity():
    """Test basic network connectivity to the backend"""
    print("\n🌐 NETWORK CONNECTIVITY TEST")
    print("=" * 50)
    
    endpoints_to_test = [
        f"{FRONTEND_BACKEND_URL}/api/",
        f"{FRONTEND_BACKEND_URL}/api/users",
        f"{FRONTEND_BACKEND_URL}/api/status"
    ]
    
    for endpoint in endpoints_to_test:
        print(f"🔗 Testing: {endpoint}")
        try:
            response = requests.get(endpoint, timeout=10)
            print(f"  ✅ Status: {response.status_code}")
            if response.status_code == 200:
                print(f"  📊 Response length: {len(response.text)} chars")
            else:
                print(f"  📄 Response: {response.text[:200]}...")
        except requests.exceptions.RequestException as e:
            print(f"  ❌ Error: {e}")
        print()

if __name__ == "__main__":
    test_network_connectivity()
    test_frontend_login_simulation()