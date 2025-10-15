#!/usr/bin/env python3
"""
PRUEBA ESPECÍFICA: Persistencia de Notas - GAA Educational System
Test específico para el problema reportado por el usuario sobre persistencia de notas
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration - Using environment variable from frontend/.env
BASE_URL = "https://support-panels.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Credenciales específicas del usuario reportado
TEST_CREDENTIALS = {"username": "bifencia.orozco", "password": "gim123"}

class GradePersistenceTester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.test_results = []
        self.student_id = None
        
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

    def test_login(self):
        """Test login with bifencia.orozco/gim123"""
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=TEST_CREDENTIALS,
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.token = data["token"]
                    user_info = data.get("user", {})
                    self.log_test(
                        "Login bifencia.orozco/gim123",
                        True,
                        f"User: {user_info.get('name', 'Unknown')}, Role: {user_info.get('role', 'Unknown')}"
                    )
                    return True
                else:
                    self.log_test(
                        "Login bifencia.orozco/gim123",
                        False,
                        "Missing success flag or token in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Login bifencia.orozco/gim123",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Login bifencia.orozco/gim123", False, f"Request error: {str(e)}")
            return False

    def get_first_student(self):
        """Get first available student for testing"""
        if not self.token:
            self.log_test("Get First Student", False, "No token available")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.token}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/students",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                students = response.json()
                if students and len(students) > 0:
                    self.student_id = students[0].get("id") or students[0].get("_id")
                    student_name = students[0].get("name", "Unknown")
                    student_grade = students[0].get("grade", "Unknown")
                    self.log_test(
                        "Get First Student",
                        True,
                        f"Student: {student_name}, Grade: {student_grade}, ID: {self.student_id}"
                    )
                    return True
                else:
                    self.log_test("Get First Student", False, "No students found")
                    return False
            else:
                self.log_test(
                    "Get First Student",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Get First Student", False, f"Request error: {str(e)}")
            return False

    def assign_specific_grade(self):
        """Assign specific grade: 4.3 in MATEMÁTICA período I"""
        if not self.token or not self.student_id:
            self.log_test("Assign Grade 4.3 MATEMÁTICA", False, "No token or student ID available")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.token}"
            }
            
            # Specific grade data as requested
            grade_data = {
                "student_id": self.student_id,
                "subject": "MATEMÁTICA",
                "period": "I",
                "grade": 4.3,
                "teacher_notes": "Nota de prueba - persistencia"
            }
            
            response = self.session.post(
                f"{BASE_URL}/grades",
                json=grade_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("student_id") == self.student_id and data.get("grade") == 4.3:
                    self.log_test(
                        "Assign Grade 4.3 MATEMÁTICA",
                        True,
                        f"Grade assigned: {data.get('subject')} - {data.get('grade')} (Period: {data.get('period')})"
                    )
                    return True
                else:
                    self.log_test(
                        "Assign Grade 4.3 MATEMÁTICA",
                        False,
                        "Grade data mismatch in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Assign Grade 4.3 MATEMÁTICA",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Assign Grade 4.3 MATEMÁTICA", False, f"Request error: {str(e)}")
            return False

    def verify_grade_in_database(self):
        """Verify grade is saved in database using GET"""
        if not self.token or not self.student_id:
            self.log_test("Verify Grade in Database", False, "No token or student ID available")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.token}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/grades/student/{self.student_id}?period=I",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                grades = response.json()
                # Look for MATEMÁTICA grade with value 4.3
                math_grade = None
                for grade in grades:
                    if grade.get("subject") == "MATEMÁTICA" and grade.get("period") == "I":
                        math_grade = grade
                        break
                
                if math_grade and math_grade.get("grade") == 4.3:
                    self.log_test(
                        "Verify Grade in Database",
                        True,
                        f"Grade found in database: MATEMÁTICA = {math_grade.get('grade')} (Period I)"
                    )
                    return True
                else:
                    found_grades = [f"{g.get('subject')}: {g.get('grade')}" for g in grades]
                    self.log_test(
                        "Verify Grade in Database",
                        False,
                        f"Grade 4.3 in MATEMÁTICA not found. Found grades: {found_grades}",
                        grades
                    )
                    return False
            else:
                self.log_test(
                    "Verify Grade in Database",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Verify Grade in Database", False, f"Request error: {str(e)}")
            return False

    def logout_user(self):
        """Logout the user"""
        if not self.token:
            self.log_test("Logout User", False, "No token available")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.token}"
            }
            
            response = self.session.post(
                f"{BASE_URL}/auth/logout",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_test("Logout User", True, "Successfully logged out")
                    # Clear token to simulate session end
                    self.token = None
                    return True
                else:
                    self.log_test(
                        "Logout User",
                        False,
                        "Missing success flag in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Logout User",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Logout User", False, f"Request error: {str(e)}")
            return False

    def login_again(self):
        """Login again to test persistence"""
        return self.test_login()

    def verify_grade_persists_after_relogin(self):
        """Verify grade appears after re-login (getStudentGrades should return the data)"""
        if not self.token or not self.student_id:
            self.log_test("Verify Grade Persists After Re-login", False, "No token or student ID available")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.token}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/grades/student/{self.student_id}?period=I",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                grades = response.json()
                # Look for MATEMÁTICA grade with value 4.3
                math_grade = None
                for grade in grades:
                    if grade.get("subject") == "MATEMÁTICA" and grade.get("period") == "I":
                        math_grade = grade
                        break
                
                if math_grade and math_grade.get("grade") == 4.3:
                    self.log_test(
                        "Verify Grade Persists After Re-login",
                        True,
                        f"✅ PERSISTENCE CONFIRMED: Grade 4.3 in MATEMÁTICA still appears after re-login"
                    )
                    return True
                else:
                    found_grades = [f"{g.get('subject')}: {g.get('grade')}" for g in grades]
                    self.log_test(
                        "Verify Grade Persists After Re-login",
                        False,
                        f"❌ PERSISTENCE FAILED: Grade 4.3 in MATEMÁTICA not found after re-login. Found: {found_grades}",
                        grades
                    )
                    return False
            else:
                self.log_test(
                    "Verify Grade Persists After Re-login",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Verify Grade Persists After Re-login", False, f"Request error: {str(e)}")
            return False

    def run_persistence_test(self):
        """Run the specific persistence test as requested"""
        print("🎯 PRUEBA ESPECÍFICA: Persistencia de Notas")
        print("Usuario: bifencia.orozco/gim123 (docente bachillerato)")
        print("Objetivo: Verificar que nota 4.3 en MATEMÁTICA período I persiste entre sesiones")
        print("=" * 70)
        
        # Step 1: Login
        if not self.test_login():
            print("❌ Cannot proceed without successful login")
            return False
        
        # Step 2: Get first available student
        if not self.get_first_student():
            print("❌ Cannot proceed without student ID")
            return False
        
        # Step 3: Assign specific grade (4.3 in MATEMÁTICA período I)
        if not self.assign_specific_grade():
            print("❌ Failed to assign grade - this is the core issue")
            return False
        
        # Step 4: Verify grade is saved in database
        if not self.verify_grade_in_database():
            print("❌ Grade not saved in database")
            return False
        
        # Step 5: Logout
        if not self.logout_user():
            print("⚠️ Logout failed but continuing test")
        
        # Step 6: Login again
        if not self.login_again():
            print("❌ Cannot re-login to test persistence")
            return False
        
        # Step 7: Verify grade persists (appears automatically)
        if not self.verify_grade_persists_after_relogin():
            print("❌ CRITICAL: Grade does not persist between sessions")
            return False
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 PERSISTENCE TEST SUMMARY")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📈 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests == 0:
            print("\n🎉 PERSISTENCE TEST PASSED!")
            print("✅ Grade 4.3 in MATEMÁTICA persists correctly between sessions")
            print("✅ getStudentGrades returns correct data after re-login")
            print("✅ Frontend should show the saved grade automatically")
        else:
            print(f"\n❌ PERSISTENCE TEST FAILED!")
            print("Failed tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        return failed_tests == 0

def main():
    """Main test execution"""
    tester = GradePersistenceTester()
    success = tester.run_persistence_test()
    
    # Save detailed results
    with open("/app/grade_persistence_test_results.json", "w") as f:
        json.dump(tester.test_results, f, indent=2, default=str)
    
    print(f"\n📄 Detailed results saved to: /app/grade_persistence_test_results.json")
    
    if success:
        print("\n✅ GRADE PERSISTENCE WORKING CORRECTLY")
        sys.exit(0)
    else:
        print("\n❌ GRADE PERSISTENCE ISSUE CONFIRMED")
        sys.exit(1)

if __name__ == "__main__":
    main()