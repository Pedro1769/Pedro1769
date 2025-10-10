#!/usr/bin/env python3
"""
Database Check - Verify student data exists
"""

import requests
import json

BASE_URL = "https://grado-filter-fix.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

def test_admin_access():
    """Test admin access to see all students"""
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
                
                # Get all students
                headers = {
                    **HEADERS,
                    "Authorization": f"Bearer {token}"
                }
                
                response = requests.get(
                    f"{BASE_URL}/students",
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    students = response.json()
                    print(f"✅ Admin can access students endpoint")
                    print(f"📊 Total students found: {len(students)}")
                    
                    if students:
                        # Analyze grade distribution
                        grade_distribution = {}
                        for student in students:
                            grade = student.get("grade", "Unknown")
                            grade_distribution[grade] = grade_distribution.get(grade, 0) + 1
                        
                        print(f"📈 Grade distribution:")
                        for grade, count in sorted(grade_distribution.items()):
                            print(f"   {grade}: {count} students")
                        
                        # Show first few students as examples
                        print(f"\n📝 Sample students:")
                        for i, student in enumerate(students[:5]):
                            print(f"   {i+1}. {student.get('name', 'Unknown')} - Grade: {student.get('grade', 'Unknown')}")
                    else:
                        print("❌ No students found in database")
                    
                    return len(students), grade_distribution if students else {}
                else:
                    print(f"❌ Failed to get students: {response.status_code}")
                    print(f"Response: {response.text}")
                    return 0, {}
            else:
                print(f"❌ Admin login failed: {data}")
                return 0, {}
        else:
            print(f"❌ Admin login request failed: {response.status_code}")
            print(f"Response: {response.text}")
            return 0, {}
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return 0, {}

def test_specific_users():
    """Test specific users mentioned in review request"""
    users = {
        "bifencia.orozco": "gim123",
        "coord.convivencia": "gim123"
    }
    
    for username, password in users.items():
        print(f"\n🔍 Testing user: {username}")
        
        try:
            # Login
            response = requests.post(
                f"{BASE_URL}/auth/login",
                json={"username": username, "password": password},
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    token = data["token"]
                    user_info = data.get("user", {})
                    print(f"✅ Login successful")
                    print(f"   Name: {user_info.get('name', 'Unknown')}")
                    print(f"   Role: {user_info.get('role', 'Unknown')}")
                    print(f"   Grade: {user_info.get('grade', 'None')}")
                    print(f"   Grades: {user_info.get('grades', 'None')}")
                    
                    # Get students
                    headers = {
                        **HEADERS,
                        "Authorization": f"Bearer {token}"
                    }
                    
                    response = requests.get(
                        f"{BASE_URL}/students",
                        headers=headers,
                        timeout=10
                    )
                    
                    if response.status_code == 200:
                        students = response.json()
                        print(f"   Students accessible: {len(students)}")
                        
                        if students:
                            grade_dist = {}
                            for student in students:
                                grade = student.get("grade", "Unknown")
                                grade_dist[grade] = grade_dist.get(grade, 0) + 1
                            print(f"   Grade distribution: {grade_dist}")
                        else:
                            print(f"   No students found for this user")
                    else:
                        print(f"   ❌ Failed to get students: {response.status_code}")
                        print(f"   Response: {response.text}")
                else:
                    print(f"❌ Login failed: {data}")
            else:
                print(f"❌ Login request failed: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Error testing {username}: {str(e)}")

if __name__ == "__main__":
    print("🔍 Database and User Access Check")
    print("=" * 50)
    
    # Test admin access first
    total_students, grade_dist = test_admin_access()
    
    # Test specific users
    test_specific_users()
    
    print(f"\n📊 Summary:")
    print(f"Total students in system: {total_students}")
    if grade_dist:
        print(f"Grades with students: {list(grade_dist.keys())}")