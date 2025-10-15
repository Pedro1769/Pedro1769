#!/usr/bin/env python3
"""
Debug Docente Primaria Access
"""

import requests
import json

BASE_URL = "https://support-panels.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

DOCENTE_PRIMARIA = {"username": "yocelyn.cabarcas", "password": "gim123"}

def debug_docente_primaria():
    # Login
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json=DOCENTE_PRIMARIA,
        headers=HEADERS,
        timeout=10
    )
    
    if response.status_code != 200:
        print("❌ Could not login")
        return
    
    data = response.json()
    token = data.get("token")
    user_info = data.get("user", {})
    
    print(f"👤 User Info:")
    print(f"   Name: {user_info.get('name')}")
    print(f"   Role: {user_info.get('role')}")
    print(f"   Grade: {user_info.get('grade')}")
    print(f"   Grades: {user_info.get('grades')}")
    
    headers = {**HEADERS, "Authorization": f"Bearer {token}"}
    
    # Get all students
    response = requests.get(f"{BASE_URL}/students", headers=headers, timeout=10)
    if response.status_code == 200:
        students = response.json()
        print(f"\n📚 Total students accessible: {len(students)}")
        
        # Group by grade
        grades = {}
        for student in students:
            grade = student.get("grade", "Unknown")
            if grade not in grades:
                grades[grade] = 0
            grades[grade] += 1
        
        print(f"\n📊 Students by grade:")
        for grade, count in sorted(grades.items()):
            print(f"   {grade}: {count} students")
    else:
        print(f"❌ Failed to get students: {response.status_code}")

if __name__ == "__main__":
    debug_docente_primaria()