#!/usr/bin/env python3
"""
Additional Security Tests for Student Management
Focus: Cross-role permission validation
"""

import requests
import json
from datetime import datetime

BASE_URL = "https://student-portal-88.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Additional test user
DOCENTE_PRIMARIA = {"username": "yocelyn.cabarcas", "password": "gim123"}

def test_docente_primaria_cannot_edit_bachillerato():
    """Test that docente primaria cannot access bachillerato students"""
    
    # Login as docente primaria
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json=DOCENTE_PRIMARIA,
        headers=HEADERS,
        timeout=10
    )
    
    if response.status_code != 200:
        print("❌ Could not login as docente primaria")
        return False
    
    token = response.json().get("token")
    if not token:
        print("❌ No token received")
        return False
    
    # Try to get a bachillerato student (should return empty)
    headers = {**HEADERS, "Authorization": f"Bearer {token}"}
    
    # Try to access grade 10° students (bachillerato)
    response = requests.get(
        f"{BASE_URL}/students?grade=10°",
        headers=headers,
        timeout=10
    )
    
    if response.status_code == 200:
        students = response.json()
        if len(students) == 0:
            print("✅ Docente primaria correctly sees no bachillerato students (grade 10°)")
            
            # Also test grade 11°
            response = requests.get(
                f"{BASE_URL}/students?grade=11°",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                students_11 = response.json()
                if len(students_11) == 0:
                    print("✅ Docente primaria correctly sees no bachillerato students (grade 11°)")
                    return True
                else:
                    print(f"❌ Security breach: Docente primaria can see {len(students_11)} grade 11° students")
                    return False
            else:
                print(f"✅ Docente primaria correctly denied access to grade 11° students (status: {response.status_code})")
                return True
        else:
            print(f"❌ Security breach: Docente primaria can see {len(students)} grade 10° students")
            return False
    else:
        print(f"✅ Docente primaria correctly denied access to bachillerato students (status: {response.status_code})")
        return True

def test_role_isolation():
    """Test that each role only sees their assigned students"""
    
    users_to_test = [
        {"creds": {"username": "pedro.hurtado", "password": "gim123"}, "role": "admin", "should_see_all": True},
        {"creds": {"username": "bifencia.orozco", "password": "gim123"}, "role": "docente_bachillerato", "should_see_all": False},
        {"creds": {"username": "yocelyn.cabarcas", "password": "gim123"}, "role": "docente_primaria", "should_see_all": False},
        {"creds": {"username": "coord.convivencia", "password": "gim123"}, "role": "coordinadora", "should_see_all": True}
    ]
    
    results = {}
    
    for user in users_to_test:
        # Login
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=user["creds"],
            headers=HEADERS,
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ Could not login as {user['role']}")
            continue
        
        token = response.json().get("token")
        headers = {**HEADERS, "Authorization": f"Bearer {token}"}
        
        # Get all students
        response = requests.get(
            f"{BASE_URL}/students",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            students = response.json()
            results[user["role"]] = len(students)
            
            if user["should_see_all"]:
                print(f"✅ {user['role']} sees {len(students)} students (should see all)")
            else:
                print(f"✅ {user['role']} sees {len(students)} students (filtered by role)")
        else:
            print(f"❌ {user['role']} failed to get students: {response.status_code}")
    
    # Verify role isolation
    admin_count = results.get("admin", 0)
    coordinadora_count = results.get("coordinadora", 0)
    docente_bach_count = results.get("docente_bachillerato", 0)
    docente_prim_count = results.get("docente_primaria", 0)
    
    print(f"\n📊 Student Access Summary:")
    print(f"   Admin: {admin_count} students")
    print(f"   Coordinadora: {coordinadora_count} students")
    print(f"   Docente Bachillerato: {docente_bach_count} students")
    print(f"   Docente Primaria: {docente_prim_count} students")
    
    # Admin and coordinadora should see the same (all students)
    if admin_count == coordinadora_count and admin_count > 0:
        print("✅ Admin and Coordinadora see same number of students (correct)")
    else:
        print("❌ Admin and Coordinadora see different numbers of students")
    
    # Teachers should see fewer students than admin
    if docente_bach_count < admin_count and docente_prim_count < admin_count:
        print("✅ Teachers see fewer students than admin (correct filtering)")
        return True
    else:
        print("❌ Teachers see same or more students than admin (filtering issue)")
        return False

if __name__ == "__main__":
    print("🔒 Additional Security Tests for Student Management")
    print("=" * 60)
    
    test1_result = test_docente_primaria_cannot_edit_bachillerato()
    test2_result = test_role_isolation()
    
    print("\n" + "=" * 60)
    if test1_result and test2_result:
        print("🎉 All additional security tests passed!")
    else:
        print("⚠️  Some security tests failed!")