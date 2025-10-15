#!/usr/bin/env python3
"""
VERIFICACIÓN ESPECÍFICA: Rol del usuario bifencia.orozco
Sistema de Gestión Escolar GAA - Verificación de Rol de Usuario

OBJETIVO:
1. Login con bifencia.orozco/gim123
2. Verificar que el rol sea "docente_bachillerato" y NO "docente_primaria"
3. Verificar que tenga grados asignados de bachillerato (6°, 7°, 8°, 9°, 10°, 11°)
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration - Using environment variable from frontend/.env
BASE_URL = "https://support-panels.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Usuario específico a verificar
TEST_USER = {"username": "bifencia.orozco", "password": "gim123"}

class BifenciaRoleVerifier:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.user_profile = None
        self.verification_results = []
        
    def log_verification(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log verification results"""
        result = {
            "verification": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.verification_results.append(result)
        
        status = "✅ CORRECTO" if success else "❌ INCORRECTO"
        print(f"{status} {test_name}")
        if details:
            print(f"    Detalles: {details}")
        if not success and response_data:
            print(f"    Respuesta: {response_data}")
        print()

    def verify_login(self):
        """Verificar login con bifencia.orozco/gim123"""
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=TEST_USER,
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.token = data["token"]
                    user_info = data.get("user", {})
                    self.user_profile = user_info
                    
                    self.log_verification(
                        "Login con bifencia.orozco/gim123",
                        True,
                        f"Usuario: {user_info.get('name', 'Desconocido')}, Rol: {user_info.get('role', 'Desconocido')}"
                    )
                    return True
                else:
                    self.log_verification(
                        "Login con bifencia.orozco/gim123",
                        False,
                        "Falta token o flag de éxito en la respuesta",
                        data
                    )
                    return False
            else:
                self.log_verification(
                    "Login con bifencia.orozco/gim123",
                    False,
                    f"Código de estado: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_verification("Login con bifencia.orozco/gim123", False, f"Error de conexión: {str(e)}")
            return False

    def verify_role_is_docente_bachillerato(self):
        """Verificar que el rol sea 'docente_bachillerato' y NO 'docente_primaria'"""
        if not self.user_profile:
            self.log_verification(
                "Verificación de rol docente_bachillerato",
                False,
                "No hay información de perfil de usuario disponible"
            )
            return False
        
        user_role = self.user_profile.get('role', '')
        
        if user_role == "docente_bachillerato":
            self.log_verification(
                "Verificación de rol docente_bachillerato",
                True,
                f"✅ Rol correcto: '{user_role}' - Usuario es Docente Bachillerato"
            )
            return True
        elif user_role == "docente_primaria":
            self.log_verification(
                "Verificación de rol docente_bachillerato",
                False,
                f"❌ ROL INCORRECTO: '{user_role}' - Usuario aparece como Docente Primaria cuando debería ser Docente Bachillerato"
            )
            return False
        else:
            self.log_verification(
                "Verificación de rol docente_bachillerato",
                False,
                f"❌ ROL INESPERADO: '{user_role}' - Se esperaba 'docente_bachillerato'"
            )
            return False

    def verify_bachillerato_grades_assigned(self):
        """Verificar que tenga grados asignados de bachillerato (6°, 7°, 8°, 9°, 10°, 11°)"""
        if not self.token:
            self.log_verification(
                "Verificación de grados de bachillerato asignados",
                False,
                "No hay token disponible para verificar grados"
            )
            return False
        
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.token}"
            }
            
            # Obtener estudiantes para verificar qué grados puede ver
            response = self.session.get(
                f"{BASE_URL}/students",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                students = response.json()
                if isinstance(students, list):
                    # Extraer grados únicos de los estudiantes que puede ver
                    grades_visible = set()
                    for student in students:
                        grade = student.get('grade', '')
                        if grade:
                            grades_visible.add(grade)
                    
                    # Grados de bachillerato esperados
                    bachillerato_grades = {"6°", "7°", "8°", "9°", "10°", "11°"}
                    
                    # Verificar si tiene acceso a grados de bachillerato
                    bachillerato_grades_found = grades_visible.intersection(bachillerato_grades)
                    primaria_grades = {"1°", "2°", "3°", "4°", "5°"}
                    primaria_grades_found = grades_visible.intersection(primaria_grades)
                    
                    if bachillerato_grades_found and not primaria_grades_found:
                        self.log_verification(
                            "Verificación de grados de bachillerato asignados",
                            True,
                            f"✅ Grados de bachillerato correctos: {sorted(bachillerato_grades_found)} - Total estudiantes: {len(students)}"
                        )
                        return True
                    elif primaria_grades_found and not bachillerato_grades_found:
                        self.log_verification(
                            "Verificación de grados de bachillerato asignados",
                            False,
                            f"❌ PROBLEMA: Usuario tiene grados de PRIMARIA ({sorted(primaria_grades_found)}) cuando debería tener BACHILLERATO - Total estudiantes: {len(students)}"
                        )
                        return False
                    elif bachillerato_grades_found and primaria_grades_found:
                        self.log_verification(
                            "Verificación de grados de bachillerato asignados",
                            False,
                            f"❌ PROBLEMA: Usuario tiene AMBOS tipos de grados - Bachillerato: {sorted(bachillerato_grades_found)}, Primaria: {sorted(primaria_grades_found)} - Total estudiantes: {len(students)}"
                        )
                        return False
                    else:
                        self.log_verification(
                            "Verificación de grados de bachillerato asignados",
                            False,
                            f"❌ PROBLEMA: No se encontraron grados específicos. Grados visibles: {sorted(grades_visible)} - Total estudiantes: {len(students)}"
                        )
                        return False
                else:
                    self.log_verification(
                        "Verificación de grados de bachillerato asignados",
                        False,
                        "La respuesta no es una lista de estudiantes",
                        students
                    )
                    return False
            else:
                self.log_verification(
                    "Verificación de grados de bachillerato asignados",
                    False,
                    f"Error al obtener estudiantes: {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_verification(
                "Verificación de grados de bachillerato asignados",
                False,
                f"Error de conexión: {str(e)}"
            )
            return False

    def run_verification(self):
        """Ejecutar verificación completa del rol de bifencia.orozco"""
        print("🔍 VERIFICACIÓN ESPECÍFICA: Rol del usuario bifencia.orozco")
        print("🎯 OBJETIVO: Verificar que sea 'docente_bachillerato' con grados de bachillerato")
        print("=" * 70)
        
        # Verificación 1: Login
        if not self.verify_login():
            print("❌ No se pudo hacer login. Deteniendo verificación.")
            return False
        
        # Verificación 2: Rol correcto
        role_correct = self.verify_role_is_docente_bachillerato()
        
        # Verificación 3: Grados asignados correctos
        grades_correct = self.verify_bachillerato_grades_assigned()
        
        # Resumen
        print("\n" + "=" * 70)
        print("📊 RESUMEN DE VERIFICACIÓN")
        print("=" * 70)
        
        total_verifications = len(self.verification_results)
        passed_verifications = sum(1 for result in self.verification_results if result["success"])
        failed_verifications = total_verifications - passed_verifications
        
        print(f"Total Verificaciones: {total_verifications}")
        print(f"✅ Correctas: {passed_verifications}")
        print(f"❌ Incorrectas: {failed_verifications}")
        
        if failed_verifications > 0:
            print(f"\n❌ PROBLEMAS ENCONTRADOS ({failed_verifications}):")
            for result in self.verification_results:
                if not result["success"]:
                    print(f"  - {result['verification']}: {result['details']}")
        
        # Conclusión específica
        print(f"\n🎯 CONCLUSIÓN ESPECÍFICA:")
        if role_correct and grades_correct:
            print("✅ bifencia.orozco tiene el rol CORRECTO: 'docente_bachillerato' con grados de bachillerato asignados")
            return True
        elif not role_correct:
            print("❌ PROBLEMA CRÍTICO: bifencia.orozco NO tiene el rol correcto")
            print("   📋 ACCIÓN REQUERIDA: Cambiar rol de usuario a 'docente_bachillerato'")
            return False
        elif not grades_correct:
            print("❌ PROBLEMA CRÍTICO: bifencia.orozco no tiene grados de bachillerato asignados correctamente")
            print("   📋 ACCIÓN REQUERIDA: Asignar grados de bachillerato (6°, 7°, 8°, 9°, 10°, 11°)")
            return False
        else:
            print("❌ PROBLEMAS MÚLTIPLES: Tanto el rol como los grados asignados son incorrectos")
            return False

def main():
    """Ejecutar verificación principal"""
    verifier = BifenciaRoleVerifier()
    success = verifier.run_verification()
    
    # Guardar resultados detallados
    with open("/app/bifencia_role_verification_results.json", "w") as f:
        json.dump(verifier.verification_results, f, indent=2, default=str)
    
    print(f"\n📄 Resultados detallados guardados en: /app/bifencia_role_verification_results.json")
    
    if success:
        print("\n🎉 VERIFICACIÓN EXITOSA: bifencia.orozco tiene el rol correcto!")
        sys.exit(0)
    else:
        print("\n⚠️  VERIFICACIÓN FALLIDA: Se encontraron problemas con el rol de bifencia.orozco")
        sys.exit(1)

if __name__ == "__main__":
    main()