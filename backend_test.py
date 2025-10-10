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
BASE_URL = "https://grado-filter-fix.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Test users as specified in the review request
TEST_USERS = {
    "admin": {"username": "pedro.hurtado", "password": "gim123"},
    "docente_bachillerato": {"username": "bifencia.orozco", "password": "gim123"},
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

    def run_all_tests(self):
        """Run comprehensive GAA backend tests focusing on GRADES system"""
        print("🚀 Starting Comprehensive GAA Backend Tests")
        print("🎯 FOCUS: Authentication, Students, and GRADES System (CRITICAL)")
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
        
        # Test 17: User registration and logout
        self.test_register_new_user()
        self.test_register_duplicate_user()
        
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
        
        print(f"\n📋 Test Categories:")
        print(f"   🔐 Authentication: {sum(1 for r in auth_tests if r['success'])}/{len(auth_tests)} passed")
        print(f"   👥 Students: {sum(1 for r in student_tests if r['success'])}/{len(student_tests)} passed")
        print(f"   📝 Grades (CRITICAL): {sum(1 for r in grade_tests if r['success'])}/{len(grade_tests)} passed")
        
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