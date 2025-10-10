#!/usr/bin/env python3
"""
DEBUG: Grade System Analysis
Check student-teacher relationships and grade permissions
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://grado-filter-fix.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Test with both admin and teacher
TEST_USERS = {
    "admin": {"username": "pedro.hurtado", "password": "gim123"},
    "teacher": {"username": "bifencia.orozco", "password": "gim123"}
}

def login_user(credentials):
    """Login and return token"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=credentials,
            headers=HEADERS,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("token"):
                return data["token"], data.get("user", {})
        return None, None
    except Exception as e:
        print(f"Login error: {e}")
        return None, None

def get_students(token):
    """Get students list"""
    try:
        headers = {**HEADERS, "Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/students", headers=headers, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Get students error: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        print(f"Get students error: {e}")
        return []

def assign_grade(token, student_id, grade_value=4.3):
    """Assign grade"""
    try:
        headers = {**HEADERS, "Authorization": f"Bearer {token}"}
        grade_data = {
            "student_id": student_id,
            "subject": "MATEMÁTICA",
            "period": "I",
            "grade": grade_value,
            "teacher_notes": "Test grade assignment"
        }
        
        response = requests.post(f"{BASE_URL}/grades", json=grade_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return True, response.json()
        else:
            return False, f"Status: {response.status_code}, Response: {response.text}"
    except Exception as e:
        return False, f"Error: {e}"

def get_student_grades(token, student_id):
    """Get student grades"""
    try:
        headers = {**HEADERS, "Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/grades/student/{student_id}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            return True, response.json()
        else:
            return False, f"Status: {response.status_code}, Response: {response.text}"
    except Exception as e:
        return False, f"Error: {e}"

def main():
    print("🔍 DEBUG: Grade System Analysis")
    print("=" * 50)
    
    # Test with admin first
    print("\n1. Testing with ADMIN (pedro.hurtado)")
    admin_token, admin_user = login_user(TEST_USERS["admin"])
    if not admin_token:
        print("❌ Admin login failed")
        return
    
    print(f"✅ Admin login successful: {admin_user.get('name')}")
    
    # Get students as admin
    admin_students = get_students(admin_token)
    print(f"📊 Admin sees {len(admin_students)} students")
    
    if admin_students:
        test_student = admin_students[0]
        student_id = test_student.get("id") or test_student.get("_id")
        student_name = test_student.get("name")
        student_grade = test_student.get("grade")
        teacher_id = test_student.get("teacher_id")
        
        print(f"🎯 Test student: {student_name} (Grade: {student_grade}, ID: {student_id})")
        print(f"👨‍🏫 Student's teacher_id: {teacher_id}")
        
        # Assign grade as admin
        success, result = assign_grade(admin_token, student_id)
        if success:
            print("✅ Admin successfully assigned grade")
        else:
            print(f"❌ Admin failed to assign grade: {result}")
        
        # Get grades as admin
        success, grades = get_student_grades(admin_token, student_id)
        if success:
            print(f"✅ Admin can retrieve grades: {len(grades)} grades found")
            for grade in grades:
                if grade.get("subject") == "MATEMÁTICA" and grade.get("period") == "I":
                    print(f"   📝 MATEMÁTICA Grade: {grade.get('grade')}")
        else:
            print(f"❌ Admin failed to retrieve grades: {grades}")
    
    print("\n" + "=" * 50)
    
    # Test with teacher
    print("\n2. Testing with TEACHER (bifencia.orozco)")
    teacher_token, teacher_user = login_user(TEST_USERS["teacher"])
    if not teacher_token:
        print("❌ Teacher login failed")
        return
    
    print(f"✅ Teacher login successful: {teacher_user.get('name')}")
    print(f"👨‍🏫 Teacher ID: {teacher_user.get('id')}")
    print(f"📚 Teacher subjects: {teacher_user.get('subjects', [])}")
    print(f"🎓 Teacher grades: {teacher_user.get('grades', [])}")
    
    # Get students as teacher
    teacher_students = get_students(teacher_token)
    print(f"📊 Teacher sees {len(teacher_students)} students")
    
    if teacher_students:
        # Use first student from teacher's list
        test_student = teacher_students[0]
        student_id = test_student.get("id") or test_student.get("_id")
        student_name = test_student.get("name")
        student_grade = test_student.get("grade")
        teacher_id = test_student.get("teacher_id")
        
        print(f"🎯 Teacher's student: {student_name} (Grade: {student_grade}, ID: {student_id})")
        print(f"👨‍🏫 Student's teacher_id: {teacher_id}")
        print(f"🔍 Teacher ID matches: {teacher_user.get('id') == teacher_id}")
        
        # Assign grade as teacher
        success, result = assign_grade(teacher_token, student_id)
        if success:
            print("✅ Teacher successfully assigned grade")
            
            # Now test persistence - get grades immediately
            success, grades = get_student_grades(teacher_token, student_id)
            if success:
                print(f"✅ Teacher can retrieve grades: {len(grades)} grades found")
                math_grade_found = False
                for grade in grades:
                    if grade.get("subject") == "MATEMÁTICA" and grade.get("period") == "I":
                        print(f"   📝 MATEMÁTICA Grade: {grade.get('grade')}")
                        if grade.get("grade") == 4.3:
                            math_grade_found = True
                
                if math_grade_found:
                    print("🎉 PERSISTENCE TEST PASSED: Grade 4.3 found immediately after assignment")
                else:
                    print("❌ PERSISTENCE TEST FAILED: Grade 4.3 not found after assignment")
            else:
                print(f"❌ Teacher failed to retrieve grades: {grades}")
        else:
            print(f"❌ Teacher failed to assign grade: {result}")
    
    print("\n" + "=" * 50)
    print("🏁 Debug analysis complete")

if __name__ == "__main__":
    main()