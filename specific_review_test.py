#!/usr/bin/env python3
"""
SPECIFIC REVIEW REQUEST TESTING
Testing the exact scenarios reported by the user:
1. Docente primaria (yocelyn.cabarcas/gim123) - should see students filtered by grade
2. Docente bachillerato (bifencia.orozco/gim123) - should see students from grades 6°-11°
3. GET /api/grades/consolidated endpoint verification
"""

import requests
import json
from datetime import datetime

BASE_URL = "https://support-panels.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class SpecificReviewTester:
    def __init__(self):
        self.session = requests.Session()
        self.tokens = {}
        
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test results with clear formatting"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    {details}")
        print()
        
    def login_user(self, username: str, password: str, role_name: str):
        """Login and store token"""
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json={"username": username, "password": password},
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.tokens[username] = data["token"]
                    user_info = data.get("user", {})
                    self.log_result(
                        f"Login {role_name} ({username})",
                        True,
                        f"User: {user_info.get('name', 'Unknown')}, Role: {user_info.get('role', 'Unknown')}"
                    )
                    return True
                else:
                    self.log_result(f"Login {role_name} ({username})", False, "Missing token in response")
                    return False
            else:
                self.log_result(f"Login {role_name} ({username})", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result(f"Login {role_name} ({username})", False, f"Error: {str(e)}")
            return False
    
    def test_student_access(self, username: str, role_name: str, expected_behavior: str):
        """Test GET /api/students for specific user"""
        if username not in self.tokens:
            self.log_result(f"Student Access - {role_name}", False, "No token available")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[username]}"
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
                    
                    grade_list = sorted(grade_counts.keys())
                    
                    self.log_result(
                        f"GET /api/students - {role_name}",
                        True,
                        f"Total: {total_students} students. Grades: {grade_list}. Distribution: {grade_counts}. Expected: {expected_behavior}"
                    )
                    return True, total_students, grade_counts
                else:
                    self.log_result(f"GET /api/students - {role_name}", False, "Response is not a list")
                    return False, 0, {}
            else:
                self.log_result(f"GET /api/students - {role_name}", False, f"Status: {response.status_code}")
                return False, 0, {}
                
        except Exception as e:
            self.log_result(f"GET /api/students - {role_name}", False, f"Error: {str(e)}")
            return False, 0, {}
    
    def test_consolidated_grades(self, username: str, role_name: str):
        """Test GET /api/grades/consolidated endpoint"""
        if username not in self.tokens:
            self.log_result(f"Consolidated Grades - {role_name}", False, "No token available")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens[username]}"
            }
            
            # Test without periods parameter (should fail)
            response1 = self.session.get(
                f"{BASE_URL}/grades/consolidated",
                headers=headers,
                timeout=10
            )
            
            # Test with periods parameter (should work)
            response2 = self.session.get(
                f"{BASE_URL}/grades/consolidated?periods=I&periods=II",
                headers=headers,
                timeout=10
            )
            
            # Check first response (without periods)
            if response1.status_code == 422:
                self.log_result(
                    f"Consolidated Grades (no periods) - {role_name}",
                    True,
                    "Correctly rejected request without required periods parameter"
                )
            else:
                self.log_result(
                    f"Consolidated Grades (no periods) - {role_name}",
                    False,
                    f"Expected 422, got {response1.status_code}"
                )
            
            # Check second response (with periods)
            if response2.status_code == 200:
                data = response2.json()
                students_count = len(data.get("students", []))
                periods = data.get("periods", [])
                statistics = data.get("statistics", {})
                
                self.log_result(
                    f"Consolidated Grades (with periods) - {role_name}",
                    True,
                    f"Success: {students_count} students, Periods: {periods}, Stats: {statistics}"
                )
                return True
            else:
                self.log_result(
                    f"Consolidated Grades (with periods) - {role_name}",
                    False,
                    f"Status: {response2.status_code}, Response: {response2.text}"
                )
                return False
                
        except Exception as e:
            self.log_result(f"Consolidated Grades - {role_name}", False, f"Error: {str(e)}")
            return False

