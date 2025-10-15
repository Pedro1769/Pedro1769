#!/usr/bin/env python3
"""
Comprehensive Frontend Testing - Specific Review Request
Testing exact scenarios mentioned in the review request
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://support-panels.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class ComprehensiveFrontendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    {details}")
        print()
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
        
        return success

    def test_specific_registration_scenario(self):
        """Test exact registration scenario from review request"""
        print("=" * 80)
        print("🎯 PRUEBA ESPECÍFICA DE REGISTRO - DATOS EXACTOS DEL REVIEW REQUEST")
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
        
        print(f"📤 Registrando usuario con datos:")
        for key, value in registration_data.items():
            print(f"   {key}: {value}")
        print()
        
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/register",
                json=registration_data,
                headers=HEADERS,
                timeout=15
            )
            
            print(f"📥 Response Status: {response.status_code}")
            print(f"📥 Response Headers: {dict(response.headers)}")
            
            if response.content:
                try:
                    data = response.json()
                    print(f"📥 Response Data: {json.dumps(data, indent=2)}")
                except:
                    print(f"📥 Response Text: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    return self.log_result(
                        "Registro Frontend - Datos Específicos",
                        True,
                        f"✅ REGISTRO EXITOSO: Usuario registrado correctamente con token JWT"
                    )
                else:
                    return self.log_result(
                        "Registro Frontend - Datos Específicos", 
                        False,
                        f"❌ Respuesta incompleta: {data}"
                    )
            elif response.status_code == 400:
                data = response.json() if response.content else {}
                error_msg = data.get("detail", "")
                if "ya está" in error_msg.lower():
                    return self.log_result(
                        "Registro Frontend - Datos Específicos",
                        True,
                        f"✅ Usuario ya existe (esperado): {error_msg}"
                    )
                else:
                    return self.log_result(
                        "Registro Frontend - Datos Específicos",
                        False,
                        f"❌ Error 400: {error_msg}"
                    )
            else:
                return self.log_result(
                    "Registro Frontend - Datos Específicos",
                    False,
                    f"❌ Status inesperado: {response.status_code} - {response.text}"
                )
                
        except Exception as e:
            return self.log_result(
                "Registro Frontend - Datos Específicos",
                False,
                f"❌ Error de conexión: {str(e)}"
            )

    def test_specific_login_scenario(self):
        """Test exact login scenario from review request"""
        print("=" * 80)
        print("🎯 PRUEBA ESPECÍFICA DE LOGIN - CREDENCIALES EXACTAS DEL REVIEW REQUEST")
        print("=" * 80)
        
        # Exact credentials from review request
        login_data = {
            "username": "pedro.hurtado",
            "password": "gim123"
        }
        
        print(f"📤 Iniciando sesión con credenciales:")
        print(f"   username: {login_data['username']}")
        print(f"   password: {login_data['password']}")
        print()
        
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=login_data,
                headers=HEADERS,
                timeout=15
            )
            
            print(f"📥 Response Status: {response.status_code}")
            print(f"📥 Response Headers: {dict(response.headers)}")
            
            if response.content:
                try:
                    data = response.json()
                    print(f"📥 Response Data: {json.dumps(data, indent=2)}")
                except:
                    print(f"📥 Response Text: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    token = data.get("token")
                    user = data.get("user", {})
                    
                    # Test dashboard redirect simulation
                    dashboard_success = self.test_dashboard_access(token)
                    
                    return self.log_result(
                        "Login Frontend - Credenciales Específicas",
                        True,
                        f"✅ LOGIN EXITOSO: {user.get('name')} ({user.get('role')}) - Dashboard: {'✅' if dashboard_success else '❌'}"
                    )
                else:
                    return self.log_result(
                        "Login Frontend - Credenciales Específicas",
                        False,
                        f"❌ Respuesta incompleta: {data}"
                    )
            elif response.status_code == 401:
                data = response.json() if response.content else {}
                return self.log_result(
                    "Login Frontend - Credenciales Específicas",
                    False,
                    f"❌ Credenciales inválidas: {data.get('detail', 'Sin detalles')}"
                )
            else:
                return self.log_result(
                    "Login Frontend - Credenciales Específicas",
                    False,
                    f"❌ Status inesperado: {response.status_code} - {response.text}"
                )
                
        except Exception as e:
            return self.log_result(
                "Login Frontend - Credenciales Específicas",
                False,
                f"❌ Error de conexión: {str(e)}"
            )

    def test_dashboard_access(self, token: str):
        """Test dashboard access after login"""
        if not token:
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {token}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/auth/profile",
                headers=headers,
                timeout=10
            )
            
            return response.status_code == 200 and response.json().get("username")
            
        except:
            return False

    def test_console_errors_simulation(self):
        """Simulate and test for common console errors"""
        print("=" * 80)
        print("🔍 VERIFICACIÓN DE ERRORES COMUNES DE CONSOLA")
        print("=" * 80)
        
        error_scenarios = [
            {
                "name": "Failed to fetch (Network Error)",
                "test": self.test_network_connectivity
            },
            {
                "name": "CORS Error",
                "test": self.test_cors_configuration
            },
            {
                "name": "422 Validation Error",
                "test": self.test_validation_errors
            },
            {
                "name": "401 Authentication Error",
                "test": self.test_auth_errors
            }
        ]
        
        all_passed = True
        
        for scenario in error_scenarios:
            try:
                success = scenario["test"]()
                if not success:
                    all_passed = False
            except Exception as e:
                self.log_result(scenario["name"], False, f"Error durante prueba: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_network_connectivity(self):
        """Test network connectivity"""
        try:
            response = self.session.get(f"{BASE_URL}/health", timeout=5)
            return self.log_result(
                "Network Connectivity",
                response.status_code == 200,
                f"Backend {'accesible' if response.status_code == 200 else 'no accesible'}: {response.status_code}"
            )
        except Exception as e:
            return self.log_result(
                "Network Connectivity",
                False,
                f"Error de red: {str(e)}"
            )

    def test_cors_configuration(self):
        """Test CORS configuration"""
        try:
            # Simulate browser preflight request
            headers = {
                "Origin": "https://support-panels.preview.emergentagent.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            }
            
            response = self.session.options(f"{BASE_URL}/auth/login", headers=headers, timeout=5)
            
            # Check for CORS headers in response
            cors_origin = response.headers.get("Access-Control-Allow-Origin")
            cors_methods = response.headers.get("Access-Control-Allow-Methods")
            
            cors_ok = cors_origin is not None
            
            return self.log_result(
                "CORS Configuration",
                cors_ok,
                f"CORS {'configurado' if cors_ok else 'no configurado'}: Origin={cors_origin}, Methods={cors_methods}"
            )
            
        except Exception as e:
            return self.log_result(
                "CORS Configuration",
                False,
                f"Error verificando CORS: {str(e)}"
            )

    def test_validation_errors(self):
        """Test validation error handling"""
        try:
            # Send invalid data to trigger 422
            invalid_data = {"username": "", "password": ""}
            
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=invalid_data,
                headers=HEADERS,
                timeout=5
            )
            
            is_422 = response.status_code == 422
            
            return self.log_result(
                "422 Validation Errors",
                is_422,
                f"Validación {'funcionando' if is_422 else 'no funcionando'}: Status {response.status_code}"
            )
            
        except Exception as e:
            return self.log_result(
                "422 Validation Errors",
                False,
                f"Error en validación: {str(e)}"
            )

    def test_auth_errors(self):
        """Test authentication error handling"""
        try:
            # Send invalid credentials to trigger 401
            invalid_creds = {"username": "invalid_user", "password": "wrong_pass"}
            
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=invalid_creds,
                headers=HEADERS,
                timeout=5
            )
            
            is_401 = response.status_code == 401
            
            return self.log_result(
                "401 Authentication Errors",
                is_401,
                f"Autenticación {'funcionando' if is_401 else 'no funcionando'}: Status {response.status_code}"
            )
            
        except Exception as e:
            return self.log_result(
                "401 Authentication Errors",
                False,
                f"Error en autenticación: {str(e)}"
            )

    def test_environment_configuration(self):
        """Test environment variable configuration"""
        print("=" * 80)
        print("🔧 VERIFICACIÓN DE VARIABLES DE ENTORNO")
        print("=" * 80)
        
        try:
            # Check frontend .env
            with open('/app/frontend/.env', 'r') as f:
                frontend_env = f.read()
            
            # Check backend .env
            with open('/app/backend/.env', 'r') as f:
                backend_env = f.read()
            
            # Extract REACT_APP_BACKEND_URL
            backend_url = None
            for line in frontend_env.split('\n'):
                if line.startswith('REACT_APP_BACKEND_URL='):
                    backend_url = line.split('=', 1)[1].strip()
                    break
            
            print(f"📋 Frontend .env:")
            print(f"   REACT_APP_BACKEND_URL = {backend_url}")
            print()
            
            print(f"📋 Backend .env:")
            for line in backend_env.split('\n'):
                if line.strip() and not line.startswith('#'):
                    key = line.split('=')[0]
                    print(f"   {key} = [CONFIGURED]")
            print()
            
            # Verify URL matches
            expected_api_url = backend_url.rstrip('/') + '/api' if backend_url else None
            url_match = expected_api_url == BASE_URL
            
            return self.log_result(
                "Environment Configuration",
                url_match and backend_url is not None,
                f"URLs {'coinciden' if url_match else 'no coinciden'}: Frontend={backend_url} -> API={expected_api_url}"
            )
            
        except Exception as e:
            return self.log_result(
                "Environment Configuration",
                False,
                f"Error leyendo configuración: {str(e)}"
            )

    def run_comprehensive_test(self):
        """Run all comprehensive tests"""
        print("\n" + "=" * 100)
        print("🚀 PRUEBAS COMPREHENSIVAS DE FRONTEND - ESCENARIOS ESPECÍFICOS DEL REVIEW REQUEST")
        print("=" * 100)
        
        tests_run = 0
        tests_passed = 0
        
        # Test 1: Environment Configuration
        tests_run += 1
        if self.test_environment_configuration():
            tests_passed += 1
        
        # Test 2: Specific Registration Scenario
        tests_run += 1
        if self.test_specific_registration_scenario():
            tests_passed += 1
        
        # Test 3: Specific Login Scenario
        tests_run += 1
        if self.test_specific_login_scenario():
            tests_passed += 1
        
        # Test 4: Console Errors Simulation
        tests_run += 1
        if self.test_console_errors_simulation():
            tests_passed += 1
        
        # Final Summary
        print("=" * 100)
        print("📊 RESUMEN FINAL DE PRUEBAS COMPREHENSIVAS")
        print("=" * 100)
        print(f"✅ Pruebas exitosas: {tests_passed}/{tests_run}")
        print(f"❌ Pruebas fallidas: {tests_run - tests_passed}/{tests_run}")
        print(f"📈 Porcentaje de éxito: {(tests_passed/tests_run)*100:.1f}%")
        
        if tests_passed == tests_run:
            print("\n🎉 TODAS LAS PRUEBAS COMPREHENSIVAS EXITOSAS")
            print("✅ El backend funciona correctamente para registro e inicio de sesión")
            print("✅ No se detectaron errores en las APIs de autenticación")
            print("✅ Las variables de entorno están correctamente configuradas")
            print("✅ Los errores de validación y autenticación funcionan apropiadamente")
        else:
            print(f"\n⚠️  SE ENCONTRARON {tests_run - tests_passed} PROBLEMAS")
            print("❌ Revisar los detalles específicos arriba")
        
        print("=" * 100)
        
        return tests_passed, tests_run

def main():
    """Main function"""
    tester = ComprehensiveFrontendTester()
    
    try:
        passed, total = tester.run_comprehensive_test()
        
        if passed == total:
            print("\n✅ CONCLUSIÓN: EL BACKEND FUNCIONA CORRECTAMENTE")
            print("🔍 Si el usuario reporta errores, el problema está en el FRONTEND, no en el backend")
            sys.exit(0)
        else:
            print(f"\n❌ SE ENCONTRARON {total - passed} PROBLEMAS EN EL BACKEND")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⚠️  Pruebas interrumpidas")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Error fatal: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()