#!/usr/bin/env python3
"""
Student Management Testing - GAA Educational System
Focus: New student management functionalities for different roles
Testing DELETE /api/students/{id}, DELETE /api/students/bulk, PUT /api/students/{id}
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional, List
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

class StudentManagementTester:
    def __init__(self):
        self.session = requests.Session()
        self.tokens = {}
        self.test_results = []
        self.test_students = {}  # Store created test students by role
        
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

    def create_test_student(self, user_type: str, grade: str = "10°") -> Optional[str]:
        """Create a test student for testing purposes"""
        if user_type not in self.tokens:
            return None
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            # Create realistic student data
            student_data = {
                "name": f"Estudiante Test {user_type} {datetime.now().strftime('%H%M%S')}",
                "grade": grade,
                "level": "BÁSICA SECUNDARIA" if grade in ["6°", "7°", "8°", "9°"] else "MEDIA",
                "document_number": f"TEST{random.randint(100000, 999999)}"
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
                if student_id:
                    self.test_students[f"{user_type}_{grade}"] = {
                        "id": student_id,
                        "name": student_data["name"],
                        "grade": grade
                    }
                    return student_id
            return None
                
        except Exception as e:
            print(f"Error creating test student: {str(e)}")
            return None

    def get_existing_student_by_grade(self, user_type: str, grade: str) -> Optional[Dict]:
        """Get an existing student from a specific grade"""
        if user_type not in self.tokens:
            return None
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/students?grade={grade}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                students = response.json()
                if students and len(students) > 0:
                    return {
                        "id": students[0].get("id") or students[0].get("_id"),
                        "name": students[0].get("name"),
                        "grade": students[0].get("grade")
                    }
            return None
                
        except Exception as e:
            print(f"Error getting existing student: {str(e)}")
            return None

    def test_admin_delete_individual_student(self):
        """Test DELETE /api/students/{id} as Administrator"""
        user_type = "admin"
        if user_type not in self.tokens:
            self.log_test("Admin Delete Individual Student", False, "No admin token available")
            return False
            
        # Create a test student first
        student_id = self.create_test_student(user_type, "11°")
        if not student_id:
            self.log_test("Admin Delete Individual Student", False, "Could not create test student")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            response = self.session.delete(
                f"{BASE_URL}/students/{student_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test(
                        "Admin Delete Individual Student",
                        True,
                        f"Successfully deleted student {student_id}"
                    )
                    return True
                else:
                    self.log_test(
                        "Admin Delete Individual Student",
                        False,
                        "Missing success flag in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Admin Delete Individual Student",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Admin Delete Individual Student", False, f"Request error: {str(e)}")
            return False

    def test_admin_bulk_delete_students(self):
        """Test DELETE /api/students/bulk as Administrator"""
        user_type = "admin"
        if user_type not in self.tokens:
            self.log_test("Admin Bulk Delete Students", False, "No admin token available")
            return False
            
        # Create multiple test students
        student_ids = []
        for i in range(3):
            student_id = self.create_test_student(user_type, "9°")
            if student_id:
                student_ids.append(student_id)
        
        if len(student_ids) == 0:
            self.log_test("Admin Bulk Delete Students", False, "Could not create test students")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            response = self.session.delete(
                f"{BASE_URL}/students/bulk/delete",
                json=student_ids,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("count", 0) > 0:
                    self.log_test(
                        "Admin Bulk Delete Students",
                        True,
                        f"Successfully deleted {data.get('count')} students"
                    )
                    return True
                else:
                    self.log_test(
                        "Admin Bulk Delete Students",
                        False,
                        "Missing success flag or count in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Admin Bulk Delete Students",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Admin Bulk Delete Students", False, f"Request error: {str(e)}")
            return False

    def test_admin_edit_student(self):
        """Test PUT /api/students/{id} as Administrator"""
        user_type = "admin"
        if user_type not in self.tokens:
            self.log_test("Admin Edit Student", False, "No admin token available")
            return False
            
        # Create a test student first
        student_id = self.create_test_student(user_type, "8°")
        if not student_id:
            self.log_test("Admin Edit Student", False, "Could not create test student")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            # Update student data
            updated_data = {
                "name": f"Estudiante Editado Admin {datetime.now().strftime('%H%M%S')}",
                "grade": "8°",
                "level": "BÁSICA SECUNDARIA",
                "document_number": f"EDIT{random.randint(100000, 999999)}"
            }
            
            response = self.session.put(
                f"{BASE_URL}/students/{student_id}",
                json=updated_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("name") == updated_data["name"]:
                    self.log_test(
                        "Admin Edit Student",
                        True,
                        f"Successfully updated student: {data.get('name')}"
                    )
                    return True
                else:
                    self.log_test(
                        "Admin Edit Student",
                        False,
                        "Student data not updated correctly",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Admin Edit Student",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Admin Edit Student", False, f"Request error: {str(e)}")
            return False

    def test_docente_bachillerato_edit_assigned_grade(self):
        """Test that docente bachillerato can edit students from assigned grades (6° to 11°)"""
        user_type = "docente_bachillerato"
        if user_type not in self.tokens:
            self.log_test("Docente Bachillerato Edit Assigned Grade", False, "No docente bachillerato token available")
            return False
            
        # Try to get an existing student from grade 10° or 11° (assigned grades)
        student = self.get_existing_student_by_grade(user_type, "10°")
        if not student:
            student = self.get_existing_student_by_grade(user_type, "11°")
        
        if not student:
            self.log_test("Docente Bachillerato Edit Assigned Grade", False, "No students found in assigned grades")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            # Update student data
            updated_data = {
                "name": f"Estudiante Editado Docente {datetime.now().strftime('%H%M%S')}",
                "grade": student["grade"],
                "level": "MEDIA" if student["grade"] in ["10°", "11°"] else "BÁSICA SECUNDARIA",
                "document_number": f"DOCE{random.randint(100000, 999999)}"
            }
            
            response = self.session.put(
                f"{BASE_URL}/students/{student['id']}",
                json=updated_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("name") == updated_data["name"]:
                    self.log_test(
                        "Docente Bachillerato Edit Assigned Grade",
                        True,
                        f"Successfully updated student from grade {student['grade']}: {data.get('name')}"
                    )
                    return True
                else:
                    self.log_test(
                        "Docente Bachillerato Edit Assigned Grade",
                        False,
                        "Student data not updated correctly",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Docente Bachillerato Edit Assigned Grade",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Docente Bachillerato Edit Assigned Grade", False, f"Request error: {str(e)}")
            return False

    def test_docente_bachillerato_delete_assigned_grade(self):
        """Test that docente bachillerato can delete students from assigned grades"""
        user_type = "docente_bachillerato"
        if user_type not in self.tokens:
            self.log_test("Docente Bachillerato Delete Assigned Grade", False, "No docente bachillerato token available")
            return False
            
        # Create a test student in an assigned grade
        student_id = self.create_test_student("admin", "11°")  # Create as admin first
        if not student_id:
            self.log_test("Docente Bachillerato Delete Assigned Grade", False, "Could not create test student")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            response = self.session.delete(
                f"{BASE_URL}/students/{student_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test(
                        "Docente Bachillerato Delete Assigned Grade",
                        True,
                        f"Successfully deleted student from assigned grade"
                    )
                    return True
                else:
                    self.log_test(
                        "Docente Bachillerato Delete Assigned Grade",
                        False,
                        "Missing success flag in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Docente Bachillerato Delete Assigned Grade",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Docente Bachillerato Delete Assigned Grade", False, f"Request error: {str(e)}")
            return False

    def test_docente_bachillerato_cannot_edit_other_grades(self):
        """Test that docente bachillerato CANNOT edit students from other grades"""
        user_type = "docente_bachillerato"
        if user_type not in self.tokens:
            self.log_test("Docente Bachillerato Cannot Edit Other Grades", False, "No docente bachillerato token available")
            return False
            
        # Create a test student in a non-assigned grade (1° - primaria)
        student_id = self.create_test_student("admin", "1°")  # Create as admin first
        if not student_id:
            self.log_test("Docente Bachillerato Cannot Edit Other Grades", False, "Could not create test student")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            # Try to update student from non-assigned grade
            updated_data = {
                "name": f"Intento Edición No Autorizada {datetime.now().strftime('%H%M%S')}",
                "grade": "1°",
                "level": "BÁSICA PRIMARIA",
                "document_number": f"UNAU{random.randint(100000, 999999)}"
            }
            
            response = self.session.put(
                f"{BASE_URL}/students/{student_id}",
                json=updated_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 403:
                self.log_test(
                    "Docente Bachillerato Cannot Edit Other Grades",
                    True,
                    "Correctly denied access to edit student from non-assigned grade"
                )
                return True
            else:
                self.log_test(
                    "Docente Bachillerato Cannot Edit Other Grades",
                    False,
                    f"Expected 403, got {response.status_code} - Security bypass detected!",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Docente Bachillerato Cannot Edit Other Grades", False, f"Request error: {str(e)}")
            return False

    def test_coordinadora_edit_any_student(self):
        """Test that coordinadora convivencia can edit any student"""
        user_type = "coordinadora"
        if user_type not in self.tokens:
            self.log_test("Coordinadora Edit Any Student", False, "No coordinadora token available")
            return False
            
        # Create a test student in any grade
        student_id = self.create_test_student("admin", "5°")  # Create as admin first
        if not student_id:
            self.log_test("Coordinadora Edit Any Student", False, "Could not create test student")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            # Update student data
            updated_data = {
                "name": f"Estudiante Editado Coordinadora {datetime.now().strftime('%H%M%S')}",
                "grade": "5°",
                "level": "BÁSICA PRIMARIA",
                "document_number": f"COORD{random.randint(100000, 999999)}"
            }
            
            response = self.session.put(
                f"{BASE_URL}/students/{student_id}",
                json=updated_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("name") == updated_data["name"]:
                    self.log_test(
                        "Coordinadora Edit Any Student",
                        True,
                        f"Successfully updated student: {data.get('name')}"
                    )
                    return True
                else:
                    self.log_test(
                        "Coordinadora Edit Any Student",
                        False,
                        "Student data not updated correctly",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Coordinadora Edit Any Student",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Coordinadora Edit Any Student", False, f"Request error: {str(e)}")
            return False

    def test_coordinadora_delete_any_student(self):
        """Test that coordinadora convivencia can delete any student"""
        user_type = "coordinadora"
        if user_type not in self.tokens:
            self.log_test("Coordinadora Delete Any Student", False, "No coordinadora token available")
            return False
            
        # Create a test student in any grade
        student_id = self.create_test_student("admin", "3°")  # Create as admin first
        if not student_id:
            self.log_test("Coordinadora Delete Any Student", False, "Could not create test student")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            response = self.session.delete(
                f"{BASE_URL}/students/{student_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test(
                        "Coordinadora Delete Any Student",
                        True,
                        f"Successfully deleted student"
                    )
                    return True
                else:
                    self.log_test(
                        "Coordinadora Delete Any Student",
                        False,
                        "Missing success flag in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Coordinadora Delete Any Student",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Coordinadora Delete Any Student", False, f"Request error: {str(e)}")
            return False

    def test_unauthorized_access_without_token(self):
        """Test that endpoints are protected against unauthorized access"""
        test_student_id = "test_id"
        
        # Test DELETE without token
        try:
            response = self.session.delete(
                f"{BASE_URL}/students/{test_student_id}",
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code in [401, 403]:
                self.log_test("Unauthorized Delete Access", True, "Correctly rejected unauthenticated request")
            else:
                self.log_test(
                    "Unauthorized Delete Access",
                    False,
                    f"Expected 401/403, got {response.status_code}",
                    response.text
                )
                return False
        except Exception as e:
            self.log_test("Unauthorized Delete Access", False, f"Request error: {str(e)}")
            return False
        
        # Test PUT without token
        try:
            update_data = {"name": "Test Update"}
            response = self.session.put(
                f"{BASE_URL}/students/{test_student_id}",
                json=update_data,
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code in [401, 403]:
                self.log_test("Unauthorized Edit Access", True, "Correctly rejected unauthenticated request")
                return True
            else:
                self.log_test(
                    "Unauthorized Edit Access",
                    False,
                    f"Expected 401/403, got {response.status_code}",
                    response.text
                )
                return False
        except Exception as e:
            self.log_test("Unauthorized Edit Access", False, f"Request error: {str(e)}")
            return False

    def run_student_management_tests(self):
        """Run comprehensive student management tests focusing on new functionalities"""
        print("🚀 Starting Student Management Tests - New Functionalities")
        print("🎯 FOCUS: DELETE /api/students/{id}, DELETE /api/students/bulk, PUT /api/students/{id}")
        print("🔐 SECURITY: Role-based permissions testing")
        print("=" * 80)
        
        # Test 1: Health check
        if not self.test_health_check():
            print("❌ Backend is not accessible. Stopping tests.")
            return False
        
        # Test 2: Login success for all user types
        login_success_count = 0
        for user_type, credentials in TEST_USERS.items():
            if self.test_login_success(user_type, credentials):
                login_success_count += 1
        
        if login_success_count == 0:
            print("❌ No successful logins. Cannot proceed with tests.")
            return False
        
        print(f"\n✅ Authentication successful for {login_success_count}/{len(TEST_USERS)} users")
        
        # Test 3: Administrator functionalities
        print("\n" + "=" * 80)
        print("🔧 ADMINISTRATOR TESTS")
        print("=" * 80)
        
        self.test_admin_delete_individual_student()
        self.test_admin_bulk_delete_students()
        self.test_admin_edit_student()
        
        # Test 4: Docente Bachillerato functionalities
        print("\n" + "=" * 80)
        print("👨‍🏫 DOCENTE BACHILLERATO TESTS")
        print("=" * 80)
        
        self.test_docente_bachillerato_edit_assigned_grade()
        self.test_docente_bachillerato_delete_assigned_grade()
        self.test_docente_bachillerato_cannot_edit_other_grades()
        
        # Test 5: Coordinadora Convivencia functionalities
        print("\n" + "=" * 80)
        print("👩‍💼 COORDINADORA CONVIVENCIA TESTS")
        print("=" * 80)
        
        self.test_coordinadora_edit_any_student()
        self.test_coordinadora_delete_any_student()
        
        # Test 6: Security tests
        print("\n" + "=" * 80)
        print("🔒 SECURITY TESTS")
        print("=" * 80)
        
        self.test_unauthorized_access_without_token()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 STUDENT MANAGEMENT TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📈 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Categorize results by role
        admin_tests = [r for r in self.test_results if "Admin" in r["test"]]
        docente_tests = [r for r in self.test_results if "Docente" in r["test"]]
        coordinadora_tests = [r for r in self.test_results if "Coordinadora" in r["test"]]
        security_tests = [r for r in self.test_results if "Unauthorized" in r["test"]]
        
        print(f"\n📋 Test Categories:")
        print(f"   🔧 Administrator: {sum(1 for r in admin_tests if r['success'])}/{len(admin_tests)} passed")
        print(f"   👨‍🏫 Docente Bachillerato: {sum(1 for r in docente_tests if r['success'])}/{len(docente_tests)} passed")
        print(f"   👩‍💼 Coordinadora: {sum(1 for r in coordinadora_tests if r['success'])}/{len(coordinadora_tests)} passed")
        print(f"   🔒 Security: {sum(1 for r in security_tests if r['success'])}/{len(security_tests)} passed")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS ({failed_tests}):")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        # Security-specific analysis
        security_failures = [r for r in self.test_results if not r["success"] and ("Cannot" in r["test"] or "Unauthorized" in r["test"])]
        if security_failures:
            print(f"\n🚨 CRITICAL SECURITY ISSUES ({len(security_failures)}):")
            for result in security_failures:
                print(f"  - {result['test']}: {result['details']}")
        
        return failed_tests == 0

def main():
    """Main test execution"""
    tester = StudentManagementTester()
    success = tester.run_student_management_tests()
    
    # Save detailed results
    with open("/app/student_management_test_results.json", "w") as f:
        json.dump(tester.test_results, f, indent=2, default=str)
    
    print(f"\n📄 Detailed results saved to: /app/student_management_test_results.json")
    
    if success:
        print("\n🎉 All student management tests passed!")
        print("✅ Administrator functionalities working")
        print("✅ Docente Bachillerato permissions working")
        print("✅ Coordinadora Convivencia permissions working")
        print("✅ Security controls working")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check the details above.")
        print("🔍 Focus on security failures - ensure role-based permissions are working correctly")
        sys.exit(1)

if __name__ == "__main__":
    main()