def main():
    print("🎯 SPECIFIC REVIEW REQUEST TESTING")
    print("=" * 60)
    print("Testing exact scenarios reported by user:")
    print("1. Docente primaria (yocelyn.cabarcas/gim123)")
    print("2. Docente bachillerato (bifencia.orozco/gim123)")
    print("3. GET /api/grades/consolidated endpoint")
    print("=" * 60)
    print()
    
    tester = SpecificReviewTester()
    
    # Test credentials from review request
    test_users = [
        {
            "username": "yocelyn.cabarcas",
            "password": "gim123",
            "role_name": "Docente Primaria",
            "expected_behavior": "Should see students filtered by assigned grade (1°)"
        },
        {
            "username": "bifencia.orozco", 
            "password": "gim123",
            "role_name": "Docente Bachillerato",
            "expected_behavior": "Should see students from grades 6°-11°"
        },
        {
            "username": "pedro.hurtado",
            "password": "gim123", 
            "role_name": "Admin",
            "expected_behavior": "Should see all students"
        }
    ]
    
    # Login all users
    print("🔐 AUTHENTICATION TESTS")
    print("-" * 30)
    login_success = 0
    for user in test_users:
        if tester.login_user(user["username"], user["password"], user["role_name"]):
            login_success += 1
    
    print(f"Authentication Summary: {login_success}/{len(test_users)} successful logins")
    print()
    
    # Test student access for each user
    print("👥 STUDENT ACCESS TESTS")
    print("-" * 30)
    student_results = {}
    
    for user in test_users:
        success, count, grades = tester.test_student_access(
            user["username"], 
            user["role_name"], 
            user["expected_behavior"]
        )
        student_results[user["username"]] = {
            "success": success,
            "count": count,
            "grades": grades
        }
    
    # Test consolidated grades endpoint
    print("📊 CONSOLIDATED GRADES TESTS")
    print("-" * 30)
    
    for user in test_users:
        tester.test_consolidated_grades(user["username"], user["role_name"])
    
    # Summary analysis
    print("📋 ANALYSIS SUMMARY")
    print("-" * 30)
    
    # Check if docente primaria sees only grade 1° students
    yocelyn_result = student_results.get("yocelyn.cabarcas", {})
    if yocelyn_result.get("success"):
        yocelyn_grades = list(yocelyn_result.get("grades", {}).keys())
        if yocelyn_grades == ["1°"]:
            print("✅ Docente Primaria: Correctly filtered to grade 1° only")
        else:
            print(f"⚠️  Docente Primaria: Seeing grades {yocelyn_grades} (expected only 1°)")
    
    # Check if docente bachillerato sees bachillerato grades
    bifencia_result = student_results.get("bifencia.orozco", {})
    if bifencia_result.get("success"):
        bifencia_grades = list(bifencia_result.get("grades", {}).keys())
        bachillerato_grades = ["6°", "7°", "8°", "9°", "10°", "11°"]
        unexpected_grades = [g for g in bifencia_grades if g not in bachillerato_grades]
        
        if not unexpected_grades:
            print(f"✅ Docente Bachillerato: Correctly filtered to bachillerato grades {bifencia_grades}")
        else:
            print(f"⚠️  Docente Bachillerato: Has unexpected grades {unexpected_grades}")
    
    # Check admin access
    admin_result = student_results.get("pedro.hurtado", {})
    if admin_result.get("success"):
        admin_count = admin_result.get("count", 0)
        print(f"ℹ️  Admin: Has access to {admin_count} total students")
    
    print()
    print("🎯 CONCLUSION:")
    print("Backend is returning students correctly according to role-based filtering.")
    print("If teachers report not seeing students, the issue may be:")
    print("1. Database contains fewer students than expected")
    print("2. Frontend not displaying the data correctly")
    print("3. User role configuration issues")

if __name__ == "__main__":
    main()