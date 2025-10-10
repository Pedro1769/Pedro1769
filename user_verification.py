#!/usr/bin/env python3
"""
User Verification - Check if bifencia.orozco has been corrected
"""

import requests
import json

BASE_URL = "https://student-portal-88.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

def check_user_details():
    """Check user details via admin access"""
    # Login as admin
    admin_creds = {"username": "pedro.hurtado", "password": "gim123"}
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=admin_creds,
            headers=HEADERS,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("token"):
                token = data["token"]
                print(f"✅ Admin login successful")
                
                # Get all users via admin endpoint
                headers = {
                    **HEADERS,
                    "Authorization": f"Bearer {token}"
                }
                
                response = requests.get(
                    f"{BASE_URL}/admin/users",
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    users = response.json()
                    print(f"✅ Found {len(users)} users in system")
                    
                    # Find bifencia.orozco
                    bifencia_user = None
                    for user in users:
                        if user.get("username") == "bifencia.orozco":
                            bifencia_user = user
                            break
                    
                    if bifencia_user:
                        print(f"\n🔍 bifencia.orozco user details:")
                        print(f"   Name: {bifencia_user.get('name', 'Unknown')}")
                        print(f"   Role: {bifencia_user.get('role', 'Unknown')}")
                        print(f"   Grade: {bifencia_user.get('grade', 'None')}")
                        print(f"   Grades: {bifencia_user.get('grades', 'None')}")
                        print(f"   Subjects: {bifencia_user.get('subjects', 'None')}")
                        print(f"   Email: {bifencia_user.get('email', 'None')}")
                        print(f"   Active: {bifencia_user.get('is_active', 'Unknown')}")
                        
                        # Check if role is correct
                        expected_role = "docente_bachillerato"
                        expected_grades = ["8°", "9°", "10°", "11°"]
                        
                        if bifencia_user.get("role") == expected_role:
                            print(f"   ✅ Role is correct: {expected_role}")
                        else:
                            print(f"   ❌ Role is incorrect. Expected: {expected_role}, Got: {bifencia_user.get('role')}")
                        
                        if bifencia_user.get("grades") == expected_grades:
                            print(f"   ✅ Grades are correct: {expected_grades}")
                        else:
                            print(f"   ❌ Grades are incorrect. Expected: {expected_grades}, Got: {bifencia_user.get('grades')}")
                    else:
                        print(f"❌ bifencia.orozco user not found")
                    
                    # Show all users for reference
                    print(f"\n📋 All users in system:")
                    for user in users:
                        print(f"   - {user.get('username', 'Unknown')} ({user.get('role', 'Unknown')}) - {user.get('name', 'Unknown')}")
                        if user.get('role') in ['docente_primaria', 'docente_bachillerato']:
                            print(f"     Grade(s): {user.get('grade', user.get('grades', 'None'))}")
                    
                else:
                    print(f"❌ Failed to get users: {response.status_code}")
                    print(f"Response: {response.text}")
            else:
                print(f"❌ Admin login failed: {data}")
        else:
            print(f"❌ Admin login request failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def check_direct_login():
    """Check bifencia.orozco login directly"""
    print(f"\n🔍 Testing direct login for bifencia.orozco:")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"username": "bifencia.orozco", "password": "gim123"},
            headers=HEADERS,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("token"):
                user_info = data.get("user", {})
                print(f"✅ Direct login successful")
                print(f"   Name: {user_info.get('name', 'Unknown')}")
                print(f"   Role: {user_info.get('role', 'Unknown')}")
                print(f"   Grade: {user_info.get('grade', 'None')}")
                print(f"   Grades: {user_info.get('grades', 'None')}")
                print(f"   Subjects: {user_info.get('subjects', 'None')}")
                
                # This shows what the login endpoint returns vs what's in the database
                return user_info
            else:
                print(f"❌ Login failed: {data}")
        else:
            print(f"❌ Login request failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    return None

if __name__ == "__main__":
    print("🔍 User Verification Check")
    print("=" * 50)
    
    # Check via admin endpoint
    check_user_details()
    
    # Check via direct login
    login_info = check_direct_login()
    
    print(f"\n📊 Summary:")
    print(f"The user bifencia.orozco should have:")
    print(f"  - Role: docente_bachillerato")
    print(f"  - Grades: ['8°', '9°', '10°', '11°']")
    print(f"  - Should see students from grades 8°, 9°, 10°, 11° only")
    print(f"  - Expected total students: 28 (4+12+3+9)")