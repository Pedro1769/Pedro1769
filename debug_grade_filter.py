#!/usr/bin/env python3
"""
Debug Grade Filtering Issue
"""

import requests
import json

BASE_URL = "https://support-panels.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

DOCENTE_PRIMARIA = {"username": "yocelyn.cabarcas", "password": "gim123"}

def debug_grade_filtering():
    # Login
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json=DOCENTE_PRIMARIA,
        headers=HEADERS,
        timeout=10
    )
    
    token = response.json().get("token")
    headers = {**HEADERS, "Authorization": f"Bearer {token}"}
    
    # Test different grade filters
    grades_to_test = ["1°", "10°", "11°", "6°"]
    
    for grade in grades_to_test:
        response = requests.get(
            f"{BASE_URL}/students?grade={grade}",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            students = response.json()
            print(f"Grade {grade}: {len(students)} students")
            
            # Show first few students to see their actual grades
            if len(students) > 0:
                actual_grades = set()
                for student in students[:5]:  # Check first 5
                    actual_grades.add(student.get("grade", "Unknown"))
                print(f"  Actual grades in response: {list(actual_grades)}")
        else:
            print(f"Grade {grade}: Error {response.status_code}")

if __name__ == "__main__":
    debug_grade_filtering()