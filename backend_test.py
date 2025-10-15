#!/usr/bin/env python3
"""
Comprehensive Backend Testing - GAA Educational System
Sistema de Gestión Escolar GAA - Complete Backend Tests
Focus: Authentication, Students, and GRADES System (CRITICAL)
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional
import random

# Configuration - Using environment variable from frontend/.env
BASE_URL = "https://support-panels.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Test users as specified in the review request
TEST_USERS = {
    "admin": {"username": "pedro.hurtado", "password": "gim123"},
    "docente_bachillerato": {"username": "bifencia.orozco", "password": "gim123"},
    "docente_primaria": {"username": "yocelyn.cabarcas", "password": "gim123"},
    "coordinadora": {"username": "coord.convivencia", "password": "gim123"}
}

class GAABackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.tokens = {}
        self.test_results = []
        self.created_student_id = None
        
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

    def test_register_new_user_success(self):
        """Test successful registration of new user (SPECIFIC REVIEW REQUEST)"""
        new_user_data = {
            "username": "test_user_12345",
            "password": "test123",
            "name": "Usuario de Prueba",
            "email": "test12345@test.com",
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
                if data.get("success") and data.get("token") and data.get("user"):
                    user = data.get("user", {})
                    self.log_test(
                        "Register New User Success",
                        True,
                        f"User registered successfully: {user.get('name')} (username: {user.get('username')}, email: {user.get('email')})"
                    )
                    return True
                else:
                    self.log_test(
                        "Register New User Success",
                        False,
                        "Missing success flag, token, or user data in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Register New User Success",
                    False,
                    f"Expected 200, got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Register New User Success", False, f"Request error: {str(e)}")
            return False

    def test_register_duplicate_username(self):
        """Test registration with duplicate username (SPECIFIC REVIEW REQUEST)"""
        # First register a user
        first_user_data = {
            "username": "test_user_12345",
            "password": "test123",
            "name": "First User",
            "email": "first@test.com",
            "phone": "3001234567",
            "role": "padre"
        }
        
        # Try to register the same username again
        duplicate_user_data = {
            "username": "test_user_12345",  # Same username
            "password": "different123",
            "name": "Second User",
            "email": "second@test.com",
            "phone": "3009876543",
            "role": "padre"
        }
        
        try:
            # First registration (might already exist from previous test)
            self.session.post(
                f"{BASE_URL}/auth/register",
                json=first_user_data,
                headers=HEADERS,
                timeout=10
            )
            
            # Second registration with same username
            response = self.session.post(
                f"{BASE_URL}/auth/register",
                json=duplicate_user_data,
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json() if response.content else {}
                error_message = data.get("detail", "")
                if "nombre de usuario ya está en uso" in error_message.lower():
                    self.log_test(
                        "Register Duplicate Username",
                        True,
                        f"Correctly rejected duplicate username with message: {error_message}"
                    )
                    return True
                else:
                    self.log_test(
                        "Register Duplicate Username",
                        False,
                        f"Got 400 but wrong error message: {error_message}",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Register Duplicate Username",
                    False,
                    f"Expected 400 Bad Request, got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Register Duplicate Username", False, f"Request error: {str(e)}")
            return False

    def test_register_duplicate_email(self):
        """Test registration with duplicate email (SPECIFIC REVIEW REQUEST)"""
        # First user data
        first_user_data = {
            "username": "unique_user_1",
            "password": "test123",
            "name": "First User",
            "email": "shared@test.com",
            "phone": "3001234567",
            "role": "padre"
        }
        
        # Second user with same email
        duplicate_email_data = {
            "username": "unique_user_2",  # Different username
            "password": "test123",
            "name": "Second User",
            "email": "shared@test.com",  # Same email
            "phone": "3009876543",
            "role": "padre"
        }
        
        try:
            # First registration
            self.session.post(
                f"{BASE_URL}/auth/register",
                json=first_user_data,
                headers=HEADERS,
                timeout=10
            )
            
            # Second registration with same email
            response = self.session.post(
                f"{BASE_URL}/auth/register",
                json=duplicate_email_data,
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json() if response.content else {}
                error_message = data.get("detail", "")
                if "email ya está registrado" in error_message.lower():
                    self.log_test(
                        "Register Duplicate Email",
                        True,
                        f"Correctly rejected duplicate email with message: {error_message}"
                    )
                    return True
                else:
                    self.log_test(
                        "Register Duplicate Email",
                        False,
                        f"Got 400 but wrong error message: {error_message}",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Register Duplicate Email",
                    False,
                    f"Expected 400 Bad Request, got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Register Duplicate Email", False, f"Request error: {str(e)}")
            return False

    def test_register_missing_required_fields(self):
        """Test registration with missing required fields (SPECIFIC REVIEW REQUEST)"""
        test_cases = [
            {
                "name": "Missing Username",
                "data": {
                    "password": "test123",
                    "name": "Test User",
                    "email": "test@test.com"
                }
            },
            {
                "name": "Missing Password",
                "data": {
                    "username": "test_user",
                    "name": "Test User",
                    "email": "test@test.com"
                }
            },
            {
                "name": "Missing Name",
                "data": {
                    "username": "test_user",
                    "password": "test123",
                    "email": "test@test.com"
                }
            },
            {
                "name": "Missing Email",
                "data": {
                    "username": "test_user",
                    "password": "test123",
                    "name": "Test User"
                }
            }
        ]
        
        all_passed = True
        
        for test_case in test_cases:
            try:
                response = self.session.post(
                    f"{BASE_URL}/auth/register",
                    json=test_case["data"],
                    headers=HEADERS,
                    timeout=10
                )
                
                if response.status_code == 422:  # Validation error
                    self.log_test(
                        f"Register Validation - {test_case['name']}",
                        True,
                        "Correctly rejected missing required field"
                    )
                elif response.status_code == 400:  # Bad request
                    self.log_test(
                        f"Register Validation - {test_case['name']}",
                        True,
                        "Correctly rejected missing required field (400)"
                    )
                else:
                    self.log_test(
                        f"Register Validation - {test_case['name']}",
                        False,
                        f"Expected 422 or 400, got {response.status_code}",
                        response.text
                    )
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Register Validation - {test_case['name']}", False, f"Request error: {str(e)}")
                all_passed = False
        
        return all_passed

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

    def test_get_students_with_token(self, user_type: str):
        """Test GET /students endpoint with different user roles"""
        if user_type not in self.tokens:
            self.log_test(f"GET Students - {user_type}", False, "No token available for user")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/students",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test(
                        f"GET Students - {user_type}",
                        True,
                        f"Retrieved {len(data)} students"
                    )
                    return True
                else:
                    self.log_test(
                        f"GET Students - {user_type}",
                        False,
                        "Response is not a list",
                        data
                    )
                    return False
            else:
                self.log_test(
                    f"GET Students - {user_type}",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(f"GET Students - {user_type}", False, f"Request error: {str(e)}")
            return False

    def test_get_students_with_grade_filter(self, user_type: str):
        """Test GET /students with grade filter"""
        if user_type not in self.tokens:
            self.log_test(f"GET Students Grade Filter - {user_type}", False, "No token available for user")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            # Test with different grades
            test_grades = ["1°", "6°", "11°"]
            
            for grade in test_grades:
                response = self.session.get(
                    f"{BASE_URL}/students?grade={grade}",
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        self.log_test(
                            f"GET Students Grade Filter ({grade}) - {user_type}",
                            True,
                            f"Retrieved {len(data)} students for grade {grade}"
                        )
                    else:
                        self.log_test(
                            f"GET Students Grade Filter ({grade}) - {user_type}",
                            False,
                            "Response is not a list",
                            data
                        )
                        return False
                else:
                    self.log_test(
                        f"GET Students Grade Filter ({grade}) - {user_type}",
                        False,
                        f"Status code: {response.status_code}",
                        response.text
                    )
                    return False
            
            return True
                
        except Exception as e:
            self.log_test(f"GET Students Grade Filter - {user_type}", False, f"Request error: {str(e)}")
            return False

    def test_create_student(self, user_type: str):
        """Test POST /students endpoint"""
        if user_type not in self.tokens:
            self.log_test(f"POST Student - {user_type}", False, "No token available for user")
            return False
            
        # Only admin and teachers can create students
        if user_type not in ["admin", "docente_primaria", "docente_bachillerato"]:
            self.log_test(f"POST Student - {user_type}", True, "Skipped - role cannot create students")
            return True
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            # Create realistic student data
            student_data = {
                "name": f"María Alejandra Rodríguez Pérez",
                "grade": "3°",
                "level": "BÁSICA PRIMARIA",
                "document_number": f"1234567890"
            }
            
            response = self.session.post(
                f"{BASE_URL}/students",
                json=student_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                student_id = data.get("id") or data.get("_id")
                if student_id and data.get("name"):
                    self.created_student_id = student_id
                    self.log_test(
                        f"POST Student - {user_type}",
                        True,
                        f"Created student: {data['name']} (ID: {student_id})"
                    )
                    return True
                else:
                    self.log_test(
                        f"POST Student - {user_type}",
                        False,
                        "Missing required fields in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    f"POST Student - {user_type}",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(f"POST Student - {user_type}", False, f"Request error: {str(e)}")
            return False

    def test_get_student_by_id(self, user_type: str):
        """Test GET /students/{id} endpoint"""
        if user_type not in self.tokens or not self.created_student_id:
            self.log_test(f"GET Student by ID - {user_type}", False, "No token or student ID available")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/students/{self.created_student_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                student_id = data.get("id") or data.get("_id")
                if student_id == self.created_student_id:
                    self.log_test(
                        f"GET Student by ID - {user_type}",
                        True,
                        f"Retrieved student: {data.get('name', 'Unknown')}"
                    )
                    return True
                else:
                    self.log_test(
                        f"GET Student by ID - {user_type}",
                        False,
                        "Student ID mismatch",
                        data
                    )
                    return False
            elif response.status_code == 403:
                self.log_test(
                    f"GET Student by ID - {user_type}",
                    True,
                    "Access denied (expected for some roles)"
                )
                return True
            else:
                self.log_test(
                    f"GET Student by ID - {user_type}",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(f"GET Student by ID - {user_type}", False, f"Request error: {str(e)}")
            return False

    def test_students_without_auth(self):
        """Test students endpoints without authentication"""
        try:
            response = self.session.get(
                f"{BASE_URL}/students",
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 401 or response.status_code == 403:
                self.log_test("Students No Auth", True, "Correctly rejected unauthenticated request")
                return True
            else:
                self.log_test(
                    "Students No Auth",
                    False,
                    f"Expected 401/403, got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Students No Auth", False, f"Request error: {str(e)}")
            return False

    # ==================== GRADES SYSTEM TESTING (CRITICAL) ====================
    
    def test_assign_grade_success(self, user_type: str, student_id: str):
        """Test POST /grades - Assign grade to student (CRITICAL)"""
        if user_type not in self.tokens:
            self.log_test(f"Assign Grade - {user_type}", False, "No token available for user")
            return False
            
        # Only admin and teachers can assign grades
        if user_type not in ["admin", "docente_bachillerato"]:
            self.log_test(f"Assign Grade - {user_type}", True, "Skipped - role cannot assign grades")
            return True
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            # Test grade data with realistic values
            grade_data = {
                "student_id": student_id,
                "subject": "MATEMÁTICA",
                "period": "I",
                "grade": 4.2,
                "teacher_notes": "Excelente desempeño en álgebra básica"
            }
            
            response = self.session.post(
                f"{BASE_URL}/grades",
                json=grade_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("student_id") == student_id and data.get("grade") == 4.2:
                    self.log_test(
                        f"Assign Grade - {user_type}",
                        True,
                        f"Grade assigned successfully: {data.get('subject')} - {data.get('grade')}"
                    )
                    return True
                else:
                    self.log_test(
                        f"Assign Grade - {user_type}",
                        False,
                        "Grade data mismatch in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    f"Assign Grade - {user_type}",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(f"Assign Grade - {user_type}", False, f"Request error: {str(e)}")
            return False

    def test_assign_grade_invalid_range(self, user_type: str, student_id: str):
        """Test grade assignment with invalid range (should be 1.0-5.0)"""
        if user_type not in self.tokens or user_type not in ["admin", "docente_bachillerato"]:
            self.log_test(f"Assign Grade Invalid Range - {user_type}", True, "Skipped - no token or invalid role")
            return True
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            # Test with grade outside valid range
            invalid_grade_data = {
                "student_id": student_id,
                "subject": "MATEMÁTICA",
                "period": "I",
                "grade": 6.0,  # Invalid - above 5.0
                "teacher_notes": "Test invalid grade"
            }
            
            response = self.session.post(
                f"{BASE_URL}/grades",
                json=invalid_grade_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 422 or response.status_code == 400:
                self.log_test(
                    f"Assign Grade Invalid Range - {user_type}",
                    True,
                    "Correctly rejected invalid grade range"
                )
                return True
            else:
                self.log_test(
                    f"Assign Grade Invalid Range - {user_type}",
                    False,
                    f"Expected 400/422, got {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(f"Assign Grade Invalid Range - {user_type}", False, f"Request error: {str(e)}")
            return False

    def test_get_student_grades(self, user_type: str, student_id: str):
        """Test GET /grades/student/{student_id} - Get student grades"""
        if user_type not in self.tokens:
            self.log_test(f"Get Student Grades - {user_type}", False, "No token available for user")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/grades/student/{student_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test(
                        f"Get Student Grades - {user_type}",
                        True,
                        f"Retrieved {len(data)} grades for student"
                    )
                    return True
                else:
                    self.log_test(
                        f"Get Student Grades - {user_type}",
                        False,
                        "Response is not a list",
                        data
                    )
                    return False
            elif response.status_code == 403:
                self.log_test(
                    f"Get Student Grades - {user_type}",
                    True,
                    "Access denied (expected for some roles)"
                )
                return True
            else:
                self.log_test(
                    f"Get Student Grades - {user_type}",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(f"Get Student Grades - {user_type}", False, f"Request error: {str(e)}")
            return False

    def test_get_student_grades_with_period_filter(self, user_type: str, student_id: str):
        """Test GET /grades/student/{student_id}?period=I - Get grades with period filter"""
        if user_type not in self.tokens:
            self.log_test(f"Get Student Grades Period Filter - {user_type}", False, "No token available for user")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/grades/student/{student_id}?period=I",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Verify all grades are for period I
                    period_correct = all(grade.get("period") == "I" for grade in data)
                    if period_correct:
                        self.log_test(
                            f"Get Student Grades Period Filter - {user_type}",
                            True,
                            f"Retrieved {len(data)} grades for period I"
                        )
                        return True
                    else:
                        self.log_test(
                            f"Get Student Grades Period Filter - {user_type}",
                            False,
                            "Period filter not working correctly",
                            data
                        )
                        return False
                else:
                    self.log_test(
                        f"Get Student Grades Period Filter - {user_type}",
                        False,
                        "Response is not a list",
                        data
                    )
                    return False
            elif response.status_code == 403:
                self.log_test(
                    f"Get Student Grades Period Filter - {user_type}",
                    True,
                    "Access denied (expected for some roles)"
                )
                return True
            else:
                self.log_test(
                    f"Get Student Grades Period Filter - {user_type}",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(f"Get Student Grades Period Filter - {user_type}", False, f"Request error: {str(e)}")
            return False

    def test_update_existing_grade(self, user_type: str, student_id: str):
        """Test updating an existing grade (should update, not create duplicate)"""
        if user_type not in self.tokens or user_type not in ["admin", "docente_bachillerato"]:
            self.log_test(f"Update Existing Grade - {user_type}", True, "Skipped - no token or invalid role")
            return True
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            # First assign a grade
            initial_grade_data = {
                "student_id": student_id,
                "subject": "INGLÉS",
                "period": "I",
                "grade": 3.5,
                "teacher_notes": "Initial grade"
            }
            
            response1 = self.session.post(
                f"{BASE_URL}/grades",
                json=initial_grade_data,
                headers=headers,
                timeout=10
            )
            
            if response1.status_code != 200:
                self.log_test(f"Update Existing Grade - {user_type}", False, "Failed to create initial grade")
                return False
            
            # Now update the same grade (same student, subject, period)
            updated_grade_data = {
                "student_id": student_id,
                "subject": "INGLÉS",
                "period": "I",
                "grade": 4.0,
                "teacher_notes": "Updated grade - improved performance"
            }
            
            response2 = self.session.post(
                f"{BASE_URL}/grades",
                json=updated_grade_data,
                headers=headers,
                timeout=10
            )
            
            if response2.status_code == 200:
                data = response2.json()
                if data.get("grade") == 4.0 and "Updated grade" in data.get("teacher_notes", ""):
                    self.log_test(
                        f"Update Existing Grade - {user_type}",
                        True,
                        f"Grade updated successfully: {data.get('grade')}"
                    )
                    return True
                else:
                    self.log_test(
                        f"Update Existing Grade - {user_type}",
                        False,
                        "Grade not updated correctly",
                        data
                    )
                    return False
            else:
                self.log_test(
                    f"Update Existing Grade - {user_type}",
                    False,
                    f"Status code: {response2.status_code}",
                    response2.text
                )
                return False
                
        except Exception as e:
            self.log_test(f"Update Existing Grade - {user_type}", False, f"Request error: {str(e)}")
            return False

    def test_grades_permission_validation(self, user_type: str, student_id: str):
        """Test that only authorized users can assign grades"""
        if user_type not in self.tokens:
            self.log_test(f"Grades Permission Validation - {user_type}", False, "No token available for user")
            return False
            
        # Coordinadora should NOT be able to assign grades (only view)
        if user_type == "coordinadora":
            try:
                headers = {
                    **HEADERS,
                    "Authorization": f"Bearer {self.tokens[user_type]}"
                }
                
                grade_data = {
                    "student_id": student_id,
                    "subject": "MATEMÁTICA",
                    "period": "I",
                    "grade": 4.0,
                    "teacher_notes": "Test unauthorized access"
                }
                
                response = self.session.post(
                    f"{BASE_URL}/grades",
                    json=grade_data,
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 403:
                    self.log_test(
                        f"Grades Permission Validation - {user_type}",
                        True,
                        "Correctly denied grade assignment for coordinadora"
                    )
                    return True
                else:
                    self.log_test(
                        f"Grades Permission Validation - {user_type}",
                        False,
                        f"Expected 403, got {response.status_code}",
                        response.text
                    )
                    return False
                    
            except Exception as e:
                self.log_test(f"Grades Permission Validation - {user_type}", False, f"Request error: {str(e)}")
                return False
        else:
            self.log_test(f"Grades Permission Validation - {user_type}", True, "Skipped - user can assign grades")
            return True

    def test_grades_without_auth(self):
        """Test grades endpoints without authentication"""
        try:
            # Test POST /grades without auth
            grade_data = {
                "student_id": "test_id",
                "subject": "MATEMÁTICA",
                "period": "I",
                "grade": 4.0
            }
            
            response = self.session.post(
                f"{BASE_URL}/grades",
                json=grade_data,
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 401 or response.status_code == 403:
                self.log_test("Grades No Auth (POST)", True, "Correctly rejected unauthenticated request")
            else:
                self.log_test(
                    "Grades No Auth (POST)",
                    False,
                    f"Expected 401/403, got {response.status_code}",
                    response.text
                )
                return False
            
            # Test GET /grades/student/{id} without auth
            response2 = self.session.get(
                f"{BASE_URL}/grades/student/test_id",
                headers=HEADERS,
                timeout=10
            )
            
            if response2.status_code == 401 or response2.status_code == 403:
                self.log_test("Grades No Auth (GET)", True, "Correctly rejected unauthenticated request")
                return True
            else:
                self.log_test(
                    "Grades No Auth (GET)",
                    False,
                    f"Expected 401/403, got {response2.status_code}",
                    response2.text
                )
                return False
                
        except Exception as e:
            self.log_test("Grades No Auth", False, f"Request error: {str(e)}")
            return False

    def test_multiple_subjects_grades(self, user_type: str, student_id: str):
        """Test assigning grades for multiple subjects"""
        if user_type not in self.tokens or user_type not in ["admin", "docente_bachillerato"]:
            self.log_test(f"Multiple Subjects Grades - {user_type}", True, "Skipped - no token or invalid role")
            return True
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            # Test subjects for bachillerato
            subjects_to_test = ["MATEMÁTICA", "INGLÉS", "CIENCIAS NATURALES", "CIENCIAS SOCIALES"]
            grades_assigned = 0
            
            for i, subject in enumerate(subjects_to_test):
                grade_data = {
                    "student_id": student_id,
                    "subject": subject,
                    "period": "I",
                    "grade": round(3.0 + (i * 0.3), 1),  # Varying grades: 3.0, 3.3, 3.6, 3.9
                    "teacher_notes": f"Grade for {subject}"
                }
                
                response = self.session.post(
                    f"{BASE_URL}/grades",
                    json=grade_data,
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    grades_assigned += 1
                else:
                    self.log_test(
                        f"Multiple Subjects Grades - {user_type}",
                        False,
                        f"Failed to assign grade for {subject}: {response.status_code}",
                        response.text
                    )
                    return False
            
            if grades_assigned == len(subjects_to_test):
                self.log_test(
                    f"Multiple Subjects Grades - {user_type}",
                    True,
                    f"Successfully assigned grades for {grades_assigned} subjects"
                )
                return True
            else:
                self.log_test(
                    f"Multiple Subjects Grades - {user_type}",
                    False,
                    f"Only assigned {grades_assigned}/{len(subjects_to_test)} grades"
                )
                return False
                
        except Exception as e:
            self.log_test(f"Multiple Subjects Grades - {user_type}", False, f"Request error: {str(e)}")
            return False

    # ==================== GRADE ORDERING TESTS (SPECIFIC REVIEW REQUEST) ====================
    
    def test_students_grade_ordering_backend(self, user_type: str):
        """Test that GET /students returns students ordered by grade (SPECIFIC REVIEW REQUEST)"""
        if user_type not in self.tokens:
            self.log_test(f"Students Grade Ordering - {user_type}", False, "No token available for user")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/students",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                students = response.json()
                if not isinstance(students, list):
                    self.log_test(
                        f"Students Grade Ordering - {user_type}",
                        False,
                        "Response is not a list",
                        students
                    )
                    return False
                
                if len(students) == 0:
                    self.log_test(
                        f"Students Grade Ordering - {user_type}",
                        True,
                        "No students found - cannot test ordering"
                    )
                    return True
                
                # Extract grades from students
                grades = [student.get("grade", "") for student in students]
                
                # Define expected grade order
                expected_order = ["Transición", "1°", "2°", "3°", "4°", "5°", "6°", "7°", "8°", "9°", "10°", "11°"]
                
                # Check if grades are in correct order
                is_ordered = True
                previous_grade_index = -1
                
                for grade in grades:
                    if grade in expected_order:
                        current_grade_index = expected_order.index(grade)
                        if current_grade_index < previous_grade_index:
                            is_ordered = False
                            break
                        previous_grade_index = current_grade_index
                
                # Count students per grade
                grade_counts = {}
                for grade in grades:
                    grade_counts[grade] = grade_counts.get(grade, 0) + 1
                
                # Check for grade mixing (same grade should be consecutive)
                grade_groups = []
                current_grade = None
                for grade in grades:
                    if grade != current_grade:
                        grade_groups.append(grade)
                        current_grade = grade
                
                # Count unique grade appearances
                unique_grades = set(grades)
                has_mixing = len(grade_groups) > len(unique_grades)
                
                if is_ordered and not has_mixing:
                    grade_distribution = ", ".join([f"{grade}: {count}" for grade, count in grade_counts.items()])
                    self.log_test(
                        f"Students Grade Ordering - {user_type}",
                        True,
                        f"Students correctly ordered by grade. Total: {len(students)}. Distribution: {grade_distribution}"
                    )
                    return True
                else:
                    error_details = []
                    if not is_ordered:
                        error_details.append("grades not in correct order")
                    if has_mixing:
                        error_details.append("grades are mixed (same grade appears non-consecutively)")
                    
                    self.log_test(
                        f"Students Grade Ordering - {user_type}",
                        False,
                        f"Grade ordering issues: {', '.join(error_details)}. Grades found: {grades[:10]}{'...' if len(grades) > 10 else ''}"
                    )
                    return False
                    
            else:
                self.log_test(
                    f"Students Grade Ordering - {user_type}",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(f"Students Grade Ordering - {user_type}", False, f"Request error: {str(e)}")
            return False

    def test_students_grade_ordering_consistency(self, user_type: str):
        """Test that grade ordering is consistent across multiple calls"""
        if user_type not in self.tokens:
            self.log_test(f"Grade Ordering Consistency - {user_type}", False, "No token available for user")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            # Make multiple calls to check consistency
            call_results = []
            for i in range(3):
                response = self.session.get(
                    f"{BASE_URL}/students",
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    students = response.json()
                    if isinstance(students, list):
                        grades = [student.get("grade", "") for student in students]
                        call_results.append(grades)
                    else:
                        self.log_test(
                            f"Grade Ordering Consistency - {user_type}",
                            False,
                            f"Call {i+1}: Response is not a list"
                        )
                        return False
                else:
                    self.log_test(
                        f"Grade Ordering Consistency - {user_type}",
                        False,
                        f"Call {i+1}: Status code {response.status_code}"
                    )
                    return False
            
            # Check if all calls returned the same order
            if len(call_results) >= 2:
                first_call = call_results[0]
                consistent = all(grades == first_call for grades in call_results[1:])
                
                if consistent:
                    self.log_test(
                        f"Grade Ordering Consistency - {user_type}",
                        True,
                        f"Grade ordering is consistent across {len(call_results)} calls"
                    )
                    return True
                else:
                    self.log_test(
                        f"Grade Ordering Consistency - {user_type}",
                        False,
                        "Grade ordering is inconsistent between calls"
                    )
                    return False
            else:
                self.log_test(
                    f"Grade Ordering Consistency - {user_type}",
                    True,
                    "Not enough successful calls to test consistency"
                )
                return True
                
        except Exception as e:
            self.log_test(f"Grade Ordering Consistency - {user_type}", False, f"Request error: {str(e)}")
            return False

    def test_specific_role_grade_access(self, user_type: str):
        """Test specific role access to grades as per review request"""
        if user_type not in self.tokens:
            self.log_test(f"Role Grade Access - {user_type}", False, "No token available for user")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/students",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                students = response.json()
                if not isinstance(students, list):
                    self.log_test(
                        f"Role Grade Access - {user_type}",
                        False,
                        "Response is not a list"
                    )
                    return False
                
                grades_found = set(student.get("grade", "") for student in students)
                
                # Define expected grades per role based on review request
                expected_access = {
                    "admin": "ALL",  # Should see all students
                    "docente_bachillerato": ["6°", "7°", "8°", "9°", "10°", "11°"],  # Should see bachillerato grades
                    "coordinadora": "ALL"  # Should see all students
                }
                
                if user_type in expected_access:
                    expected = expected_access[user_type]
                    
                    if expected == "ALL":
                        # Admin and coordinadora should see all grades
                        self.log_test(
                            f"Role Grade Access - {user_type}",
                            True,
                            f"Has access to all students. Total: {len(students)}. Grades: {sorted(grades_found)}"
                        )
                        return True
                    else:
                        # Docente bachillerato should only see bachillerato grades
                        unexpected_grades = grades_found - set(expected)
                        if not unexpected_grades:
                            self.log_test(
                                f"Role Grade Access - {user_type}",
                                True,
                                f"Correctly filtered to bachillerato grades. Students: {len(students)}. Grades: {sorted(grades_found)}"
                            )
                            return True
                        else:
                            self.log_test(
                                f"Role Grade Access - {user_type}",
                                False,
                                f"Has access to unexpected grades: {unexpected_grades}. Expected only: {expected}"
                            )
                            return False
                else:
                    self.log_test(
                        f"Role Grade Access - {user_type}",
                        True,
                        f"Role not in specific test scope. Students: {len(students)}. Grades: {sorted(grades_found)}"
                    )
                    return True
                    
            else:
                self.log_test(
                    f"Role Grade Access - {user_type}",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test(f"Role Grade Access - {user_type}", False, f"Request error: {str(e)}")
            return False

    def test_critical_student_distribution_by_role(self):
        """CRITICAL TEST: Verify exact student distribution by role as per review request"""
        print("\n" + "=" * 70)
        print("🎯 CRITICAL REVIEW REQUEST: STUDENT DISTRIBUTION BY ROLE")
        print("Expected: 555 students total distributed across grades 0° to 11°")
        print("=" * 70)
        
        # Expected distribution from review request
        expected_distribution = {
            "0°": 31, "1°": 50, "2°": 40, "3°": 50, "4°": 52, "5°": 53,
            "6°": 61, "7°": 50, "8°": 54, "9°": 39, "10°": 46, "11°": 25
        }
        expected_total = 555
        
        # Expected access per role
        expected_bachillerato_total = 61 + 50 + 54 + 39 + 46 + 25  # 275 students for grades 6°-11°
        
        results = {}
        
        # Test each user role
        for user_type, credentials in TEST_USERS.items():
            if user_type not in self.tokens:
                print(f"⚠️  Skipping {user_type} - no token available")
                continue
                
            try:
                headers = {
                    **HEADERS,
                    "Authorization": f"Bearer {self.tokens[user_type]}"
                }
                
                response = self.session.get(
                    f"{BASE_URL}/students",
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    students = response.json()
                    if isinstance(students, list):
                        total_students = len(students)
                        
                        # Count students by grade
                        grade_counts = {}
                        for student in students:
                            grade = student.get("grade", "Unknown")
                            grade_counts[grade] = grade_counts.get(grade, 0) + 1
                        
                        results[user_type] = {
                            "total": total_students,
                            "grades": grade_counts,
                            "success": True
                        }
                        
                        # Verify specific role expectations
                        if user_type == "admin":
                            expected = expected_total
                            success = total_students == expected
                            self.log_test(
                                f"ADMIN Access (pedro.hurtado)",
                                success,
                                f"Expected {expected} students, got {total_students}. Distribution: {grade_counts}"
                            )
                            
                        elif user_type == "docente_primaria":
                            expected = 50  # Only grade 1°
                            success = total_students == expected and all(grade == "1°" for grade in grade_counts.keys())
                            self.log_test(
                                f"DOCENTE PRIMARIA Access (yocelyn.cabarcas)",
                                success,
                                f"Expected {expected} students from grade 1°, got {total_students}. Grades: {list(grade_counts.keys())}"
                            )
                            
                        elif user_type == "docente_bachillerato":
                            expected_grades = ["6°", "7°", "8°", "9°", "10°", "11°"]
                            actual_grades = list(grade_counts.keys())
                            unexpected_grades = [g for g in actual_grades if g not in expected_grades]
                            success = len(unexpected_grades) == 0
                            self.log_test(
                                f"DOCENTE BACHILLERATO Access (bifencia.orozco)",
                                success,
                                f"Expected grades 6°-11°, got {total_students} students. Grades: {actual_grades}. Unexpected: {unexpected_grades}"
                            )
                            
                        elif user_type == "coordinadora":
                            expected = expected_total
                            success = total_students == expected
                            self.log_test(
                                f"COORDINADORA Access (coord.convivencia)",
                                success,
                                f"Expected {expected} students, got {total_students}. Distribution: {grade_counts}"
                            )
                            
                    else:
                        results[user_type] = {"success": False, "error": "Response not a list"}
                        self.log_test(f"Student Access - {user_type}", False, "Response is not a list", students)
                        
                else:
                    results[user_type] = {"success": False, "error": f"Status {response.status_code}"}
                    self.log_test(f"Student Access - {user_type}", False, f"Status code: {response.status_code}", response.text)
                    
            except Exception as e:
                results[user_type] = {"success": False, "error": str(e)}
                self.log_test(f"Student Access - {user_type}", False, f"Request error: {str(e)}")
        
        # Summary of critical test
        print("\n" + "=" * 70)
        print("📊 CRITICAL TEST SUMMARY - STUDENT DISTRIBUTION BY ROLE")
        print("=" * 70)
        
        for user_type, result in results.items():
            if result.get("success"):
                total = result.get("total", 0)
                grades = result.get("grades", {})
                print(f"✅ {user_type.upper()}: {total} students - Grades: {dict(sorted(grades.items()))}")
            else:
                print(f"❌ {user_type.upper()}: FAILED - {result.get('error', 'Unknown error')}")
        
        return results

    def run_all_tests(self):
        """Run comprehensive GAA backend tests focusing on CRITICAL REVIEW REQUEST"""
        print("🚀 Starting CRITICAL STUDENT SYSTEM TESTING")
        print("🎯 FOCUS: Student Distribution by Role (Review Request)")
        print("=" * 70)
        
        # Test 1: Health check
        if not self.test_health_check():
            print("❌ Backend is not accessible. Stopping tests.")
            return False
        
        # Test 2: Login success for all user types (CRITICAL CREDENTIALS)
        login_success_count = 0
        for user_type, credentials in TEST_USERS.items():
            if self.test_login_success(user_type, credentials):
                login_success_count += 1
        
        if login_success_count == 0:
            print("❌ No successful logins. Cannot proceed with tests.")
            return False
        
        print(f"\n✅ Authentication successful for {login_success_count}/{len(TEST_USERS)} users")
        
        # CRITICAL TEST: Student distribution by role (REVIEW REQUEST)
        critical_results = self.test_critical_student_distribution_by_role()
        
        # Additional verification tests for ordering and access control
        print("\n" + "=" * 70)
        print("🔍 ADDITIONAL VERIFICATION TESTS")
        print("=" * 70)
        
        # Test grade ordering for each role
        for user_type in self.tokens.keys():
            self.test_students_grade_ordering_backend(user_type)
            self.test_students_grade_ordering_consistency(user_type)
            self.test_specific_role_grade_access(user_type)
        
        # Test 3: Authentication validation tests
        self.test_login_invalid_credentials()
        self.test_login_wrong_password()
        self.test_profile_without_token()
        self.test_profile_invalid_token()
        
        # Test 4: Profile access for authenticated users
        for user_type in self.tokens.keys():
            self.test_profile_with_token(user_type)
        
        # Test 5: Students endpoints without authentication
        self.test_students_without_auth()
        
        # Test 6: GET /students with different user roles (verify grade filtering)
        for user_type in self.tokens.keys():
            self.test_get_students_with_token(user_type)
        
        # Test 7: GET /students with grade filters (CRITICAL for docentes)
        for user_type in self.tokens.keys():
            self.test_get_students_with_grade_filter(user_type)
        
        # Test 8: Get a real student ID for grades testing
        test_student_id = None
        if "admin" in self.tokens:
            try:
                headers = {
                    **HEADERS,
                    "Authorization": f"Bearer {self.tokens['admin']}"
                }
                response = self.session.get(f"{BASE_URL}/students", headers=headers, timeout=10)
                if response.status_code == 200:
                    students = response.json()
                    if students and len(students) > 0:
                        test_student_id = students[0].get("id") or students[0].get("_id")
                        print(f"\n📝 Using student ID for grades testing: {test_student_id}")
            except:
                pass
        
        if not test_student_id:
            print("⚠️  No student ID available for grades testing. Creating test student...")
            # Try to create a test student
            if "admin" in self.tokens:
                self.test_create_student("admin")
                test_student_id = self.created_student_id
        
        # ==================== GRADES SYSTEM TESTING (CRITICAL) ====================
        print("\n" + "=" * 70)
        print("🎯 CRITICAL: GRADES SYSTEM TESTING")
        print("=" * 70)
        
        if test_student_id:
            # Test 9: Grades endpoints without authentication
            self.test_grades_without_auth()
            
            # Test 10: Assign grades (CRITICAL - user reports this doesn't work)
            for user_type in self.tokens.keys():
                self.test_assign_grade_success(user_type, test_student_id)
            
            # Test 11: Grade range validation (1.0-5.0)
            for user_type in ["admin", "docente_bachillerato"]:
                if user_type in self.tokens:
                    self.test_assign_grade_invalid_range(user_type, test_student_id)
            
            # Test 12: Get student grades
            for user_type in self.tokens.keys():
                self.test_get_student_grades(user_type, test_student_id)
            
            # Test 13: Get student grades with period filter
            for user_type in self.tokens.keys():
                self.test_get_student_grades_with_period_filter(user_type, test_student_id)
            
            # Test 14: Update existing grade (should not create duplicate)
            for user_type in ["admin", "docente_bachillerato"]:
                if user_type in self.tokens:
                    self.test_update_existing_grade(user_type, test_student_id)
            
            # Test 15: Permission validation for grades
            for user_type in self.tokens.keys():
                self.test_grades_permission_validation(user_type, test_student_id)
            
            # Test 16: Multiple subjects grades assignment
            for user_type in ["admin", "docente_bachillerato"]:
                if user_type in self.tokens:
                    self.test_multiple_subjects_grades(user_type, test_student_id)
        else:
            print("❌ No student ID available for grades testing. Skipping grades tests.")
        
        # ==================== GRADE ORDERING TESTS (SPECIFIC REVIEW REQUEST) ====================
        print("\n" + "=" * 70)
        print("🎯 SPECIFIC REVIEW REQUEST: GRADE ORDERING VERIFICATION")
        print("=" * 70)
        
        # Test 17: Students grade ordering in backend
        for user_type in self.tokens.keys():
            self.test_students_grade_ordering_backend(user_type)
        
        # Test 18: Grade ordering consistency
        for user_type in self.tokens.keys():
            self.test_students_grade_ordering_consistency(user_type)
        
        # Test 19: Specific role grade access verification
        for user_type in self.tokens.keys():
            self.test_specific_role_grade_access(user_type)
        
        # ==================== USER REGISTRATION TESTS (SPECIFIC REVIEW REQUEST) ====================
        print("\n" + "=" * 70)
        print("🎯 SPECIFIC REVIEW REQUEST: USER REGISTRATION TESTING")
        print("=" * 70)
        
        # Test 20: User registration tests as per review request
        self.test_register_new_user_success()
        self.test_register_duplicate_username()
        self.test_register_duplicate_email()
        self.test_register_missing_required_fields()
        
        for user_type in self.tokens.keys():
            self.test_logout(user_type)
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📈 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Categorize results
        auth_tests = [r for r in self.test_results if "Login" in r["test"] or "Profile" in r["test"] or "Register" in r["test"] or "Logout" in r["test"]]
        student_tests = [r for r in self.test_results if "Student" in r["test"]]
        grade_tests = [r for r in self.test_results if "Grade" in r["test"]]
        ordering_tests = [r for r in self.test_results if "Ordering" in r["test"] or "Role Grade Access" in r["test"]]
        
        print(f"\n📋 Test Categories:")
        print(f"   🔐 Authentication: {sum(1 for r in auth_tests if r['success'])}/{len(auth_tests)} passed")
        print(f"   👥 Students: {sum(1 for r in student_tests if r['success'])}/{len(student_tests)} passed")
        print(f"   📝 Grades (CRITICAL): {sum(1 for r in grade_tests if r['success'])}/{len(grade_tests)} passed")
        print(f"   📊 Grade Ordering (REVIEW REQUEST): {sum(1 for r in ordering_tests if r['success'])}/{len(ordering_tests)} passed")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS ({failed_tests}):")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        # Special focus on grades system failures
        failed_grade_tests = [r for r in grade_tests if not r["success"]]
        if failed_grade_tests:
            print(f"\n🚨 CRITICAL: GRADES SYSTEM FAILURES ({len(failed_grade_tests)}):")
            for result in failed_grade_tests:
                print(f"  - {result['test']}: {result['details']}")
        
        return failed_tests == 0

def main():
    """Main test execution"""
    tester = GAABackendTester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open("/app/gaa_backend_test_results.json", "w") as f:
        json.dump(tester.test_results, f, indent=2, default=str)
    
    print(f"\n📄 Detailed results saved to: /app/gaa_backend_test_results.json")
    
    if success:
        print("\n🎉 All GAA backend tests passed!")
        print("✅ Authentication system working")
        print("✅ Students system working")
        print("✅ GRADES system working (CRITICAL)")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check the details above.")
        print("🔍 Focus on GRADES system failures if any - user reported issues with grade assignment")
        sys.exit(1)

if __name__ == "__main__":
    main()