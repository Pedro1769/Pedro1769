#!/usr/bin/env python3
"""
Pedro Math Pro Backend API Testing Suite
Tests all backend endpoints for authentication and question management
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Backend URL from frontend environment
BACKEND_URL = "https://olimpimath.preview.emergentagent.com/api"

class PedroMathProTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.admin_token = None
        self.student_token = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

    def test_admin_login(self) -> bool:
        """Test admin login with username=admin and password=admin123"""
        print("🔐 Testing Admin Authentication...")
        
        try:
            response = requests.post(
                f"{self.base_url}/auth/login",
                json={"username": "admin", "password": "admin123"},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.admin_token = data["access_token"]
                    user = data["user"]
                    if user.get("role") == "admin" and user.get("username") == "admin":
                        self.log_test("Admin Login", True, f"Token received, user role: {user.get('role')}")
                        return True
                    else:
                        self.log_test("Admin Login", False, f"Invalid user data: {user}")
                        return False
                else:
                    self.log_test("Admin Login", False, "Missing access_token or user in response", data)
                    return False
            else:
                self.log_test("Admin Login", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Admin Login", False, f"Exception: {str(e)}")
            return False

    def test_student_registration(self) -> bool:
        """Test student user registration"""
        print("👤 Testing Student Registration...")
        
        try:
            student_data = {
                "username": "estudiante_test_2024",
                "email": "estudiante.test@pedromathpro.com",
                "password": "password123",
                "role": "student",
                "sede": "Sede 1",
                "nivel": "Nivel 1 (6° y 7°)"
            }
            
            response = requests.post(
                f"{self.base_url}/auth/register",
                json=student_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.student_token = data["access_token"]
                    user = data["user"]
                    if user.get("role") == "student":
                        self.log_test("Student Registration", True, f"Student created with role: {user.get('role')}")
                        return True
                    else:
                        self.log_test("Student Registration", False, f"Invalid role: {user.get('role')}")
                        return False
                else:
                    self.log_test("Student Registration", False, "Missing access_token or user in response", data)
                    return False
            else:
                # Check if user already exists (this is acceptable)
                if response.status_code == 400 and "ya existe" in response.text:
                    self.log_test("Student Registration", True, "User already exists (acceptable for testing)")
                    # Try to login with existing user
                    login_response = requests.post(
                        f"{self.base_url}/auth/login",
                        json={"username": "estudiante_test_2024", "password": "password123"},
                        headers={"Content-Type": "application/json"}
                    )
                    if login_response.status_code == 200:
                        data = login_response.json()
                        self.student_token = data["access_token"]
                        return True
                    else:
                        self.log_test("Student Registration", False, f"Could not login existing user: {login_response.text}")
                        return False
                else:
                    self.log_test("Student Registration", False, f"HTTP {response.status_code}", response.text)
                    return False
                
        except Exception as e:
            self.log_test("Student Registration", False, f"Exception: {str(e)}")
            return False

    def test_auth_me(self) -> bool:
        """Test GET /api/auth/me with admin token"""
        print("🔍 Testing Auth Me Endpoint...")
        
        if not self.admin_token:
            self.log_test("Auth Me", False, "No admin token available")
            return False
            
        try:
            response = requests.get(
                f"{self.base_url}/auth/me",
                headers={"Authorization": f"Bearer {self.admin_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("username") == "admin" and data.get("role") == "admin":
                    self.log_test("Auth Me", True, f"Retrieved user: {data.get('username')}")
                    return True
                else:
                    self.log_test("Auth Me", False, f"Invalid user data: {data}")
                    return False
            else:
                self.log_test("Auth Me", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Auth Me", False, f"Exception: {str(e)}")
            return False

    def test_questions_count_by_level(self) -> bool:
        """Test GET /api/questions/count/by-level"""
        print("📊 Testing Questions Count by Level...")
        
        if not self.admin_token:
            self.log_test("Questions Count by Level", False, "No admin token available")
            return False
            
        try:
            response = requests.get(
                f"{self.base_url}/questions/count/by-level",
                headers={"Authorization": f"Bearer {self.admin_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Questions Count by Level", True, f"Count data: {data}")
                return True
            else:
                self.log_test("Questions Count by Level", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Questions Count by Level", False, f"Exception: {str(e)}")
            return False

    def test_generate_questions(self) -> bool:
        """Test POST /api/questions/generate to generate 5 questions"""
        print("🤖 Testing AI Question Generation...")
        
        if not self.admin_token:
            self.log_test("Generate Questions", False, "No admin token available")
            return False
            
        try:
            request_data = {
                "nivel": "Nivel 1 (6° y 7°)",
                "tipo_pensamiento": "numérico",
                "cantidad": 5,
                "categoria": "Matemáticas"
            }
            
            response = requests.post(
                f"{self.base_url}/questions/generate",
                json=request_data,
                headers={
                    "Authorization": f"Bearer {self.admin_token}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "questions" in data:
                    questions = data["questions"]
                    if len(questions) == 5:
                        # Validate question structure
                        valid_questions = True
                        for q in questions:
                            if not all(key in q for key in ["texto", "opciones", "respuesta_correcta", "nivel", "tipo_pensamiento"]):
                                valid_questions = False
                                break
                            if len(q["opciones"]) != 4:
                                valid_questions = False
                                break
                            if not (0 <= q["respuesta_correcta"] <= 3):
                                valid_questions = False
                                break
                        
                        if valid_questions:
                            self.log_test("Generate Questions", True, f"Generated {len(questions)} valid questions")
                            return True
                        else:
                            self.log_test("Generate Questions", False, "Generated questions have invalid structure")
                            return False
                    else:
                        self.log_test("Generate Questions", False, f"Expected 5 questions, got {len(questions)}")
                        return False
                else:
                    self.log_test("Generate Questions", False, "Missing message or questions in response", data)
                    return False
            else:
                self.log_test("Generate Questions", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Generate Questions", False, f"Exception: {str(e)}")
            return False

    def test_list_questions(self) -> bool:
        """Test GET /api/questions to list all questions"""
        print("📋 Testing List Questions...")
        
        if not self.admin_token:
            self.log_test("List Questions", False, "No admin token available")
            return False
            
        try:
            response = requests.get(
                f"{self.base_url}/questions",
                headers={"Authorization": f"Bearer {self.admin_token}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("List Questions", True, f"Retrieved {len(data)} questions")
                    return True
                else:
                    self.log_test("List Questions", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("List Questions", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("List Questions", False, f"Exception: {str(e)}")
            return False

    def test_unauthorized_access(self) -> bool:
        """Test that protected endpoints require authentication"""
        print("🔒 Testing Unauthorized Access Protection...")
        
        try:
            # Test without token
            response = requests.get(f"{self.base_url}/questions")
            
            if response.status_code == 401:
                self.log_test("Unauthorized Access Protection", True, "Correctly rejected request without token")
                return True
            else:
                self.log_test("Unauthorized Access Protection", False, f"Expected 401, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Unauthorized Access Protection", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Pedro Math Pro Backend API Tests")
        print("=" * 60)
        
        # Test sequence
        tests = [
            ("Admin Login", self.test_admin_login),
            ("Student Registration", self.test_student_registration),
            ("Auth Me", self.test_auth_me),
            ("Questions Count by Level", self.test_questions_count_by_level),
            ("Generate Questions", self.test_generate_questions),
            ("List Questions", self.test_list_questions),
            ("Unauthorized Access Protection", self.test_unauthorized_access),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Unexpected error: {str(e)}")
        
        print("=" * 60)
        print(f"📊 TEST SUMMARY: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Backend API is working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False

def main():
    """Main test runner"""
    tester = PedroMathProTester()
    success = tester.run_all_tests()
    
    # Print detailed results for debugging
    print("\n" + "=" * 60)
    print("DETAILED TEST RESULTS:")
    for result in tester.test_results:
        status = "PASS" if result["success"] else "FAIL"
        print(f"[{status}] {result['test']}: {result['details']}")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())