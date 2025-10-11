#!/usr/bin/env python3
"""
PRUEBA FINAL: Persistencia de Notas - GAA Educational System
Test específico usando el estudiante correcto asignado a bifencia.orozco
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://user-permissions-2.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Credenciales específicas del usuario reportado
TEST_CREDENTIALS = {"username": "bifencia.orozco", "password": "gim123"}

# Student ID assigned to bifencia.orozco (found in previous analysis)
CORRECT_STUDENT_ID = "est002"  # MUÑOZ RADA ASHLEY SALOME

class FinalPersistenceTester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
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
                        "1. Login bifencia.orozco/gim123",
                        True,
                        f"User: {user_info.get('name', 'Unknown')}, Role: {user_info.get('role', 'Unknown')}"
                    )
                    return True
                else:
                    self.log_test(
                        "1. Login bifencia.orozco/gim123",
                        False,
                        "Missing success flag or token in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "1. Login bifencia.orozco/gim123",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("1. Login bifencia.orozco/gim123", False, f"Request error: {str(e)}")
            return False

    def assign_specific_grade(self):
        """Assign specific grade: 4.3 in MATEMÁTICA período I to correct student"""
        if not self.token:
            self.log_test("2. Assign Grade 4.3 MATEMÁTICA", False, "No token available")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.token}"
            }
            
            # Specific grade data as requested - using correct student ID
            grade_data = {
                "student_id": CORRECT_STUDENT_ID,
                "subject": "MATEMÁTICA",
                "period": "I",
                "grade": 4.3,
                "teacher_notes": "Nota de prueba - persistencia entre sesiones"
            }
            
            response = self.session.post(
                f"{BASE_URL}/grades",
                json=grade_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("student_id") == CORRECT_STUDENT_ID and data.get("grade") == 4.3:
                    self.log_test(
                        "2. Assign Grade 4.3 MATEMÁTICA",
                        True,
                        f"Grade assigned to MUÑOZ RADA ASHLEY SALOME: {data.get('subject')} - {data.get('grade')} (Period: {data.get('period')})"
                    )
                    return True
                else:
                    self.log_test(
                        "2. Assign Grade 4.3 MATEMÁTICA",
                        False,
                        "Grade data mismatch in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "2. Assign Grade 4.3 MATEMÁTICA",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("2. Assign Grade 4.3 MATEMÁTICA", False, f"Request error: {str(e)}")
            return False

    def verify_grade_in_database(self):
        """Verify grade is saved in database using GET"""
        if not self.token:
            self.log_test("3. Verify Grade in Database", False, "No token available")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.token}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/grades/student/{CORRECT_STUDENT_ID}?period=I",
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
                        "3. Verify Grade in Database",
                        True,
                        f"Grade confirmed in database: MATEMÁTICA = {math_grade.get('grade')} (Period I) for MUÑOZ RADA ASHLEY SALOME"
                    )
                    return True
                else:
                    found_grades = [f"{g.get('subject')}: {g.get('grade')}" for g in grades]
                    self.log_test(
                        "3. Verify Grade in Database",
                        False,
                        f"Grade 4.3 in MATEMÁTICA not found. Found grades: {found_grades}",
                        grades
                    )
                    return False
            else:
                self.log_test(
                    "3. Verify Grade in Database",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("3. Verify Grade in Database", False, f"Request error: {str(e)}")
            return False

    def logout_user(self):
        """Logout the user"""
        if not self.token:
            self.log_test("4. Logout User", False, "No token available")
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
                    self.log_test("4. Logout User", True, "Successfully logged out - session ended")
                    # Clear token to simulate session end
                    self.token = None
                    return True
                else:
                    self.log_test(
                        "4. Logout User",
                        False,
                        "Missing success flag in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "4. Logout User",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("4. Logout User", False, f"Request error: {str(e)}")
            return False

    def login_again(self):
        """Login again to test persistence"""
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
                        "5. Re-login bifencia.orozco/gim123",
                        True,
                        f"Successfully logged in again: {user_info.get('name', 'Unknown')}"
                    )
                    return True
                else:
                    self.log_test(
                        "5. Re-login bifencia.orozco/gim123",
                        False,
                        "Missing success flag or token in response",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "5. Re-login bifencia.orozco/gim123",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("5. Re-login bifencia.orozco/gim123", False, f"Request error: {str(e)}")
            return False

    def verify_grade_persists_after_relogin(self):
        """Verify grade appears after re-login (getStudentGrades should return the data)"""
        if not self.token:
            self.log_test("6. Verify Grade Persists After Re-login", False, "No token available")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.token}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/grades/student/{CORRECT_STUDENT_ID}?period=I",
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
                        "6. Verify Grade Persists After Re-login",
                        True,
                        f"🎉 PERSISTENCE CONFIRMED: Grade 4.3 in MATEMÁTICA still appears after re-login for MUÑOZ RADA ASHLEY SALOME"
                    )
                    return True
                else:
                    found_grades = [f"{g.get('subject')}: {g.get('grade')}" for g in grades]
                    self.log_test(
                        "6. Verify Grade Persists After Re-login",
                        False,
                        f"❌ PERSISTENCE FAILED: Grade 4.3 in MATEMÁTICA not found after re-login. Found: {found_grades}",
                        grades
                    )
                    return False
            else:
                self.log_test(
                    "6. Verify Grade Persists After Re-login",
                    False,
                    f"Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("6. Verify Grade Persists After Re-login", False, f"Request error: {str(e)}")
            return False

    def run_final_persistence_test(self):
        """Run the final persistence test with correct student"""
        print("🎯 PRUEBA FINAL: Persistencia de Notas")
        print("Usuario: bifencia.orozco/gim123 (docente bachillerato)")
        print("Estudiante: MUÑOZ RADA ASHLEY SALOME (est002) - Asignado correctamente")
        print("Objetivo: Verificar que nota 4.3 en MATEMÁTICA período I persiste entre sesiones")
        print("=" * 80)
        
        # Step 1: Login
        if not self.test_login():
            print("❌ Cannot proceed without successful login")
            return False
        
        # Step 2: Assign specific grade (4.3 in MATEMÁTICA período I)
        if not self.assign_specific_grade():
            print("❌ Failed to assign grade - this is the core issue")
            return False
        
        # Step 3: Verify grade is saved in database
        if not self.verify_grade_in_database():
            print("❌ Grade not saved in database")
            return False
        
        # Step 4: Logout
        if not self.logout_user():
            print("⚠️ Logout failed but continuing test")
        
        # Step 5: Login again
        if not self.login_again():
            print("❌ Cannot re-login to test persistence")
            return False
        
        # Step 6: Verify grade persists (appears automatically)
        if not self.verify_grade_persists_after_relogin():
            print("❌ CRITICAL: Grade does not persist between sessions")
            return False
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 FINAL PERSISTENCE TEST SUMMARY")
        print("=" * 80)
        
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
            print("✅ User's reported issue is RESOLVED")
        else:
            print(f"\n❌ PERSISTENCE TEST FAILED!")
            print("Failed tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        return failed_tests == 0

def main():
    """Main test execution"""
    tester = FinalPersistenceTester()
    success = tester.run_final_persistence_test()
    
    # Save detailed results
    with open("/app/final_persistence_test_results.json", "w") as f:
        json.dump(tester.test_results, f, indent=2, default=str)
    
    print(f"\n📄 Detailed results saved to: /app/final_persistence_test_results.json")
    
    if success:
        print("\n✅ GRADE PERSISTENCE WORKING CORRECTLY")
        print("🔧 The user's reported issue about grade persistence is RESOLVED")
        sys.exit(0)
    else:
        print("\n❌ GRADE PERSISTENCE ISSUE CONFIRMED")
        print("🔧 The user's reported issue about grade persistence is VALID")
        sys.exit(1)

if __name__ == "__main__":
    main()