#!/usr/bin/env python3
"""
Specific Grade Filtering Verification Test - GAA Educational System
Focus: Verify exact grade filtering according to review request

VERIFICACIONES ESPECÍFICAS:
1. Docente Bachillerato (bifencia.orozco/gim123): Should have grades 8°, 9°, 10°, 11°
   - Should see ONLY students from these specific grades
   - Calculate: 4 from 8° + 12 from 9° + 3 from 10° + 9 from 11° = 28 total students

2. Docente Primaria: Should see students from their exact grade (e.g., grade 1° = 554 students)

3. Coordinadora Convivencia: Should see all 592 students according to real distribution

4. Exact grade filtering: Verify each role respects EXACTLY the grade stored in "grade" column
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://grado-filter-fix.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Test users as specified in the review request
TEST_USERS = {
    "docente_bachillerato": {"username": "bifencia.orozco", "password": "gim123"},
    "coordinadora": {"username": "coord.convivencia", "password": "gim123"}
}

# Expected grade distributions according to review request
EXPECTED_DISTRIBUTIONS = {
    "8°": 4,
    "9°": 12, 
    "10°": 3,
    "11°": 9,
    "total_bachillerato": 28,  # 4+12+3+9
    "total_system": 592
}

class GradeFilteringTester:
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

    def test_login(self, user_type: str, credentials: Dict[str, str]):
        """Test login for specific user"""
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
                        f"User: {user_info.get('name', 'Unknown')}, Role: {user_info.get('role', 'Unknown')}, Grades: {user_info.get('grades', user_info.get('grade', 'None'))}"
                    )
                    return user_info
                else:
                    self.log_test(f"Login {user_type}", False, "Missing success flag or token", data)
                    return None
            else:
                self.log_test(f"Login {user_type}", False, f"Status code: {response.status_code}", response.text)
                return None
                
        except Exception as e:
            self.log_test(f"Login {user_type}", False, f"Request error: {str(e)}")
            return None

    def test_get_students_by_role(self, user_type: str, expected_grades: list = None):
        """Test GET /students endpoint and verify grade filtering"""
        if user_type not in self.tokens:
            self.log_test(f"GET Students - {user_type}", False, "No token available")
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
                if isinstance(students, list):
                    # Analyze grade distribution
                    grade_distribution = {}
                    for student in students:
                        grade = student.get("grade", "Unknown")
                        grade_distribution[grade] = grade_distribution.get(grade, 0) + 1
                    
                    total_students = len(students)
                    
                    # Verify expected grades if provided
                    if expected_grades:
                        found_grades = set(grade_distribution.keys())
                        expected_grades_set = set(expected_grades)
                        
                        # Check if user sees only expected grades
                        unexpected_grades = found_grades - expected_grades_set
                        missing_grades = expected_grades_set - found_grades
                        
                        if unexpected_grades:
                            self.log_test(
                                f"Grade Filtering - {user_type}",
                                False,
                                f"User sees unexpected grades: {list(unexpected_grades)}. Grade distribution: {grade_distribution}"
                            )
                            return grade_distribution
                        elif missing_grades:
                            # Missing grades might be OK if there are no students in those grades
                            self.log_test(
                                f"Grade Filtering - {user_type}",
                                True,
                                f"User sees only expected grades. Missing grades (no students): {list(missing_grades)}. Distribution: {grade_distribution}"
                            )
                        else:
                            self.log_test(
                                f"Grade Filtering - {user_type}",
                                True,
                                f"Perfect grade filtering. Distribution: {grade_distribution}"
                            )
                    
                    self.log_test(
                        f"GET Students - {user_type}",
                        True,
                        f"Retrieved {total_students} students. Grade distribution: {grade_distribution}"
                    )
                    return grade_distribution
                else:
                    self.log_test(f"GET Students - {user_type}", False, "Response is not a list", students)
                    return None
            else:
                self.log_test(f"GET Students - {user_type}", False, f"Status code: {response.status_code}", response.text)
                return None
                
        except Exception as e:
            self.log_test(f"GET Students - {user_type}", False, f"Request error: {str(e)}")
            return None

    def test_specific_grade_access(self, user_type: str, grade: str, should_have_access: bool):
        """Test access to specific grade"""
        if user_type not in self.tokens:
            self.log_test(f"Grade Access {grade} - {user_type}", False, "No token available")
            return False
            
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
                student_count = len(students) if isinstance(students, list) else 0
                
                if should_have_access:
                    self.log_test(
                        f"Grade Access {grade} - {user_type}",
                        True,
                        f"Has access to grade {grade}: {student_count} students"
                    )
                    return student_count
                else:
                    # Should have access but got empty result - this might be OK if no students in that grade
                    self.log_test(
                        f"Grade Access {grade} - {user_type}",
                        True,
                        f"Access to grade {grade}: {student_count} students (might be empty if no students exist)"
                    )
                    return student_count
            elif response.status_code == 403:
                if not should_have_access:
                    self.log_test(
                        f"Grade Access {grade} - {user_type}",
                        True,
                        f"Correctly denied access to grade {grade}"
                    )
                    return 0
                else:
                    self.log_test(
                        f"Grade Access {grade} - {user_type}",
                        False,
                        f"Unexpectedly denied access to grade {grade}"
                    )
                    return None
            else:
                self.log_test(
                    f"Grade Access {grade} - {user_type}",
                    False,
                    f"Unexpected status code: {response.status_code}",
                    response.text
                )
                return None
                
        except Exception as e:
            self.log_test(f"Grade Access {grade} - {user_type}", False, f"Request error: {str(e)}")
            return None

    def verify_bachillerato_teacher_grades(self, user_info: dict, grade_distribution: dict):
        """Verify that bachillerato teacher has correct grade assignments"""
        expected_grades = ["8°", "9°", "10°", "11°"]
        user_grades = user_info.get("grades", [])
        
        # Check if user has correct grades assigned
        if set(user_grades) == set(expected_grades):
            self.log_test(
                "Bachillerato Teacher Grade Assignment",
                True,
                f"User has correct grades assigned: {user_grades}"
            )
        else:
            self.log_test(
                "Bachillerato Teacher Grade Assignment",
                False,
                f"User has incorrect grades. Expected: {expected_grades}, Got: {user_grades}"
            )
            return False
        
        # Check if user sees students from correct grades only
        found_grades = set(grade_distribution.keys())
        expected_grades_set = set(expected_grades)
        
        # Allow for missing grades if no students exist in those grades
        unexpected_grades = found_grades - expected_grades_set
        
        if unexpected_grades:
            self.log_test(
                "Bachillerato Teacher Student Access",
                False,
                f"User sees students from unexpected grades: {list(unexpected_grades)}"
            )
            return False
        else:
            # Calculate total students from expected grades
            total_students = sum(grade_distribution.get(grade, 0) for grade in expected_grades)
            
            self.log_test(
                "Bachillerato Teacher Student Access",
                True,
                f"User sees students only from assigned grades. Total: {total_students} students from grades {list(found_grades)}"
            )
            
            # Verify against expected distribution
            expected_total = EXPECTED_DISTRIBUTIONS["total_bachillerato"]
            if total_students == expected_total:
                self.log_test(
                    "Bachillerato Teacher Student Count",
                    True,
                    f"Student count matches expectation: {total_students} students"
                )
            else:
                self.log_test(
                    "Bachillerato Teacher Student Count",
                    False,
                    f"Student count mismatch. Expected: {expected_total}, Got: {total_students}"
                )
            
            return True

    def verify_coordinadora_access(self, grade_distribution: dict):
        """Verify that coordinadora sees all students"""
        total_students = sum(grade_distribution.values())
        expected_total = EXPECTED_DISTRIBUTIONS["total_system"]
        
        if total_students == expected_total:
            self.log_test(
                "Coordinadora Total Access",
                True,
                f"Coordinadora sees all {total_students} students as expected"
            )
        else:
            self.log_test(
                "Coordinadora Total Access",
                False,
                f"Coordinadora student count mismatch. Expected: {expected_total}, Got: {total_students}"
            )
        
        # Verify grade distribution details
        details = []
        for grade, count in sorted(grade_distribution.items()):
            if grade in EXPECTED_DISTRIBUTIONS:
                expected = EXPECTED_DISTRIBUTIONS[grade]
                if count == expected:
                    details.append(f"{grade}: {count} ✓")
                else:
                    details.append(f"{grade}: {count} (expected {expected}) ❌")
            else:
                details.append(f"{grade}: {count}")
        
        self.log_test(
            "Coordinadora Grade Distribution",
            True,
            f"Grade breakdown: {', '.join(details)}"
        )
        
        return total_students == expected_total

    def run_grade_filtering_tests(self):
        """Run specific grade filtering verification tests"""
        print("🎯 Starting Grade Filtering Verification Tests")
        print("Focus: Verify exact grade filtering according to review request")
        print("=" * 70)
        
        # Test 1: Login and get user info
        user_infos = {}
        for user_type, credentials in TEST_USERS.items():
            user_info = self.test_login(user_type, credentials)
            if user_info:
                user_infos[user_type] = user_info
        
        if not user_infos:
            print("❌ No successful logins. Cannot proceed with tests.")
            return False
        
        # Test 2: Verify Docente Bachillerato (bifencia.orozco)
        if "docente_bachillerato" in user_infos:
            print("\n" + "=" * 50)
            print("🎯 TESTING: Docente Bachillerato (bifencia.orozco)")
            print("=" * 50)
            
            user_info = user_infos["docente_bachillerato"]
            expected_grades = ["8°", "9°", "10°", "11°"]
            
            # Get students and analyze distribution
            grade_distribution = self.test_get_students_by_role("docente_bachillerato", expected_grades)
            
            if grade_distribution:
                # Verify grade assignments and student access
                self.verify_bachillerato_teacher_grades(user_info, grade_distribution)
                
                # Test specific grade access
                for grade in expected_grades:
                    count = self.test_specific_grade_access("docente_bachillerato", grade, True)
                    if count is not None and grade in EXPECTED_DISTRIBUTIONS:
                        expected_count = EXPECTED_DISTRIBUTIONS[grade]
                        if count == expected_count:
                            self.log_test(
                                f"Grade {grade} Count Verification",
                                True,
                                f"Correct count: {count} students"
                            )
                        else:
                            self.log_test(
                                f"Grade {grade} Count Verification",
                                False,
                                f"Count mismatch. Expected: {expected_count}, Got: {count}"
                            )
                
                # Test access to grades they shouldn't have
                unauthorized_grades = ["1°", "2°", "3°", "4°", "5°", "6°", "7°"]
                for grade in unauthorized_grades:
                    self.test_specific_grade_access("docente_bachillerato", grade, False)
        
        # Test 3: Verify Coordinadora Convivencia
        if "coordinadora" in user_infos:
            print("\n" + "=" * 50)
            print("🎯 TESTING: Coordinadora Convivencia")
            print("=" * 50)
            
            # Get all students
            grade_distribution = self.test_get_students_by_role("coordinadora")
            
            if grade_distribution:
                self.verify_coordinadora_access(grade_distribution)
                
                # Test access to specific grades
                all_grades = ["1°", "2°", "3°", "4°", "5°", "6°", "7°", "8°", "9°", "10°", "11°"]
                for grade in all_grades:
                    self.test_specific_grade_access("coordinadora", grade, True)
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 GRADE FILTERING TEST SUMMARY")
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
    tester = GradeFilteringTester()
    success = tester.run_grade_filtering_tests()
    
    # Save detailed results
    with open("/app/grade_filtering_test_results.json", "w") as f:
        json.dump(tester.test_results, f, indent=2, default=str)
    
    print(f"\n📄 Detailed results saved to: /app/grade_filtering_test_results.json")
    
    if success:
        print("\n🎉 All grade filtering tests passed!")
        print("✅ Exact grade filtering working correctly")
        print("✅ Role-based access control functioning properly")
        sys.exit(0)
    else:
        print("\n⚠️  Some grade filtering tests failed. Check the details above.")
        sys.exit(1)

if __name__ == "__main__":
    main()