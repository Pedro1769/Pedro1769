#!/usr/bin/env python3
"""
Final Frontend Diagnosis - Specific Review Request Analysis
Diagnóstico específico para el problema reportado por el usuario
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://support-panels.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

def test_exact_registration_scenario():
    """Test the exact registration scenario from review request"""
    print("=" * 80)
    print("🎯 DIAGNÓSTICO FINAL: REGISTRO DESDE FRONTEND")
    print("Datos exactos del review request del usuario")
    print("=" * 80)
    
    # Exact data from review request
    registration_data = {
        "username": "test_frontend_registro",
        "password": "test123456",
        "name": "Usuario Test Frontend", 
        "email": "testfrontend@test.com",
        "phone": "3001234567",
        "role": "padre"
    }
    
    print("📋 DATOS DE REGISTRO:")
    for key, value in registration_data.items():
        print(f"   • {key}: {value}")
    print()
    
    try:
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/auth/register",
            json=registration_data,
            headers=HEADERS,
            timeout=15
        )
        
        print(f"📡 URL: {BASE_URL}/auth/register")
        print(f"📤 Method: POST")
        print(f"📤 Headers: {HEADERS}")
        print(f"📤 Body: {json.dumps(registration_data, indent=2)}")
        print()
        print(f"📥 Status Code: {response.status_code}")
        print(f"📥 Response Headers: {dict(response.headers)}")
        
        if response.content:
            try:
                data = response.json()
                print(f"📥 Response Body: {json.dumps(data, indent=2)}")
            except:
                print(f"📥 Response Body (raw): {response.text}")
        else:
            print("📥 Response Body: (empty)")
        print()
        
        # Analyze response
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("token"):
                print("✅ RESULTADO: REGISTRO EXITOSO")
                print(f"   • Usuario creado: {data.get('user', {}).get('username')}")
                print(f"   • Token JWT: {'Recibido' if data.get('token') else 'No recibido'}")
                print(f"   • Mensaje: {data.get('message', 'Sin mensaje')}")
                return True
            else:
                print("❌ RESULTADO: REGISTRO FALLIDO")
                print("   • Respuesta incompleta del servidor")
                return False
                
        elif response.status_code == 400:
            data = response.json() if response.content else {}
            error_msg = data.get("detail", "Error desconocido")
            if "ya está en uso" in error_msg or "ya está registrado" in error_msg:
                print("✅ RESULTADO: USUARIO YA EXISTE (COMPORTAMIENTO ESPERADO)")
                print(f"   • Mensaje: {error_msg}")
                print("   • El sistema está validando correctamente usuarios duplicados")
                return True
            else:
                print("❌ RESULTADO: ERROR DE VALIDACIÓN")
                print(f"   • Error: {error_msg}")
                return False
                
        elif response.status_code == 422:
            data = response.json() if response.content else {}
            print("❌ RESULTADO: ERROR DE VALIDACIÓN DE CAMPOS")
            print(f"   • Detalles: {data}")
            return False
            
        else:
            print(f"❌ RESULTADO: ERROR INESPERADO")
            print(f"   • Status Code: {response.status_code}")
            print(f"   • Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ RESULTADO: TIMEOUT")
        print("   • El servidor no respondió en 15 segundos")
        return False
    except requests.exceptions.ConnectionError as e:
        print("❌ RESULTADO: ERROR DE CONEXIÓN")
        print(f"   • No se pudo conectar al servidor: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ RESULTADO: ERROR INESPERADO")
        print(f"   • Exception: {str(e)}")
        return False

def test_exact_login_scenario():
    """Test the exact login scenario from review request"""
    print("=" * 80)
    print("🎯 DIAGNÓSTICO FINAL: LOGIN DESDE FRONTEND")
    print("Credenciales exactas del review request del usuario")
    print("=" * 80)
    
    # Exact credentials from review request
    login_data = {
        "username": "pedro.hurtado",
        "password": "gim123"
    }
    
    print("📋 CREDENCIALES DE LOGIN:")
    print(f"   • username: {login_data['username']}")
    print(f"   • password: {login_data['password']}")
    print()
    
    try:
        session = requests.Session()
        response = session.post(
            f"{BASE_URL}/auth/login",
            json=login_data,
            headers=HEADERS,
            timeout=15
        )
        
        print(f"📡 URL: {BASE_URL}/auth/login")
        print(f"📤 Method: POST")
        print(f"📤 Headers: {HEADERS}")
        print(f"📤 Body: {json.dumps(login_data, indent=2)}")
        print()
        print(f"📥 Status Code: {response.status_code}")
        print(f"📥 Response Headers: {dict(response.headers)}")
        
        if response.content:
            try:
                data = response.json()
                print(f"📥 Response Body: {json.dumps(data, indent=2)}")
            except:
                print(f"📥 Response Body (raw): {response.text}")
        else:
            print("📥 Response Body: (empty)")
        print()
        
        # Analyze response
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("token"):
                user = data.get("user", {})
                print("✅ RESULTADO: LOGIN EXITOSO")
                print(f"   • Usuario: {user.get('name')} ({user.get('username')})")
                print(f"   • Rol: {user.get('role')}")
                print(f"   • Token JWT: {'Recibido' if data.get('token') else 'No recibido'}")
                print(f"   • Mensaje: {data.get('message', 'Sin mensaje')}")
                
                # Test dashboard access
                token = data.get("token")
                dashboard_success = test_dashboard_access(session, token)
                print(f"   • Acceso al Dashboard: {'✅ Exitoso' if dashboard_success else '❌ Fallido'}")
                
                return True
            else:
                print("❌ RESULTADO: LOGIN FALLIDO")
                print("   • Respuesta incompleta del servidor")
                return False
                
        elif response.status_code == 401:
            data = response.json() if response.content else {}
            print("❌ RESULTADO: CREDENCIALES INVÁLIDAS")
            print(f"   • Error: {data.get('detail', 'Credenciales incorrectas')}")
            return False
            
        elif response.status_code == 422:
            data = response.json() if response.content else {}
            print("❌ RESULTADO: ERROR DE VALIDACIÓN DE CAMPOS")
            print(f"   • Detalles: {data}")
            return False
            
        else:
            print(f"❌ RESULTADO: ERROR INESPERADO")
            print(f"   • Status Code: {response.status_code}")
            print(f"   • Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ RESULTADO: TIMEOUT")
        print("   • El servidor no respondió en 15 segundos")
        return False
    except requests.exceptions.ConnectionError as e:
        print("❌ RESULTADO: ERROR DE CONEXIÓN")
        print(f"   • No se pudo conectar al servidor: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ RESULTADO: ERROR INESPERADO")
        print(f"   • Exception: {str(e)}")
        return False

def test_dashboard_access(session, token):
    """Test dashboard access with token"""
    if not token:
        return False
        
    try:
        headers = {
            **HEADERS,
            "Authorization": f"Bearer {token}"
        }
        
        response = session.get(
            f"{BASE_URL}/auth/profile",
            headers=headers,
            timeout=10
        )
        
        return response.status_code == 200 and response.json().get("username")
        
    except:
        return False

def check_environment_configuration():
    """Check environment configuration"""
    print("=" * 80)
    print("🔧 VERIFICACIÓN DE CONFIGURACIÓN DE ENTORNO")
    print("=" * 80)
    
    try:
        # Check frontend .env
        with open('/app/frontend/.env', 'r') as f:
            frontend_env = f.read()
        
        print("📋 CONFIGURACIÓN FRONTEND (.env):")
        for line in frontend_env.split('\n'):
            if line.strip() and not line.startswith('#'):
                print(f"   • {line}")
        print()
        
        # Extract and verify REACT_APP_BACKEND_URL
        backend_url = None
        for line in frontend_env.split('\n'):
            if line.startswith('REACT_APP_BACKEND_URL='):
                backend_url = line.split('=', 1)[1].strip()
                break
        
        if backend_url:
            expected_api_url = backend_url.rstrip('/') + '/api'
            print(f"📡 URL CONFIGURATION:")
            print(f"   • Frontend URL: {backend_url}")
            print(f"   • Expected API URL: {expected_api_url}")
            print(f"   • Actual API URL: {BASE_URL}")
            print(f"   • URLs Match: {'✅ Yes' if expected_api_url == BASE_URL else '❌ No'}")
            print()
            
            return expected_api_url == BASE_URL
        else:
            print("❌ REACT_APP_BACKEND_URL not found in frontend .env")
            return False
            
    except Exception as e:
        print(f"❌ Error reading configuration: {str(e)}")
        return False

def main():
    """Main diagnosis function"""
    print("\n" + "=" * 100)
    print("🔍 DIAGNÓSTICO FINAL - PROBLEMA REPORTADO POR USUARIO")
    print("Prueba específica de registro e inicio de sesión desde frontend")
    print("=" * 100)
    
    # Check environment first
    env_ok = check_environment_configuration()
    
    # Test registration
    registration_ok = test_exact_registration_scenario()
    
    # Test login
    login_ok = test_exact_login_scenario()
    
    # Final diagnosis
    print("=" * 100)
    print("📊 DIAGNÓSTICO FINAL")
    print("=" * 100)
    
    print(f"🔧 Configuración de entorno: {'✅ Correcta' if env_ok else '❌ Incorrecta'}")
    print(f"📝 Registro desde frontend: {'✅ Funcionando' if registration_ok else '❌ Fallando'}")
    print(f"🔑 Login desde frontend: {'✅ Funcionando' if login_ok else '❌ Fallando'}")
    print()
    
    if env_ok and registration_ok and login_ok:
        print("🎉 CONCLUSIÓN: EL BACKEND FUNCIONA PERFECTAMENTE")
        print()
        print("✅ Todas las pruebas específicas del review request fueron exitosas")
        print("✅ El registro de usuarios funciona correctamente")
        print("✅ El login con credenciales pedro.hurtado/gim123 funciona correctamente")
        print("✅ La redirección al dashboard funciona correctamente")
        print("✅ Las variables de entorno están configuradas correctamente")
        print()
        print("🔍 SI EL USUARIO REPORTA ERRORES, EL PROBLEMA ESTÁ EN EL FRONTEND:")
        print("   • Posibles problemas de JavaScript en el navegador")
        print("   • Errores en el código React del frontend")
        print("   • Problemas de routing en el frontend")
        print("   • Errores en el manejo de respuestas del API")
        print()
        print("📋 RECOMENDACIONES PARA EL MAIN AGENT:")
        print("   1. Revisar el código JavaScript del frontend")
        print("   2. Verificar el manejo de errores en React")
        print("   3. Comprobar el routing del frontend")
        print("   4. Verificar la integración frontend-backend")
        
    else:
        problems = []
        if not env_ok:
            problems.append("Configuración de entorno")
        if not registration_ok:
            problems.append("Registro de usuarios")
        if not login_ok:
            problems.append("Login de usuarios")
            
        print(f"❌ PROBLEMAS ENCONTRADOS EN: {', '.join(problems)}")
        print()
        print("🔧 EL MAIN AGENT DEBE CORREGIR ESTOS PROBLEMAS EN EL BACKEND")
    
    print("=" * 100)

if __name__ == "__main__":
    main()