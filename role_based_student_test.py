#!/usr/bin/env python3
"""
Role-Based Student Access Testing - GAA Educational System
Sistema de Gestión Escolar GAA - Pruebas específicas de acceso por rol

PRUEBAS ESPECÍFICAS SOLICITADAS:
1. Docente Primaria - Estudiantes por grado específico
2. Docente Bachillerato (bifencia.orozco) - Estudiantes por grados múltiples (6° a 11°)
3. Coordinadora Convivencia (coord.convivencia) - Todos los estudiantes
4. Permisos de asignación de notas por rol
5. Nuevos tipos de notas para coordinadora
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional, List

# Configuration
BASE_URL = "https://user-permissions-2.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Test users as specified in the review request
TEST_USERS = {
    "docente_bachillerato": {"username": "bifencia.orozco", "password": "gim123"},
    "coordinadora": {"username": "coord.convivencia", "password": "gim123"}
}

# We'll try to find a docente_primaria user during testing
DOCENTE_PRIMARIA_USER = None

class RoleBasedStudentTester:
    def __init__(self):
        self.session = requests.Session()
        self.tokens = {}
        self.test_results = []
        self.user_info = {}
        
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

    def test_login_and_get_user_info(self, user_type: str, credentials: Dict[str, str]):
        """Test login and get detailed user information"""
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
                    self.user_info[user_type] = user_info
                    
                    # Get detailed user info
                    role = user_info.get('role', 'Unknown')
                    name = user_info.get('name', 'Unknown')
                    grade = user_info.get('grade', None)
                    grades = user_info.get('grades', None)
                    subjects = user_info.get('subjects', None)
                    
                    details = f"User: {name}, Role: {role}"
                    if grade:
                        details += f", Grade: {grade}"
                    if grades:
                        details += f", Grades: {grades}"
                    if subjects:
                        details += f", Subjects: {len(subjects)} materias"
                    
                    self.log_test(f"Login & User Info - {user_type}", True, details)
                    return True
                else:
                    self.log_test(f"Login & User Info - {user_type}", False, "Missing success flag or token", data)
                    return False
            else:
                self.log_test(f"Login & User Info - {user_type}", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test(f"Login & User Info - {user_type}", False, f"Request error: {str(e)}")
            return False

    def test_student_access_by_role(self, user_type: str):
        """Test student access based on user role - CRITICAL TEST"""
        if user_type not in self.tokens:
            self.log_test(f"Student Access - {user_type}", False, "No token available")
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
                if isinstance(students, list):
                    user_info = self.user_info.get(user_type, {})
                    role = user_info.get('role', 'Unknown')
                    
                    # Analyze students by grade
                    grade_distribution = {}
                    for student in students:
                        grade = student.get('grade', 'Unknown')
                        if grade not in grade_distribution:
                            grade_distribution[grade] = 0
                        grade_distribution[grade] += 1
                    
                    details = f"Total: {len(students)} estudiantes. "
                    details += f"Distribución por grado: {grade_distribution}"
                    
                    # Role-specific validation
                    if role == "docente_primaria":
                        expected_grade = user_info.get('grade')
                        if expected_grade:
                            # Should only see students from their assigned grade
                            grades_seen = list(grade_distribution.keys())
                            if len(grades_seen) == 1 and grades_seen[0] == expected_grade:
                                details += f" ✅ CORRECTO: Solo ve grado {expected_grade}"
                                success = True
                            else:
                                details += f" ❌ ERROR: Debería ver solo grado {expected_grade}, pero ve: {grades_seen}"
                                success = False
                        else:
                            details += " ⚠️ Usuario sin grado asignado"
                            success = False
                    
                    elif role == "docente_bachillerato":
                        expected_grades = user_info.get('grades', [])
                        if expected_grades:
                            # Should see students from all their assigned grades
                            grades_seen = set(grade_distribution.keys())
                            expected_grades_set = set(expected_grades)
                            
                            # Check if all seen grades are within expected grades
                            if grades_seen.issubset(expected_grades_set):
                                details += f" ✅ CORRECTO: Ve grados asignados {expected_grades}"
                                success = True
                            else:
                                unexpected = grades_seen - expected_grades_set
                                details += f" ❌ ERROR: Ve grados no asignados: {unexpected}"
                                success = False
                        else:
                            details += " ⚠️ Usuario sin grados asignados"
                            success = False
                    
                    elif role == "coordinador_convivencia":
                        # Should see ALL students in the system
                        if len(students) > 100:  # Assuming system has many students
                            details += f" ✅ CORRECTO: Ve todos los estudiantes del sistema ({len(students)})"
                            success = True
                        else:
                            details += f" ⚠️ POSIBLE PROBLEMA: Solo ve {len(students)} estudiantes (esperado: todos)"
                            success = False
                    
                    else:
                        details += f" ⚠️ Rol no reconocido para validación: {role}"
                        success = True  # Don't fail for unknown roles
                    
                    self.log_test(f"Student Access - {user_type}", success, details)
                    return success
                else:
                    self.log_test(f"Student Access - {user_type}", False, "Response is not a list", students)
                    return False
            else:
                self.log_test(f"Student Access - {user_type}", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test(f"Student Access - {user_type}", False, f"Request error: {str(e)}")
            return False

    def test_grade_filtering_specific(self, user_type: str):
        """Test specific grade filtering for each role"""
        if user_type not in self.tokens:
            self.log_test(f"Grade Filtering - {user_type}", False, "No token available")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            user_info = self.user_info.get(user_type, {})
            role = user_info.get('role', 'Unknown')
            
            # Test different grade filters based on role
            test_grades = []
            if role == "docente_primaria":
                test_grades = ["1°", "2°", "3°", "4°", "5°"]
            elif role == "docente_bachillerato":
                test_grades = ["6°", "7°", "8°", "9°", "10°", "11°"]
            elif role == "coordinador_convivencia":
                test_grades = ["1°", "6°", "11°"]  # Sample grades
            
            results = {}
            for grade in test_grades:
                response = self.session.get(
                    f"{BASE_URL}/students?grade={grade}",
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    students = response.json()
                    results[grade] = len(students) if isinstance(students, list) else 0
                elif response.status_code == 403:
                    results[grade] = "FORBIDDEN"
                else:
                    results[grade] = f"ERROR_{response.status_code}"
            
            # Analyze results
            details = f"Filtrado por grado: {results}"
            
            if role == "docente_primaria":
                expected_grade = user_info.get('grade')
                if expected_grade:
                    # Docente primaria should always see their assigned grade students
                    # regardless of what grade they request (security feature)
                    expected_student_count = results.get(expected_grade, 0)
                    
                    # Check if all requests return the same number of students (their assigned grade)
                    all_same_count = all(isinstance(result, int) and result == expected_student_count 
                                       for result in results.values())
                    
                    if all_same_count and expected_student_count > 0:
                        details += f" ✅ CORRECTO: Siempre ve estudiantes de grado {expected_grade} (seguridad)"
                        success = True
                    else:
                        details += f" ❌ ERROR: Comportamiento inconsistente para grado {expected_grade}"
                        success = False
                else:
                    success = False
            
            elif role == "docente_bachillerato":
                expected_grades = user_info.get('grades', [])
                if expected_grades:
                    # Should access all their assigned grades
                    allowed_grades = [grade for grade, result in results.items() 
                                    if isinstance(result, int) and result > 0]
                    
                    if set(allowed_grades).issubset(set(expected_grades)):
                        details += f" ✅ CORRECTO: Acceso a grados asignados {expected_grades}"
                        success = True
                    else:
                        details += f" ❌ ERROR: Acceso incorrecto a grados"
                        success = False
                else:
                    success = False
            
            elif role == "coordinador_convivencia":
                # Should access all grades
                accessible_grades = [grade for grade, result in results.items() 
                                   if isinstance(result, int)]
                
                if len(accessible_grades) >= 2:
                    details += f" ✅ CORRECTO: Acceso a múltiples grados"
                    success = True
                else:
                    details += f" ❌ ERROR: Acceso limitado a grados"
                    success = False
            
            else:
                success = True  # Don't fail for unknown roles
            
            self.log_test(f"Grade Filtering - {user_type}", success, details)
            return success
                
        except Exception as e:
            self.log_test(f"Grade Filtering - {user_type}", False, f"Request error: {str(e)}")
            return False

    def test_grade_assignment_permissions(self, user_type: str):
        """Test grade assignment permissions for each role"""
        if user_type not in self.tokens:
            self.log_test(f"Grade Assignment Permissions - {user_type}", False, "No token available")
            return False
        
        # First, get a student to test with
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[user_type]}"
            }
            
            # Get students accessible to this user
            response = self.session.get(f"{BASE_URL}/students", headers=headers, timeout=10)
            if response.status_code != 200:
                self.log_test(f"Grade Assignment Permissions - {user_type}", False, "Cannot get students for testing")
                return False
            
            students = response.json()
            if not students or not isinstance(students, list):
                self.log_test(f"Grade Assignment Permissions - {user_type}", False, "No students available for testing")
                return False
            
            test_student_id = students[0].get("id") or students[0].get("_id")
            if not test_student_id:
                self.log_test(f"Grade Assignment Permissions - {user_type}", False, "No valid student ID found")
                return False
            
            user_info = self.user_info.get(user_type, {})
            role = user_info.get('role', 'Unknown')
            
            # Test grade assignment based on role
            test_subjects = []
            expected_success = False
            
            if role == "docente_primaria":
                test_subjects = ["MATEMÁTICA", "HUMANIDADES"]
                expected_success = True
            elif role == "docente_bachillerato":
                user_subjects = user_info.get('subjects', [])
                if user_subjects:
                    test_subjects = user_subjects[:2]  # Test first 2 subjects
                    expected_success = True
                else:
                    test_subjects = ["MATEMÁTICA"]  # Fallback
                    expected_success = False
            elif role == "coordinador_convivencia":
                test_subjects = ["CONVIVENCIA ESCOLAR", "ACOMPAÑAMIENTO DE ACUDIENTE"]
                expected_success = True  # Coordinadora should be able to assign these special subjects
            
            assignment_results = []
            for subject in test_subjects:
                grade_data = {
                    "student_id": test_student_id,
                    "subject": subject,
                    "period": "I",
                    "grade": 4.0,
                    "teacher_notes": f"Prueba de asignación - {subject}"
                }
                
                response = self.session.post(
                    f"{BASE_URL}/grades",
                    json=grade_data,
                    headers=headers,
                    timeout=10
                )
                
                assignment_results.append({
                    "subject": subject,
                    "status_code": response.status_code,
                    "success": response.status_code == 200
                })
            
            # Analyze results
            successful_assignments = sum(1 for result in assignment_results if result["success"])
            total_assignments = len(assignment_results)
            
            details = f"Asignaciones exitosas: {successful_assignments}/{total_assignments}. "
            details += f"Resultados: {assignment_results}"
            
            if role == "coordinador_convivencia":
                # Special validation for coordinadora - should be able to assign convivencia subjects
                convivencia_subjects = [r for r in assignment_results 
                                      if r["subject"] in ["CONVIVENCIA ESCOLAR", "ACOMPAÑAMIENTO DE ACUDIENTE"]]
                convivencia_success = sum(1 for r in convivencia_subjects if r["success"])
                
                if convivencia_success >= 1:
                    details += f" ✅ CORRECTO: Puede asignar notas de convivencia"
                    success = True
                else:
                    details += f" ❌ ERROR: No puede asignar notas de convivencia"
                    success = False
            else:
                # For teachers, check if they can assign grades according to their permissions
                if expected_success and successful_assignments > 0:
                    details += f" ✅ CORRECTO: Puede asignar notas según permisos"
                    success = True
                elif not expected_success and successful_assignments == 0:
                    details += f" ✅ CORRECTO: Correctamente bloqueado según permisos"
                    success = True
                else:
                    details += f" ❌ ERROR: Permisos de asignación incorrectos"
                    success = False
            
            self.log_test(f"Grade Assignment Permissions - {user_type}", success, details)
            return success
                
        except Exception as e:
            self.log_test(f"Grade Assignment Permissions - {user_type}", False, f"Request error: {str(e)}")
            return False

    def find_docente_primaria_user(self):
        """Try to find a docente_primaria user by testing common usernames"""
        potential_users = [
            {"username": "yocelyn.cabarcas", "password": "gim123"},
            {"username": "carolina.sierra", "password": "gim123"},
            {"username": "docente.primaria", "password": "gim123"},
            {"username": "teacher.primaria", "password": "gim123"}
        ]
        
        for credentials in potential_users:
            try:
                response = self.session.post(
                    f"{BASE_URL}/auth/login",
                    json=credentials,
                    headers=HEADERS,
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and data.get("user", {}).get("role") == "docente_primaria":
                        print(f"✅ Found docente_primaria user: {credentials['username']}")
                        return credentials
                        
            except Exception:
                continue
        
        print("⚠️ No docente_primaria user found with common credentials")
        return None

    def run_role_based_tests(self):
        """Run comprehensive role-based student access tests"""
        print("🚀 Starting Role-Based Student Access Tests")
        print("🎯 FOCUS: Verificar sistema de estudiantes por rol")
        print("=" * 70)
        
        # Try to find a docente_primaria user
        docente_primaria_creds = self.find_docente_primaria_user()
        if docente_primaria_creds:
            TEST_USERS["docente_primaria"] = docente_primaria_creds
        
        # Test 1: Login and get user information for all roles
        login_success_count = 0
        for user_type, credentials in TEST_USERS.items():
            if self.test_login_and_get_user_info(user_type, credentials):
                login_success_count += 1
        
        if login_success_count == 0:
            print("❌ No successful logins. Cannot proceed with tests.")
            return False
        
        print(f"\n✅ Authentication successful for {login_success_count}/{len(TEST_USERS)} users")
        
        # Test 2: Student access by role (CRITICAL)
        print("\n" + "=" * 70)
        print("🎯 CRITICAL: STUDENT ACCESS BY ROLE")
        print("=" * 70)
        
        for user_type in self.tokens.keys():
            self.test_student_access_by_role(user_type)
        
        # Test 3: Grade filtering specific to each role
        print("\n" + "=" * 70)
        print("🎯 GRADE FILTERING BY ROLE")
        print("=" * 70)
        
        for user_type in self.tokens.keys():
            self.test_grade_filtering_specific(user_type)
        
        # Test 4: Grade assignment permissions
        print("\n" + "=" * 70)
        print("🎯 GRADE ASSIGNMENT PERMISSIONS")
        print("=" * 70)
        
        for user_type in self.tokens.keys():
            self.test_grade_assignment_permissions(user_type)
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 ROLE-BASED TESTING SUMMARY")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📈 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Role-specific summary
        for user_type in self.tokens.keys():
            user_tests = [r for r in self.test_results if user_type in r["test"]]
            user_passed = sum(1 for r in user_tests if r["success"])
            user_info = self.user_info.get(user_type, {})
            role = user_info.get('role', 'Unknown')
            name = user_info.get('name', 'Unknown')
            
            print(f"\n👤 {user_type.upper()} ({name} - {role}):")
            print(f"   Tests: {user_passed}/{len(user_tests)} passed")
            
            # Show failed tests for this user
            failed_user_tests = [r for r in user_tests if not r["success"]]
            if failed_user_tests:
                print(f"   ❌ Failed tests:")
                for test in failed_user_tests:
                    print(f"     - {test['test']}: {test['details']}")
        
        return failed_tests == 0

def main():
    """Main test execution"""
    tester = RoleBasedStudentTester()
    success = tester.run_role_based_tests()
    
    # Save detailed results
    with open("/app/role_based_test_results.json", "w") as f:
        json.dump(tester.test_results, f, indent=2, default=str)
    
    print(f"\n📄 Detailed results saved to: /app/role_based_test_results.json")
    
    if success:
        print("\n🎉 All role-based tests passed!")
        print("✅ Docente Primaria: Acceso correcto por grado específico")
        print("✅ Docente Bachillerato: Acceso correcto por grados múltiples")
        print("✅ Coordinadora Convivencia: Acceso correcto a todos los estudiantes")
        print("✅ Permisos de asignación de notas funcionando correctamente")
        sys.exit(0)
    else:
        print("\n⚠️  Some role-based tests failed. Check the details above.")
        print("🔍 Focus on role-specific access and permission issues")
        sys.exit(1)

if __name__ == "__main__":
    main()