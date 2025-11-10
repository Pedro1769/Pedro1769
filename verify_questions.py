#!/usr/bin/env python3
"""
Verify the generated questions are properly stored and have correct structure
"""

import requests
import json

BACKEND_URL = "https://olimpimath.preview.emergentagent.com/api"

def get_admin_token():
    """Get admin token"""
    response = requests.post(
        f"{BACKEND_URL}/auth/login",
        json={"username": "admin", "password": "admin123"},
        headers={"Content-Type": "application/json"}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def verify_questions():
    """Verify the generated questions"""
    token = get_admin_token()
    if not token:
        print("❌ Could not get admin token")
        return False
    
    # Get all questions
    response = requests.get(
        f"{BACKEND_URL}/questions",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to get questions: {response.status_code}")
        return False
    
    questions = response.json()
    print(f"📊 Total questions in database: {len(questions)}")
    
    # Verify question structure
    for i, q in enumerate(questions[:3]):  # Show first 3 questions
        print(f"\n📝 Question {i+1}:")
        print(f"   Text: {q['texto'][:100]}...")
        print(f"   Options: {len(q['opciones'])} options")
        print(f"   Correct Answer: Option {q['respuesta_correcta'] + 1}")
        print(f"   Level: {q['nivel']}")
        print(f"   Type: {q['tipo_pensamiento']}")
        
        # Validate structure
        if len(q['opciones']) != 4:
            print(f"   ⚠️  Warning: Expected 4 options, got {len(q['opciones'])}")
        if not (0 <= q['respuesta_correcta'] <= 3):
            print(f"   ⚠️  Warning: Invalid correct answer index: {q['respuesta_correcta']}")
    
    return True

if __name__ == "__main__":
    verify_questions()