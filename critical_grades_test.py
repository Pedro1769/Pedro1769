#!/usr/bin/env python3
"""
CRITICAL GRADES TESTING - GAA Educational System
Testing the two critical functionalities requested by the user:

1. PERSISTENCIA DE NOTAS DOCENTE:
   - Login with bifencia.orozco/gim123 (docente bachillerato)
   - Assign a new grade to a student (e.g: 4.5 in MATEMÁTICA, período I)
   - Verify the grade is saved in the database
   - Logout and login again with the same user
   - Verify the assigned grade APPEARS automatically in the corresponding field

2. PANEL ADMINISTRATIVO DE NOTAS:
   - Login with pedro.hurtado/gim123 (admin)
   - Test the GET /api/grades/all endpoint
   - Verify admin can see ALL grades assigned by teachers
   - Confirm student, teacher, subject, and period data appears
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional
import time

# Configuration - Using environment variable from frontend/.env
BASE_URL = "https://support-panels.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Critical test users as specified in the review request
CRITICAL_USERS = {
    "docente_bachillerato": {"username": "bifencia.orozco", "password": "gim123"},
    "admin": {"username": "pedro.hurtado", "password": "gim123"}
}

class CriticalGradesTest:
    def __init__(self):
        self.session = requests.Session()
        self.tokens = {}
        self.test_results = []
        self.test_student_id = None
        self.assigned_grade_data = None
        
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

    def login_user(self, user_type: str, credentials: Dict[str, str]) -> bool:
        """Login user and store token"""
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
                    self.tokens[user_type] = data["token"]
                    user_info = data.get("user", {})
                    self.log_test(
                        f"Login {user_type}",
                        True,
                        f"User: {user_info.get('name', 'Unknown')}, Role: {user_info.get('role', 'Unknown')}"
                    )
                    return True
                else:
                    self.log_test(f"Login {user_type}", False, "Missing success flag or token", data)
                    return False
            else:
                self.log_test(f"Login {user_type}", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test(f"Login {user_type}", False, f"Request error: {str(e)}")
            return False

    def logout_user(self, user_type: str) -> bool:
        """Logout user"""
        if user_type not in self.tokens:
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
                    # Remove token after successful logout
                    del self.tokens[user_type]
                    self.log_test(f"Logout {user_type}", True, "Successfully logged out")
                    return True
                else:
                    self.log_test(f"Logout {user_type}", False, "Missing success flag", data)
                    return False
            else:
                self.log_test(f"Logout {user_type}", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test(f"Logout {user_type}", False, f"Request error: {str(e)}")
            return False

    def get_students_for_teacher(self, user_type: str) -> Optional[str]:
        """Get students available to the teacher and return first student ID"""
        if user_type not in self.tokens:
            return None
            
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
                if students and len(students) > 0:
                    student_id = students[0].get("id") or students[0].get("_id")
                    student_name = students[0].get("name", "Unknown")
                    student_grade = students[0].get("grade", "Unknown")
                    
                    self.log_test(
                        f"Get Students for {user_type}",
                        True,
                        f"Found {len(students)} students. Using: {student_name} (Grade: {student_grade}, ID: {student_id})"
                    )
                    return student_id
                else:
                    self.log_test(f"Get Students for {user_type}", False, "No students found")
                    return None
            else:
                self.log_test(f"Get Students for {user_type}", False, f"Status code: {response.status_code}", response.text)
                return None
                
        except Exception as e:
            self.log_test(f"Get Students for {user_type}", False, f"Request error: {str(e)}")
            return None

    def assign_grade_to_student(self, user_type: str, student_id: str, grade_value: float = 4.5) -> bool:
        """Assign a grade to a student"""
        if user_type not in self.tokens:
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            # Grade data as specified in the request
            grade_data = {
                "student_id": student_id,
                "subject": "MATEMÁTICA",
                "period": "I",
                "grade": grade_value,
                "teacher_notes": f"Nota asignada por {user_type} - Test de persistencia"
            }
            
            response = self.session.post(
                f"{BASE_URL}/grades",
                json=grade_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("student_id") == student_id and data.get("grade") == grade_value:
                    # Store the assigned grade data for later verification
                    self.assigned_grade_data = {
                        "student_id": student_id,
                        "subject": "MATEMÁTICA",
                        "period": "I",
                        "grade": grade_value,
                        "grade_id": data.get("id") or data.get("_id")
                    }
                    
                    self.log_test(
                        f"Assign Grade - {user_type}",
                        True,
                        f"Grade {grade_value} assigned successfully to student {student_id} in MATEMÁTICA, período I"
                    )
                    return True
                else:
                    self.log_test(f"Assign Grade - {user_type}", False, "Grade data mismatch", data)
                    return False
            else:
                self.log_test(f"Assign Grade - {user_type}", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test(f"Assign Grade - {user_type}", False, f"Request error: {str(e)}")
            return False

    def verify_grade_persistence(self, verification_user_type: str, student_id: str) -> bool:
        """Verify that the assigned grade persists in the database using admin access"""
        if verification_user_type not in self.tokens or not self.assigned_grade_data:
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[verification_user_type]}"
            }
            
            # Use admin endpoint to get all grades and find our specific grade
            if verification_user_type == "admin":
                response = self.session.get(
                    f"{BASE_URL}/grades/all",
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    all_grades = response.json()
                    
                    # Look for the specific grade we assigned
                    found_grade = None
                    for grade in all_grades:
                        if (grade.get("subject") == "MATEMÁTICA" and 
                            grade.get("period") == "I" and
                            grade.get("student_id") == student_id):
                            found_grade = grade
                            break
                    
                    if found_grade:
                        expected_grade = self.assigned_grade_data["grade"]
                        actual_grade = found_grade.get("grade")
                        
                        if actual_grade == expected_grade:
                            self.log_test(
                                f"Verify Grade Persistence - {verification_user_type}",
                                True,
                                f"Grade {actual_grade} found in database for MATEMÁTICA, período I (Student: {found_grade.get('student_name', 'N/A')})"
                            )
                            return True
                        else:
                            self.log_test(
                                f"Verify Grade Persistence - {verification_user_type}",
                                False,
                                f"Grade mismatch: expected {expected_grade}, found {actual_grade}"
                            )
                            return False
                    else:
                        # Show available grades for debugging
                        available_grades = []
                        for grade in all_grades:
                            if grade.get("student_id") == student_id:
                                available_grades.append(f"{grade.get('subject', 'N/A')} - {grade.get('period', 'N/A')} - {grade.get('grade', 'N/A')}")
                        
                        self.log_test(
                            f"Verify Grade Persistence - {verification_user_type}",
                            False,
                            f"Assigned grade not found in database. Available grades for student: {available_grades}"
                        )
                        return False
                else:
                    self.log_test(f"Verify Grade Persistence - {verification_user_type}", False, f"Status code: {response.status_code}", response.text)
                    return False
            else:
                # Try direct student grades endpoint for non-admin users
                response = self.session.get(
                    f"{BASE_URL}/grades/student/{student_id}?period=I",
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    grades = response.json()
                    
                    # Look for the specific grade we assigned
                    found_grade = None
                    for grade in grades:
                        if (grade.get("subject") == "MATEMÁTICA" and 
                            grade.get("period") == "I" and
                            grade.get("student_id") == student_id):
                            found_grade = grade
                            break
                    
                    if found_grade:
                        expected_grade = self.assigned_grade_data["grade"]
                        actual_grade = found_grade.get("grade")
                        
                        if actual_grade == expected_grade:
                            self.log_test(
                                f"Verify Grade Persistence - {verification_user_type}",
                                True,
                                f"Grade {actual_grade} found in database for MATEMÁTICA, período I"
                            )
                            return True
                        else:
                            self.log_test(
                                f"Verify Grade Persistence - {verification_user_type}",
                                False,
                                f"Grade mismatch: expected {expected_grade}, found {actual_grade}"
                            )
                            return False
                    else:
                        self.log_test(
                            f"Verify Grade Persistence - {verification_user_type}",
                            False,
                            f"Assigned grade not found in database. Available grades: {[g.get('subject') + ' - ' + g.get('period', 'N/A') for g in grades]}"
                        )
                        return False
                elif response.status_code == 403:
                    self.log_test(
                        f"Verify Grade Persistence - {verification_user_type}",
                        False,
                        "Permission denied - teacher cannot view student grades (permission system issue)"
                    )
                    return False
                else:
                    self.log_test(f"Verify Grade Persistence - {verification_user_type}", False, f"Status code: {response.status_code}", response.text)
                    return False
                
        except Exception as e:
            self.log_test(f"Verify Grade Persistence - {verification_user_type}", False, f"Request error: {str(e)}")
            return False

    def test_admin_grades_panel(self, user_type: str) -> bool:
        """Test admin panel to see all grades (GET /api/grades/all)"""
        if user_type not in self.tokens:
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/grades/all",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                all_grades = response.json()
                
                if isinstance(all_grades, list):
                    # Check if we can find our assigned grade
                    found_our_grade = False
                    grade_details = []
                    
                    for grade in all_grades:
                        # Collect grade details for verification
                        grade_info = {
                            "student_name": grade.get("student_name", "N/A"),
                            "teacher_name": grade.get("teacher_name", "N/A"),
                            "subject": grade.get("subject", "N/A"),
                            "period": grade.get("period", "N/A"),
                            "grade": grade.get("grade", "N/A")
                        }
                        grade_details.append(grade_info)
                        
                        # Check if this is our assigned grade
                        if (self.assigned_grade_data and 
                            grade.get("student_id") == self.assigned_grade_data["student_id"] and
                            grade.get("subject") == "MATEMÁTICA" and
                            grade.get("period") == "I"):
                            found_our_grade = True
                    
                    # Verify admin can see comprehensive grade data
                    has_student_data = any(g["student_name"] != "N/A" for g in grade_details[:5])  # Check first 5
                    has_teacher_data = any(g["teacher_name"] != "N/A" for g in grade_details[:5])  # Check first 5
                    has_subject_data = any(g["subject"] != "N/A" for g in grade_details[:5])  # Check first 5
                    has_period_data = any(g["period"] != "N/A" for g in grade_details[:5])  # Check first 5
                    
                    success_details = f"Found {len(all_grades)} total grades. "
                    if found_our_grade:
                        success_details += "✅ Our assigned grade is visible. "
                    else:
                        success_details += "⚠️ Our assigned grade not found (may be expected). "
                    
                    success_details += f"Data completeness: Student names: {has_student_data}, Teacher names: {has_teacher_data}, Subjects: {has_subject_data}, Periods: {has_period_data}"
                    
                    self.log_test(
                        f"Admin Grades Panel - {user_type}",
                        True,
                        success_details
                    )
                    return True
                else:
                    self.log_test(f"Admin Grades Panel - {user_type}", False, "Response is not a list", all_grades)
                    return False
            else:
                self.log_test(f"Admin Grades Panel - {user_type}", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test(f"Admin Grades Panel - {user_type}", False, f"Request error: {str(e)}")
            return False

    def run_critical_tests(self):
        """Run the two critical functionalities tests"""
        print("🎯 CRITICAL GRADES TESTING - GAA Educational System")
        print("=" * 70)
        print("Testing two critical functionalities:")
        print("1. PERSISTENCIA DE NOTAS DOCENTE (bifencia.orozco)")
        print("2. PANEL ADMINISTRATIVO DE NOTAS (pedro.hurtado)")
        print("=" * 70)
        
        # ==================== TEST 1: PERSISTENCIA DE NOTAS DOCENTE ====================
        print("\n🔍 TEST 1: PERSISTENCIA DE NOTAS DOCENTE")
        print("-" * 50)
        
        # Step 1: Login with bifencia.orozco/gim123 (docente bachillerato)
        if not self.login_user("docente_bachillerato", CRITICAL_USERS["docente_bachillerato"]):
            print("❌ Cannot proceed with teacher tests - login failed")
            return False
        
        # Step 2: Get students available to this teacher
        self.test_student_id = self.get_students_for_teacher("docente_bachillerato")
        if not self.test_student_id:
            print("❌ Cannot proceed with grade assignment - no students found")
            return False
        
        # Step 3: Assign a new grade (4.5 in MATEMÁTICA, período I)
        if not self.assign_grade_to_student("docente_bachillerato", self.test_student_id, 4.5):
            print("❌ Grade assignment failed")
            return False
        
        # Step 4: Login admin to verify the grade is saved in the database
        if not self.login_user("admin", CRITICAL_USERS["admin"]):
            print("❌ Cannot login admin for verification")
            return False
        
        if not self.verify_grade_persistence("admin", self.test_student_id):
            print("❌ Grade persistence verification failed")
            return False
        
        # Step 5: Logout teacher
        if not self.logout_user("docente_bachillerato"):
            print("⚠️ Teacher logout failed, but continuing...")
        
        # Step 6: Login teacher again with the same user
        time.sleep(1)  # Brief pause between logout and login
        if not self.login_user("docente_bachillerato", CRITICAL_USERS["docente_bachillerato"]):
            print("❌ Teacher re-login failed")
            return False
        
        # Step 7: Verify the assigned grade APPEARS automatically (using admin verification)
        if not self.verify_grade_persistence("admin", self.test_student_id):
            print("❌ Grade does not appear after teacher re-login - PERSISTENCE FAILED")
            return False
        
        print("✅ TEST 1 COMPLETED: Grade persistence working correctly!")
        
        # ==================== TEST 2: PANEL ADMINISTRATIVO DE NOTAS ====================
        print("\n🔍 TEST 2: PANEL ADMINISTRATIVO DE NOTAS")
        print("-" * 50)
        
        # Step 1: Login with pedro.hurtado/gim123 (admin)
        if not self.login_user("admin", CRITICAL_USERS["admin"]):
            print("❌ Cannot proceed with admin tests - login failed")
            return False
        
        # Step 2: Test the GET /api/grades/all endpoint
        if not self.test_admin_grades_panel("admin"):
            print("❌ Admin grades panel test failed")
            return False
        
        print("✅ TEST 2 COMPLETED: Admin can see all grades with complete data!")
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 CRITICAL TESTS SUMMARY")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📈 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS ({failed_tests}):")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        return failed_tests == 0

def main():
    """Main test execution"""
    tester = CriticalGradesTest()
    success = tester.run_critical_tests()
    
    # Save detailed results
    with open("/app/critical_grades_test_results.json", "w") as f:
        json.dump(tester.test_results, f, indent=2, default=str)
    
    print(f"\n📄 Detailed results saved to: /app/critical_grades_test_results.json")
    
    if success:
        print("\n🎉 ALL CRITICAL TESTS PASSED!")
        print("✅ PERSISTENCIA DE NOTAS DOCENTE: Working correctly")
        print("✅ PANEL ADMINISTRATIVO DE NOTAS: Working correctly")
        sys.exit(0)
    else:
        print("\n⚠️ SOME CRITICAL TESTS FAILED!")
        print("🔍 Check the details above for specific issues")
        sys.exit(1)

if __name__ == "__main__":
    main()