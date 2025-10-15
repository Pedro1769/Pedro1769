#!/usr/bin/env python3
"""
Frontend Authentication Testing - GAA Educational System
Prueba ESPECÍFICA de registro e inicio de sesión desde frontend
Focus: Frontend registration and login issues reported by user
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional
import time

# Configuration - Using environment variable from frontend/.env
BASE_URL = "https://support-panels.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class FrontendAuthTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    Details: {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")
        print()

    def test_environment_variables(self):
        """Verificar que REACT_APP_BACKEND_URL está correctamente configurado"""
        try:
            # Read frontend .env file
            with open('/app/frontend/.env', 'r') as f:
                env_content = f.read()
            
            if 'REACT_APP_BACKEND_URL=' in env_content:
                backend_url = None
                for line in env_content.split('\n'):
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        backend_url = line.split('=', 1)[1].strip()
                        break
                
                if backend_url:
                    expected_base = backend_url.rstrip('/') + '/api'
                    if expected_base == BASE_URL:
                        self.log_test(
                            "Environment Variables Check",
                            True,
                            f"REACT_APP_BACKEND_URL correctly configured: {backend_url}"
                        )
                        return True
                    else:
                        self.log_test(
                            "Environment Variables Check",
                            False,
                            f"URL mismatch. Expected: {expected_base}, Using: {BASE_URL}"
                        )
                        return False
                else:
                    self.log_test(
                        "Environment Variables Check",
                        False,
                        "REACT_APP_BACKEND_URL value not found"
                    )
                    return False
            else:
                self.log_test(
                    "Environment Variables Check",
                    False,
                    "REACT_APP_BACKEND_URL not found in .env file"
                )
                return False
                
        except Exception as e:
            self.log_test("Environment Variables Check", False, f"Error reading .env file: {str(e)}")
            return False

    def test_backend_connectivity(self):
        """Test basic backend connectivity"""
        try:
            response = self.session.get(f"{BASE_URL}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Backend Connectivity",
                    True,
                    f"Backend accessible. Status: {data.get('status', 'unknown')}"
                )
                return True
            else:
                self.log_test(
                    "Backend Connectivity",
                    False,
                    f"Backend returned status code: {response.status_code}",
                    response.text
                )
                return False
        except Exception as e:
            self.log_test("Backend Connectivity", False, f"Connection error: {str(e)}")
            return False

    def test_frontend_registration_specific(self):
        """Test de Registro desde Frontend - DATOS ESPECÍFICOS DEL REVIEW REQUEST"""
        print("\n" + "=" * 70)
        print("🎯 PRUEBA ESPECÍFICA: REGISTRO DESDE FRONTEND")
        print("Datos exactos del review request:")
        print("Username: test_frontend_registro")
        print("Password: test123456")
        print("Nombre: Usuario Test Frontend")
        print("Email: testfrontend@test.com")
        print("Phone: 3001234567")
        print("Rol: padre")
        print("=" * 70)
        
        # Datos exactos del review request
        registration_data = {
            "username": "test_frontend_registro",
            "password": "test123456",
            "name": "Usuario Test Frontend",
            "email": "testfrontend@test.com",
            "phone": "3001234567",
            "role": "padre"
        }
        
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/register",
                json=registration_data,
                headers=HEADERS,
                timeout=15
            )
            
            print(f"📡 Request URL: {BASE_URL}/auth/register")
            print(f"📤 Request Data: {json.dumps(registration_data, indent=2)}")
            print(f"📥 Response Status: {response.status_code}")
            print(f"📥 Response Headers: {dict(response.headers)}")
            
            if response.content:
                try:
                    response_data = response.json()
                    print(f"📥 Response Body: {json.dumps(response_data, indent=2)}")
                except:
                    print(f"📥 Response Body (raw): {response.text}")
            else:
                print("📥 Response Body: (empty)")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token") and data.get("user"):
                    user = data.get("user", {})
                    self.log_test(
                        "Frontend Registration - Specific Data",
                        True,
                        f"✅ REGISTRO EXITOSO: Usuario '{user.get('username')}' registrado correctamente. Token JWT recibido. Datos completos: {user.get('name')} ({user.get('email')})"
                    )
                    return True, data.get("token")
                else:
                    self.log_test(
                        "Frontend Registration - Specific Data",
                        False,
                        "❌ REGISTRO FALLIDO: Respuesta incompleta - falta success, token o datos de usuario",
                        data
                    )
                    return False, None
            elif response.status_code == 400:
                data = response.json() if response.content else {}
                error_msg = data.get("detail", "Error desconocido")
                if "ya está en uso" in error_msg or "ya está registrado" in error_msg:
                    self.log_test(
                        "Frontend Registration - Specific Data",
                        True,
                        f"✅ VALIDACIÓN CORRECTA: Usuario ya existe - {error_msg}"
                    )
                    return True, None
                else:
                    self.log_test(
                        "Frontend Registration - Specific Data",
                        False,
                        f"❌ ERROR 400: {error_msg}",
                        data
                    )
                    return False, None
            elif response.status_code == 422:
                data = response.json() if response.content else {}
                self.log_test(
                    "Frontend Registration - Specific Data",
                    False,
                    f"❌ ERROR DE VALIDACIÓN (422): Datos inválidos o campos faltantes",
                    data
                )
                return False, None
            else:
                self.log_test(
                    "Frontend Registration - Specific Data",
                    False,
                    f"❌ ERROR INESPERADO: Status code {response.status_code}",
                    response.text
                )
                return False, None
                
        except requests.exceptions.Timeout:
            self.log_test(
                "Frontend Registration - Specific Data",
                False,
                "❌ TIMEOUT: El servidor no respondió en 15 segundos"
            )
            return False, None
        except requests.exceptions.ConnectionError as e:
            self.log_test(
                "Frontend Registration - Specific Data",
                False,
                f"❌ ERROR DE CONEXIÓN: No se pudo conectar al servidor - {str(e)}"
            )
            return False, None
        except Exception as e:
            self.log_test(
                "Frontend Registration - Specific Data",
                False,
                f"❌ ERROR INESPERADO: {str(e)}"
            )
            return False, None

    def test_frontend_login_specific(self):
        """Test de Login desde Frontend - CREDENCIALES ESPECÍFICAS DEL REVIEW REQUEST"""
        print("\n" + "=" * 70)
        print("🎯 PRUEBA ESPECÍFICA: LOGIN DESDE FRONTEND")
        print("Credenciales del review request:")
        print("Username: pedro.hurtado")
        print("Password: gim123")
        print("=" * 70)
        
        # Credenciales exactas del review request
        login_data = {
            "username": "pedro.hurtado",
            "password": "gim123"
        }
        
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=login_data,
                headers=HEADERS,
                timeout=15
            )
            
            print(f"📡 Request URL: {BASE_URL}/auth/login")
            print(f"📤 Request Data: {json.dumps(login_data, indent=2)}")
            print(f"📥 Response Status: {response.status_code}")
            print(f"📥 Response Headers: {dict(response.headers)}")
            
            if response.content:
                try:
                    response_data = response.json()
                    print(f"📥 Response Body: {json.dumps(response_data, indent=2)}")
                except:
                    print(f"📥 Response Body (raw): {response.text}")
            else:
                print("📥 Response Body: (empty)")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token") and data.get("user"):
                    user = data.get("user", {})
                    self.log_test(
                        "Frontend Login - Specific Credentials",
                        True,
                        f"✅ LOGIN EXITOSO: Usuario '{user.get('username')}' autenticado correctamente. Rol: {user.get('role')}. Token JWT recibido."
                    )
                    return True, data.get("token")
                else:
                    self.log_test(
                        "Frontend Login - Specific Credentials",
                        False,
                        "❌ LOGIN FALLIDO: Respuesta incompleta - falta success, token o datos de usuario",
                        data
                    )
                    return False, None
            elif response.status_code == 401:
                data = response.json() if response.content else {}
                error_msg = data.get("detail", "Credenciales inválidas")
                self.log_test(
                    "Frontend Login - Specific Credentials",
                    False,
                    f"❌ CREDENCIALES INVÁLIDAS (401): {error_msg}",
                    data
                )
                return False, None
            elif response.status_code == 422:
                data = response.json() if response.content else {}
                self.log_test(
                    "Frontend Login - Specific Credentials",
                    False,
                    f"❌ ERROR DE VALIDACIÓN (422): Formato de datos incorrecto",
                    data
                )
                return False, None
            else:
                self.log_test(
                    "Frontend Login - Specific Credentials",
                    False,
                    f"❌ ERROR INESPERADO: Status code {response.status_code}",
                    response.text
                )
                return False, None
                
        except requests.exceptions.Timeout:
            self.log_test(
                "Frontend Login - Specific Credentials",
                False,
                "❌ TIMEOUT: El servidor no respondió en 15 segundos"
            )
            return False, None
        except requests.exceptions.ConnectionError as e:
            self.log_test(
                "Frontend Login - Specific Credentials",
                False,
                f"❌ ERROR DE CONEXIÓN: No se pudo conectar al servidor - {str(e)}"
            )
            return False, None
        except Exception as e:
            self.log_test(
                "Frontend Login - Specific Credentials",
                False,
                f"❌ ERROR INESPERADO: {str(e)}"
            )
            return False, None

    def test_dashboard_redirect_simulation(self, token: str):
        """Simular redirección al dashboard después del login exitoso"""
        if not token:
            self.log_test("Dashboard Redirect Simulation", False, "No token available")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {token}"
            }
            
            # Test profile endpoint (simulates dashboard data loading)
            response = self.session.get(
                f"{BASE_URL}/auth/profile",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("username") and data.get("role"):
                    self.log_test(
                        "Dashboard Redirect Simulation",
                        True,
                        f"✅ REDIRECCIÓN AL DASHBOARD EXITOSA: Perfil cargado correctamente para {data.get('name')} (rol: {data.get('role')})"
                    )
                    return True
                else:
                    self.log_test(
                        "Dashboard Redirect Simulation",
                        False,
                        "❌ DATOS DE PERFIL INCOMPLETOS: Faltan campos requeridos",
                        data
                    )
                    return False
            else:
                self.log_test(
                    "Dashboard Redirect Simulation",
                    False,
                    f"❌ ERROR AL CARGAR DASHBOARD: Status code {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_test("Dashboard Redirect Simulation", False, f"❌ ERROR: {str(e)}")
            return False

    def test_cors_and_network_errors(self):
        """Verificar errores de CORS y red que podrían afectar el frontend"""
        try:
            # Test with different headers to simulate browser requests
            browser_headers = {
                "Content-Type": "application/json",
                "Origin": "https://support-panels.preview.emergentagent.com",
                "Referer": "https://support-panels.preview.emergentagent.com/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            
            response = self.session.options(
                f"{BASE_URL}/auth/login",
                headers=browser_headers,
                timeout=10
            )
            
            # Check CORS headers
            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
                "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
                "Access-Control-Allow-Credentials": response.headers.get("Access-Control-Allow-Credentials")
            }
            
            has_cors = any(cors_headers.values())
            
            if has_cors:
                self.log_test(
                    "CORS and Network Check",
                    True,
                    f"✅ CORS configurado correctamente. Headers: {cors_headers}"
                )
                return True
            else:
                self.log_test(
                    "CORS and Network Check",
                    False,
                    f"❌ POSIBLE PROBLEMA DE CORS: No se encontraron headers CORS. Response status: {response.status_code}"
                )
                return False
                
        except Exception as e:
            self.log_test("CORS and Network Check", False, f"❌ ERROR DE RED: {str(e)}")
            return False

    def test_error_scenarios(self):
        """Test various error scenarios that might occur in frontend"""
        print("\n" + "=" * 50)
        print("🔍 TESTING ERROR SCENARIOS")
        print("=" * 50)
        
        error_tests = [
            {
                "name": "Empty Request Body",
                "data": {},
                "endpoint": "login"
            },
            {
                "name": "Missing Username",
                "data": {"password": "test123"},
                "endpoint": "login"
            },
            {
                "name": "Missing Password", 
                "data": {"username": "test_user"},
                "endpoint": "login"
            },
            {
                "name": "Invalid JSON Format",
                "data": "invalid_json",
                "endpoint": "login"
            }
        ]
        
        all_passed = True
        
        for test in error_tests:
            try:
                if test["data"] == "invalid_json":
                    # Send invalid JSON
                    response = self.session.post(
                        f"{BASE_URL}/auth/{test['endpoint']}",
                        data="invalid_json_data",
                        headers={"Content-Type": "application/json"},
                        timeout=10
                    )
                else:
                    response = self.session.post(
                        f"{BASE_URL}/auth/{test['endpoint']}",
                        json=test["data"],
                        headers=HEADERS,
                        timeout=10
                    )
                
                # Expect 400 or 422 for validation errors
                if response.status_code in [400, 422]:
                    self.log_test(
                        f"Error Scenario - {test['name']}",
                        True,
                        f"✅ Error correctamente manejado: {response.status_code}"
                    )
                else:
                    self.log_test(
                        f"Error Scenario - {test['name']}",
                        False,
                        f"❌ Error no manejado correctamente: {response.status_code}",
                        response.text
                    )
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Error Scenario - {test['name']}", False, f"❌ Exception: {str(e)}")
                all_passed = False
        
        return all_passed

    def run_comprehensive_frontend_test(self):
        """Run comprehensive frontend authentication testing"""
        print("\n" + "=" * 80)
        print("🚀 INICIANDO PRUEBAS ESPECÍFICAS DE FRONTEND - REGISTRO E INICIO DE SESIÓN")
        print("Basado en el review request del usuario")
        print("=" * 80)
        
        total_tests = 0
        passed_tests = 0
        
        # Test 1: Environment Variables
        total_tests += 1
        if self.test_environment_variables():
            passed_tests += 1
        
        # Test 2: Backend Connectivity
        total_tests += 1
        if self.test_backend_connectivity():
            passed_tests += 1
        
        # Test 3: CORS and Network
        total_tests += 1
        if self.test_cors_and_network_errors():
            passed_tests += 1
        
        # Test 4: Frontend Registration (Specific Data)
        total_tests += 1
        registration_success, reg_token = self.test_frontend_registration_specific()
        if registration_success:
            passed_tests += 1
        
        # Test 5: Frontend Login (Specific Credentials)
        total_tests += 1
        login_success, login_token = self.test_frontend_login_specific()
        if login_success:
            passed_tests += 1
        
        # Test 6: Dashboard Redirect (if login successful)
        if login_token:
            total_tests += 1
            if self.test_dashboard_redirect_simulation(login_token):
                passed_tests += 1
        
        # Test 7: Error Scenarios
        total_tests += 1
        if self.test_error_scenarios():
            passed_tests += 1
        
        # Final Results
        print("\n" + "=" * 80)
        print("📊 RESULTADOS FINALES DE PRUEBAS FRONTEND")
        print("=" * 80)
        print(f"✅ Pruebas exitosas: {passed_tests}/{total_tests}")
        print(f"❌ Pruebas fallidas: {total_tests - passed_tests}/{total_tests}")
        print(f"📈 Porcentaje de éxito: {(passed_tests/total_tests)*100:.1f}%")
        
        if passed_tests == total_tests:
            print("\n🎉 TODAS LAS PRUEBAS FRONTEND EXITOSAS")
            print("✅ El sistema de registro e inicio de sesión funciona correctamente desde el frontend")
        else:
            print(f"\n⚠️  SE ENCONTRARON {total_tests - passed_tests} PROBLEMAS")
            print("❌ Revisar los errores específicos arriba para identificar el problema exacto")
        
        print("=" * 80)
        
        return passed_tests, total_tests

def main():
    """Main function to run frontend authentication tests"""
    tester = FrontendAuthTester()
    
    try:
        passed, total = tester.run_comprehensive_frontend_test()
        
        # Exit with appropriate code
        if passed == total:
            print("\n✅ TODAS LAS PRUEBAS FRONTEND COMPLETADAS EXITOSAMENTE")
            sys.exit(0)
        else:
            print(f"\n❌ {total - passed} PRUEBAS FALLARON - REVISAR ERRORES ARRIBA")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⚠️  Pruebas interrumpidas por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Error fatal durante las pruebas: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()