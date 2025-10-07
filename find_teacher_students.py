#!/usr/bin/env python3
"""
Find students assigned to bifencia.orozco (doc002)
"""

import requests
import json

# Configuration
BASE_URL = "https://student-portal-88.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

def login_admin():
    """Login as admin to see all students"""
    credentials = {"username": "pedro.hurtado", "password": "gim123"}
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
                return data["token"]
        return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def find_students_by_teacher():
    """Find students assigned to each teacher"""
    token = login_admin()
    if not token:
        print("❌ Cannot login as admin")
        return
    
    try:
        headers = {**HEADERS, "Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/students", headers=headers, timeout=10)
        
        if response.status_code == 200:
            students = response.json()
            
            # Group students by teacher_id
            teachers = {}
            for student in students:
                teacher_id = student.get("teacher_id", "No teacher")
                if teacher_id not in teachers:
                    teachers[teacher_id] = []
                teachers[teacher_id].append({
                    "name": student.get("name"),
                    "grade": student.get("grade"),
                    "id": student.get("id") or student.get("_id")
                })
            
            print(f"📊 Total students: {len(students)}")
            print("\n👨‍🏫 Students by teacher:")
            
            for teacher_id, student_list in teachers.items():
                print(f"\n{teacher_id}: {len(student_list)} students")
                if teacher_id == "doc002":  # bifencia.orozco
                    print("   🎯 BIFENCIA'S STUDENTS:")
                    for student in student_list[:5]:  # Show first 5
                        print(f"     - {student['name']} (Grade: {student['grade']}, ID: {student['id']})")
                    if len(student_list) > 5:
                        print(f"     ... and {len(student_list) - 5} more")
                elif len(student_list) <= 3:
                    for student in student_list:
                        print(f"     - {student['name']} (Grade: {student['grade']}, ID: {student['id']})")
                else:
                    print(f"     - {student_list[0]['name']} and {len(student_list)-1} others")
            
            # Find students assigned to doc002 (bifencia.orozco)
            bifencia_students = teachers.get("doc002", [])
            if bifencia_students:
                print(f"\n✅ Found {len(bifencia_students)} students assigned to bifencia.orozco (doc002)")
                return bifencia_students[0]["id"]  # Return first student ID
            else:
                print("\n❌ No students assigned to bifencia.orozco (doc002)")
                return None
                
        else:
            print(f"❌ Failed to get students: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    find_students_by_teacher()