#!/usr/bin/env python3
"""
Comprehensive Backend Testing - Student System
Sistema de Gestión Escolar GAA - Student Management Tests
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration - Using environment variable from frontend/.env
BASE_URL = "https://user-auth-fix-7.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Test users from contracts.md
TEST_USERS = {
    "admin": {"username": "pedro.hurtado", "password": "gim123"},
    "docente_primaria": {"username": "yocelyn.cabarcas", "password": "gim123"},
    "docente_bachillerato": {"username": "carolina.sierra", "password": "gim123"},
    "coordinadora": {"username": "coord.convivencia", "password": "gim123"}
}

class AuthTester:
    def __init__(self):
        self.session = requests.Session()
        self.tokens = {}
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    Details: {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")
        print()

    def test_health_check(self):
        """Test basic API health"""
        try:
            response = self.session.get(f"{BASE_URL}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Health Check", True, f"Status: {data.get('status', 'unknown')}")
                return True
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
            return False

    def test_login_success(self, user_type: str, credentials: Dict[str, str]):
        """Test successful login for each user type"""
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=credentials,
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    # Store token for later tests
                    self.tokens[user_type] = data["token"]
                    user_info = data.get("user", {})
                    self.log_test(
                        f"Login Success - {user_type}",
                        True,
                        f"User: {user_info.get('name', 'Unknown')}, Role: {user_info.get('role', 'Unknown')}"
                    )
                    return True
                else:
                    self.log_test(
                        f"Login Success - {user_type}",
                        False,
                        "Missing success flag or token in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    f"Login Success - {user_type}",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(f"Login Success - {user_type}", False, f"Request error: {str(e)}")
            return False

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        invalid_creds = {"username": "invalid_user", "password": "wrong_password"}
        
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=invalid_creds,
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_test("Login Invalid Credentials", True, "Correctly rejected invalid credentials")
                return True
            else:
                self.log_test(
                    "Login Invalid Credentials",
                    False,
                    f"Expected 401, got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Login Invalid Credentials", False, f"Request error: {str(e)}")
            return False

    def test_login_wrong_password(self):
        """Test login with correct username but wrong password"""
        wrong_creds = {"username": "pedro.hurtado", "password": "wrong_password"}
        
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=wrong_creds,
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_test("Login Wrong Password", True, "Correctly rejected wrong password")
                return True
            else:
                self.log_test(
                    "Login Wrong Password",
                    False,
                    f"Expected 401, got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Login Wrong Password", False, f"Request error: {str(e)}")
            return False

    def test_profile_with_token(self, user_type: str):
        """Test profile endpoint with valid JWT token"""
        if user_type not in self.tokens:
            self.log_test(f"Profile Access - {user_type}", False, "No token available for user")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/auth/profile",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("username") and data.get("role"):
                    self.log_test(
                        f"Profile Access - {user_type}",
                        True,
                        f"Profile retrieved: {data.get('name', 'Unknown')}"
                    )
                    return True
                else:
                    self.log_test(
                        f"Profile Access - {user_type}",
                        False,
                        "Missing required profile fields",
                        data
                    )
                    return False
            else:
                self.log_test(
                    f"Profile Access - {user_type}",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(f"Profile Access - {user_type}", False, f"Request error: {str(e)}")
            return False

    def test_profile_without_token(self):
        """Test profile endpoint without authentication"""
        try:
            response = self.session.get(
                f"{BASE_URL}/auth/profile",
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 401 or response.status_code == 403:
                self.log_test("Profile No Auth", True, "Correctly rejected unauthenticated request")
                return True
            else:
                self.log_test(
                    "Profile No Auth",
                    False,
                    f"Expected 401/403, got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Profile No Auth", False, f"Request error: {str(e)}")
            return False

    def test_profile_invalid_token(self):
        """Test profile endpoint with invalid token"""
        try:
            headers = {
                **HEADERS,
                "Authorization": "Bearer invalid_token_here"
            }
            
            response = self.session.get(
                f"{BASE_URL}/auth/profile",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_test("Profile Invalid Token", True, "Correctly rejected invalid token")
                return True
            else:
                self.log_test(
                    "Profile Invalid Token",
                    False,
                    f"Expected 401, got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Profile Invalid Token", False, f"Request error: {str(e)}")
            return False

    def test_register_new_user(self):
        """Test user registration"""
        new_user_data = {
            "username": f"test_parent_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "password": "test123",
            "name": "Padre de Prueba",
            "email": f"test_parent_{datetime.now().strftime('%Y%m%d_%H%M%S')}@test.com",
            "phone": "3001234567",
            "role": "padre"
        }
        
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/register",
                json=new_user_data,
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.log_test(
                        "User Registration",
                        True,
                        f"User registered: {data.get('user', {}).get('name', 'Unknown')}"
                    )
                    return True
                else:
                    self.log_test(
                        "User Registration",
                        False,
                        "Missing success flag or token in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "User Registration",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("User Registration", False, f"Request error: {str(e)}")
            return False

    def test_register_duplicate_user(self):
        """Test registration with existing username"""
        duplicate_user_data = {
            "username": "pedro.hurtado",  # Existing admin user
            "password": "test123",
            "name": "Duplicate User",
            "email": "duplicate@test.com",
            "role": "padre"
        }
        
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/register",
                json=duplicate_user_data,
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 400:
                self.log_test("Register Duplicate User", True, "Correctly rejected duplicate username")
                return True
            else:
                self.log_test(
                    "Register Duplicate User",
                    False,
                    f"Expected 400, got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Register Duplicate User", False, f"Request error: {str(e)}")
            return False

    def test_logout(self, user_type: str):
        """Test logout endpoint"""
        if user_type not in self.tokens:
            self.log_test(f"Logout - {user_type}", False, "No token available for user")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            response = self.session.post(
                f"{BASE_URL}/auth/logout",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test(f"Logout - {user_type}", True, "Successfully logged out")
                    return True
                else:
                    self.log_test(
                        f"Logout - {user_type}",
                        False,
                        "Missing success flag in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    f"Logout - {user_type}",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(f"Logout - {user_type}", False, f"Request error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run comprehensive authentication tests"""
        print("🚀 Starting Comprehensive Authentication Tests")
        print("=" * 60)
        
        # Test 1: Health check
        if not self.test_health_check():
            print("❌ Backend is not accessible. Stopping tests.")
            return False
        
        # Test 2: Login success for all user types
        login_success_count = 0
        for user_type, credentials in TEST_USERS.items():
            if self.test_login_success(user_type, credentials):
                login_success_count += 1
        
        # Test 3: Login failure scenarios
        self.test_login_invalid_credentials()
        self.test_login_wrong_password()
        
        # Test 4: Profile access with valid tokens
        for user_type in self.tokens.keys():
            self.test_profile_with_token(user_type)
        
        # Test 5: Profile access without authentication
        self.test_profile_without_token()
        self.test_profile_invalid_token()
        
        # Test 6: User registration
        self.test_register_new_user()
        self.test_register_duplicate_user()
        
        # Test 7: Logout
        for user_type in list(self.tokens.keys()):
            self.test_logout(user_type)
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        return failed_tests == 0

def main():
    """Main test execution"""
    tester = AuthTester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open("/app/auth_test_results.json", "w") as f:
        json.dump(tester.test_results, f, indent=2, default=str)
    
    print(f"\n📄 Detailed results saved to: /app/auth_test_results.json")
    
    if success:
        print("\n🎉 All authentication tests passed!")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check the details above.")
        sys.exit(1)

if __name__ == "__main__":
    main()