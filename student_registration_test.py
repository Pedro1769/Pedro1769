#!/usr/bin/env python3
"""
Student Registration Test for Gimnasio Americano del Atlántico
Tests specific student registration and login flow as requested
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend .env
BACKEND_URL = "http://localhost:8001"
API_BASE = f"{BACKEND_URL}/api"

def test_student_registration_flow():
    """Test complete student registration and login flow"""
    print("🎓 Testing Student Registration Flow for Gimnasio Americano del Atlántico")
    print("=" * 70)
    
    # Test data for student registration
    student_data = {
        "name": "María González Estudiante",
        "email": "maria.estudiante@email.com",
        "password": "estudiante123",
        "role": "student",
        "document": "98765432",
        "phone": "3009876543"
    }
    
    try:
        print("📝 Step 1: Creating student user...")
        response = requests.post(f"{API_BASE}/users", json=student_data, timeout=10)
        
        if response.status_code == 200:
            created_student = response.json()
            print(f"  ✅ Student created successfully: {created_student.get('name')}")
            print(f"  📧 Email: {created_student.get('email')}")
            print(f"  👤 Role: {created_student.get('role')}")
            print(f"  🆔 Document: {created_student.get('document')}")
            print(f"  🆔 Student ID: {created_student.get('id')}")
            
            # Verify student role
            if created_student.get('role') != 'student':
                print(f"  ❌ Role error: expected 'student', got '{created_student.get('role')}'")
                return False
                
        else:
            print(f"  ❌ Failed to create student - status: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
        print("\n🔐 Step 2: Testing student authentication...")
        login_data = {
            "email": student_data["email"],
            "password": student_data["password"]
        }
        
        auth_response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=10)
        
        if auth_response.status_code == 200:
            auth_result = auth_response.json()
            print(f"  ✅ Student authentication successful")
            print(f"  👤 Authenticated user: {auth_result.get('user', {}).get('name')}")
            print(f"  👤 Role: {auth_result.get('user', {}).get('role')}")
            print(f"  🎫 Token: {auth_result.get('token')}")
            print(f"  ✅ Success: {auth_result.get('success')}")
            
            # Verify authenticated user is the same student
            auth_user = auth_result.get('user', {})
            if auth_user.get('email') != student_data['email']:
                print(f"  ❌ Authentication mismatch: wrong user returned")
                return False
                
            if auth_user.get('role') != 'student':
                print(f"  ❌ Role mismatch in auth: expected 'student', got '{auth_user.get('role')}'")
                return False
                
        else:
            print(f"  ❌ Student authentication failed - status: {auth_response.status_code}")
            print(f"  Response: {auth_response.text}")
            return False
            
        print("\n💾 Step 3: Verifying data persistence in MongoDB...")
        
        # Get all users and verify our student exists
        users_response = requests.get(f"{API_BASE}/users", timeout=10)
        
        if users_response.status_code == 200:
            all_users = users_response.json()
            
            # Find our student
            found_student = None
            for user in all_users:
                if user.get('email') == student_data['email']:
                    found_student = user
                    break
                    
            if found_student:
                print(f"  ✅ Student found in database")
                print(f"  📧 Email: {found_student.get('email')}")
                print(f"  🆔 Document: {found_student.get('document')}")
                print(f"  👤 Role: {found_student.get('role')}")
                
                # Verify data integrity
                if found_student.get('document') != student_data['document']:
                    print(f"  ❌ Document mismatch in database")
                    return False
                    
                if found_student.get('role') != 'student':
                    print(f"  ❌ Role mismatch in database")
                    return False
                    
            else:
                print(f"  ❌ Student not found in database")
                return False
                
        else:
            print(f"  ❌ Failed to retrieve users from database")
            return False
            
        print("\n🎉 STUDENT REGISTRATION FLOW COMPLETED SUCCESSFULLY!")
        print("✅ Student can register → ✅ Data stored in MongoDB → ✅ Can login immediately")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Student registration test failed: {e}")
        return False

def test_teacher_registration_flow():
    """Test teacher registration flow as requested"""
    print("\n👨‍🏫 Testing Teacher Registration Flow")
    print("=" * 50)
    
    # Test data for teacher registration
    teacher_data = {
        "name": "Carlos Rodríguez Profesor",
        "email": "carlos.profesor@email.com",
        "password": "profesor123",
        "role": "teacher",
        "document": "11223344",
        "phone": "3001122334",
        "subjects": ["Historia", "Geografía"],
        "grades": ["7°", "8°", "9°"],
        "teaching_level": "bachillerato"
    }
    
    try:
        print("📝 Creating teacher user...")
        response = requests.post(f"{API_BASE}/users", json=teacher_data, timeout=10)
        
        if response.status_code == 200:
            created_teacher = response.json()
            print(f"  ✅ Teacher created: {created_teacher.get('name')}")
            print(f"  📧 Email: {created_teacher.get('email')}")
            print(f"  👤 Role: {created_teacher.get('role')}")
            print(f"  📚 Subjects: {created_teacher.get('subjects')}")
            print(f"  🎓 Grades: {created_teacher.get('grades')}")
            print(f"  📖 Teaching Level: {created_teacher.get('teaching_level')}")
            
        else:
            print(f"  ❌ Failed to create teacher")
            return False
            
        print("🔐 Testing teacher authentication...")
        login_data = {
            "email": teacher_data["email"],
            "password": teacher_data["password"]
        }
        
        auth_response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=10)
        
        if auth_response.status_code == 200:
            auth_result = auth_response.json()
            print(f"  ✅ Teacher authentication successful")
            print(f"  👤 User: {auth_result.get('user', {}).get('name')}")
            print(f"  👤 Role: {auth_result.get('user', {}).get('role')}")
            
        else:
            print(f"  ❌ Teacher authentication failed")
            return False
            
        print("  ✅ Teacher registration and login working correctly")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Teacher registration test failed: {e}")
        return False

def test_database_connection():
    """Test MongoDB database connection specifically"""
    print("\n🗄️  Testing MongoDB Database Connection")
    print("=" * 50)
    
    try:
        # Test database connectivity by getting users
        response = requests.get(f"{API_BASE}/users", timeout=10)
        
        if response.status_code == 200:
            users = response.json()
            print(f"✅ Connected to MongoDB database 'gimnasio_americano'")
            print(f"📊 Total users in database: {len(users)}")
            
            # Show user distribution by role
            roles = {}
            for user in users:
                role = user.get('role', 'unknown')
                roles[role] = roles.get(role, 0) + 1
                
            print("📈 User distribution by role:")
            for role, count in roles.items():
                print(f"  - {role}: {count} users")
                
            return True
            
        else:
            print(f"❌ Database connection failed - status: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Database connection test failed: {e}")
        return False

def run_complete_registration_test():
    """Run complete registration test suite as requested"""
    print("🏫 GIMNASIO AMERICANO DEL ATLÁNTICO - REGISTRATION SYSTEM TEST")
    print("🎯 Testing complete user registration functionality after service repair")
    print("=" * 80)
    
    test_results = []
    
    # Test 1: Database Connection
    test_results.append(("Database Connection", test_database_connection()))
    
    # Test 2: Student Registration Flow (CRITICAL)
    test_results.append(("Student Registration Flow", test_student_registration_flow()))
    
    # Test 3: Teacher Registration Flow (CRITICAL)
    test_results.append(("Teacher Registration Flow", test_teacher_registration_flow()))
    
    # Summary
    print("\n" + "=" * 80)
    print("📋 FINAL TEST RESULTS - GIMNASIO AMERICANO DEL ATLÁNTICO")
    print("=" * 80)
    
    passed_tests = 0
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<30} {status}")
        if result:
            passed_tests += 1
    
    success_rate = passed_tests / len(test_results) * 100
    print(f"\nOverall Success Rate: {success_rate:.1f}% ({passed_tests}/{len(test_results)})")
    
    if success_rate == 100:
        print("\n🎉 ALL TESTS PASSED! User registration system is 100% operational")
        print("✅ Users can register → ✅ Data persists in MongoDB → ✅ Can login immediately")
        print("🏫 Gimnasio Americano del Atlántico registration system is ready for use!")
        return True
    else:
        print(f"\n⚠️  {len(test_results) - passed_tests} test(s) failed. System needs attention.")
        return False

if __name__ == "__main__":
    success = run_complete_registration_test()
    sys.exit(0 if success else 1)