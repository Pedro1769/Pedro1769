#!/usr/bin/env python3
"""
VERIFICACIÓN ESPECÍFICA - ROL DE USUARIO bifencia.orozco
Test específico para verificar que bifencia.orozco tenga el rol correcto
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://support-panels.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Credenciales específicas para la prueba
TEST_CREDENTIALS = {"username": "bifencia.orozco", "password": "gim123"}

class RoleVerificationTester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.user_data = None
        
    def log_result(self, test_name: str, success: bool, details: str = "", data: any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    Details: {details}")
        if data:
            print(f"    Data: {data}")
        print()
        
    def test_login_bifencia_orozco(self):
        """Test 1: Login con bifencia.orozco/gim123"""
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=TEST_CREDENTIALS,
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.token = data["token"]
                    self.user_data = data.get("user", {})
                    
                    self.log_result(
                        "Login bifencia.orozco",
                        True,
                        f"Login exitoso - Usuario: {self.user_data.get('name', 'Unknown')}"
                    )
                    return True
                else:
                    self.log_result(
                        "Login bifencia.orozco",
                        False,
                        "Login falló - respuesta sin token",
                        data
                    )
                    return False
            else:
                self.log_result(
                    "Login bifencia.orozco",
                    False,
                    f"Login falló - Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Login bifencia.orozco", False, f"Error de conexión: {str(e)}")
            return False
    
    def test_verify_role_docente_bachillerato(self):
        """Test 2: Verificar que el rol sea 'docente_bachillerato'"""
        if not self.token or not self.user_data:
            self.log_result("Verificar Rol", False, "No hay datos de usuario disponibles")
            return False
            
        try:
            # Verificar rol desde los datos de login
            current_role = self.user_data.get("role", "")
            expected_role = "docente_bachillerato"
            
            if current_role == expected_role:
                self.log_result(
                    "Verificar Rol",
                    True,
                    f"Rol correcto: {current_role}"
                )
                return True
            else:
                self.log_result(
                    "Verificar Rol",
                    False,
                    f"Rol INCORRECTO - Actual: '{current_role}', Esperado: '{expected_role}'",
                    self.user_data
                )
                return False
                
        except Exception as e:
            self.log_result("Verificar Rol", False, f"Error verificando rol: {str(e)}")
            return False
    
    def test_verify_bachillerato_students_access(self):
        """Test 3: Verificar acceso a estudiantes de bachillerato (grados 6°, 7°, 8°, 9°, 10°, 11°)"""
        if not self.token:
            self.log_result("Acceso Estudiantes Bachillerato", False, "No hay token disponible")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.token}"
            }
            
            # Obtener todos los estudiantes del usuario
            response = self.session.get(
                f"{BASE_URL}/students",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                students = response.json()
                if isinstance(students, list):
                    # Verificar que los estudiantes sean de bachillerato
                    bachillerato_grades = ["6°", "7°", "8°", "9°", "10°", "11°"]
                    student_grades = [student.get("grade", "") for student in students]
                    unique_grades = list(set(student_grades))
                    
                    # Verificar si los grados son de bachillerato
                    bachillerato_students = [s for s in students if s.get("grade", "") in bachillerato_grades]
                    primaria_students = [s for s in students if s.get("grade", "") not in bachillerato_grades and s.get("grade", "") != ""]
                    
                    if len(bachillerato_students) > 0 and len(primaria_students) == 0:
                        self.log_result(
                            "Acceso Estudiantes Bachillerato",
                            True,
                            f"Acceso correcto - {len(bachillerato_students)} estudiantes de bachillerato, grados: {unique_grades}"
                        )
                        return True
                    elif len(primaria_students) > 0:
                        self.log_result(
                            "Acceso Estudiantes Bachillerato",
                            False,
                            f"PROBLEMA: Tiene acceso a {len(primaria_students)} estudiantes de primaria cuando debería solo ver bachillerato. Grados: {unique_grades}",
                            {"total_students": len(students), "bachillerato": len(bachillerato_students), "primaria": len(primaria_students)}
                        )
                        return False
                    else:
                        self.log_result(
                            "Acceso Estudiantes Bachillerato",
                            False,
                            f"No tiene acceso a estudiantes de bachillerato. Grados encontrados: {unique_grades}",
                            {"total_students": len(students), "grades": unique_grades}
                        )
                        return False
                else:
                    self.log_result(
                        "Acceso Estudiantes Bachillerato",
                        False,
                        "Respuesta no es una lista de estudiantes",
                        students
                    )
                    return False
            else:
                self.log_result(
                    "Acceso Estudiantes Bachillerato",
                    False,
                    f"Error obteniendo estudiantes - Status code: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Acceso Estudiantes Bachillerato", False, f"Error de conexión: {str(e)}")
            return False
    
    def test_verify_specific_grades_access(self):
        """Test 4: Verificar acceso específico a cada grado de bachillerato"""
        if not self.token:
            self.log_result("Verificar Grados Específicos", False, "No hay token disponible")
            return False
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.token}"
            }
            
            bachillerato_grades = ["6°", "7°", "8°", "9°", "10°", "11°"]
            accessible_grades = []
            
            for grade in bachillerato_grades:
                response = self.session.get(
                    f"{BASE_URL}/students?grade={grade}",
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    students = response.json()
                    if isinstance(students, list) and len(students) > 0:
                        accessible_grades.append(grade)
            
            if len(accessible_grades) > 0:
                self.log_result(
                    "Verificar Grados Específicos",
                    True,
                    f"Acceso a grados de bachillerato: {accessible_grades}"
                )
                return True
            else:
                self.log_result(
                    "Verificar Grados Específicos",
                    False,
                    "No tiene acceso a ningún grado de bachillerato"
                )
                return False
                
        except Exception as e:
            self.log_result("Verificar Grados Específicos", False, f"Error de conexión: {str(e)}")
            return False
    
    def run_verification_tests(self):
        """Ejecutar todas las pruebas de verificación"""
        print("🔍 VERIFICACIÓN ESPECÍFICA - ROL DE USUARIO bifencia.orozco")
        print("=" * 60)
        print("OBJETIVO: Verificar que bifencia.orozco tenga rol 'docente_bachillerato'")
        print("CREDENCIALES: bifencia.orozco/gim123")
        print("=" * 60)
        
        results = []
        
        # Test 1: Login
        login_success = self.test_login_bifencia_orozco()
        results.append(("Login", login_success))
        
        if not login_success:
            print("❌ No se puede continuar sin login exitoso")
            return False
        
        # Test 2: Verificar rol
        role_success = self.test_verify_role_docente_bachillerato()
        results.append(("Rol Correcto", role_success))
        
        # Test 3: Verificar acceso a estudiantes
        students_success = self.test_verify_bachillerato_students_access()
        results.append(("Acceso Estudiantes", students_success))
        
        # Test 4: Verificar grados específicos
        grades_success = self.test_verify_specific_grades_access()
        results.append(("Grados Específicos", grades_success))
        
        # Resumen
        print("=" * 60)
        print("📊 RESUMEN DE VERIFICACIÓN")
        print("=" * 60)
        
        total_tests = len(results)
        passed_tests = sum(1 for _, success in results if success)
        
        for test_name, success in results:
            status = "✅" if success else "❌"
            print(f"{status} {test_name}")
        
        print(f"\nResultado: {passed_tests}/{total_tests} pruebas exitosas")
        
        # Diagnóstico específico
        if not role_success:
            print("\n🚨 PROBLEMA CRÍTICO IDENTIFICADO:")
            print(f"   Usuario: bifencia.orozco")
            print(f"   Rol actual: {self.user_data.get('role', 'DESCONOCIDO')}")
            print(f"   Rol esperado: docente_bachillerato")
            print("   ACCIÓN REQUERIDA: Corregir rol en base de datos")
        
        if role_success and not students_success:
            print("\n⚠️  PROBLEMA DE ACCESO:")
            print("   El rol es correcto pero el acceso a estudiantes no")
            print("   Verificar filtros de grado en el backend")
        
        if passed_tests == total_tests:
            print("\n🎉 VERIFICACIÓN EXITOSA: bifencia.orozco tiene el rol correcto")
            return True
        else:
            print(f"\n❌ VERIFICACIÓN FALLIDA: {total_tests - passed_tests} problemas encontrados")
            return False

def main():
    """Ejecutar verificación específica"""
    tester = RoleVerificationTester()
    success = tester.run_verification_tests()
    
    # Guardar resultados
    results_data = {
        "timestamp": datetime.now().isoformat(),
        "user_tested": "bifencia.orozco",
        "expected_role": "docente_bachillerato",
        "actual_role": tester.user_data.get("role", "UNKNOWN") if tester.user_data else "UNKNOWN",
        "verification_passed": success,
        "user_data": tester.user_data
    }
    
    with open("/app/role_verification_results.json", "w") as f:
        json.dump(results_data, f, indent=2, default=str)
    
    print(f"\n📄 Resultados guardados en: /app/role_verification_results.json")
    
    return success

if __name__ == "__main__":
    main()