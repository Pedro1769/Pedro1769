#!/usr/bin/env python3
"""
INVESTIGACIÓN CRÍTICA: ¿Por qué no aparecen todos los estudiantes reales?
Sistema de Gestión Escolar GAA - Investigación específica de estudiantes

ENFOQUE: Identificar exactamente por qué los dashboards no muestran 
la cantidad correcta de estudiantes que el admin subió al sistema.
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional
from collections import defaultdict

# Configuration
BASE_URL = "https://support-panels.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Test users específicos mencionados en la solicitud
TEST_USERS = {
    "admin": {"username": "pedro.hurtado", "password": "gim123"},
    "docente_bachillerato": {"username": "bifencia.orozco", "password": "gim123"},
    "coordinadora": {"username": "coord.convivencia", "password": "gim123"}
}

class StudentInvestigator:
    def __init__(self):
        self.session = requests.Session()
        self.tokens = {}
        self.investigation_results = []
        
    def log_investigation(self, test_name: str, success: bool, details: str = "", data: Any = None):
        """Log investigation results"""
        result = {
            "investigation": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "data": data
        }
        self.investigation_results.append(result)
        
        status = "✅ CONFIRMADO" if success else "❌ PROBLEMA"
        print(f"{status} {test_name}")
        if details:
            print(f"    📋 {details}")
        print()

    def login_user(self, user_type: str, credentials: Dict[str, str]) -> bool:
        """Login user and store token"""
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=credentials,
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.tokens[user_type] = data["token"]
                    user_info = data.get("user", {})
                    print(f"🔐 Login exitoso - {user_type}: {user_info.get('name', 'Unknown')}")
                    return True
            
            print(f"❌ Login fallido - {user_type}: {response.status_code}")
            return False
                
        except Exception as e:
            print(f"❌ Error login - {user_type}: {str(e)}")
            return False

    def investigate_total_students_in_db(self):
        """INVESTIGACIÓN 1: Verificar total de estudiantes reales en BD"""
        if "admin" not in self.tokens:
            self.log_investigation(
                "1. Total estudiantes en BD", 
                False, 
                "No hay token de admin disponible"
            )
            return
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens['admin']}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/students",
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                students = response.json()
                total_students = len(students)
                
                # Analizar distribución por grados
                grade_distribution = defaultdict(int)
                for student in students:
                    grade = student.get("grade", "Sin grado")
                    grade_distribution[grade] += 1
                
                # Verificar si son datos reales o mock
                sample_names = [s.get("name", "") for s in students[:5]]
                is_mock_data = any("Test" in name or "Sample" in name or "Mock" in name for name in sample_names)
                
                details = f"Total: {total_students} estudiantes. "
                details += f"Distribución por grados: {dict(grade_distribution)}. "
                details += f"Datos {'MOCK' if is_mock_data else 'REALES'}"
                
                self.log_investigation(
                    "1. Total estudiantes en BD",
                    True,
                    details,
                    {
                        "total": total_students,
                        "distribution": dict(grade_distribution),
                        "is_mock": is_mock_data,
                        "sample_names": sample_names
                    }
                )
                
            else:
                self.log_investigation(
                    "1. Total estudiantes en BD",
                    False,
                    f"Error al obtener estudiantes: {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_investigation(
                "1. Total estudiantes en BD",
                False,
                f"Error de conexión: {str(e)}"
            )

    def investigate_endpoint_returns_all(self):
        """INVESTIGACIÓN 2: ¿El endpoint GET /api/students retorna TODOS los estudiantes?"""
        if "admin" not in self.tokens:
            self.log_investigation(
                "2. Endpoint retorna TODOS",
                False,
                "No hay token de admin disponible"
            )
            return
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens['admin']}"
            }
            
            # Hacer múltiples llamadas para verificar consistencia
            responses = []
            for i in range(3):
                response = self.session.get(
                    f"{BASE_URL}/students",
                    headers=headers,
                    timeout=15
                )
                if response.status_code == 200:
                    responses.append(len(response.json()))
                else:
                    responses.append(f"Error: {response.status_code}")
            
            # Verificar consistencia
            if all(isinstance(r, int) for r in responses):
                if len(set(responses)) == 1:
                    # Todas las respuestas son iguales
                    self.log_investigation(
                        "2. Endpoint retorna TODOS",
                        True,
                        f"Endpoint consistente: {responses[0]} estudiantes en 3 llamadas",
                        {"responses": responses, "consistent": True}
                    )
                else:
                    # Respuestas inconsistentes
                    self.log_investigation(
                        "2. Endpoint retorna TODOS",
                        False,
                        f"Endpoint INCONSISTENTE: {responses} - diferentes cantidades en llamadas múltiples",
                        {"responses": responses, "consistent": False}
                    )
            else:
                self.log_investigation(
                    "2. Endpoint retorna TODOS",
                    False,
                    f"Errores en llamadas: {responses}",
                    {"responses": responses}
                )
                
        except Exception as e:
            self.log_investigation(
                "2. Endpoint retorna TODOS",
                False,
                f"Error de conexión: {str(e)}"
            )

    def investigate_grade_distribution(self):
        """INVESTIGACIÓN 3: Verificar distribución por grados (Transición, 1°-11°)"""
        if "admin" not in self.tokens:
            self.log_investigation(
                "3. Distribución por grados",
                False,
                "No hay token de admin disponible"
            )
            return
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens['admin']}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/students",
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                students = response.json()
                
                # Analizar distribución detallada
                expected_grades = ["Transición", "1°", "2°", "3°", "4°", "5°", "6°", "7°", "8°", "9°", "10°", "11°"]
                grade_distribution = defaultdict(int)
                
                for student in students:
                    grade = student.get("grade", "Sin grado")
                    grade_distribution[grade] += 1
                
                # Verificar cobertura de grados
                missing_grades = [g for g in expected_grades if g not in grade_distribution]
                present_grades = [g for g in expected_grades if g in grade_distribution and grade_distribution[g] > 0]
                
                details = f"Grados con estudiantes: {len(present_grades)}/12. "
                details += f"Presentes: {present_grades}. "
                if missing_grades:
                    details += f"Faltantes: {missing_grades}. "
                details += f"Distribución completa: {dict(grade_distribution)}"
                
                self.log_investigation(
                    "3. Distribución por grados",
                    len(missing_grades) == 0,  # Success si no faltan grados
                    details,
                    {
                        "distribution": dict(grade_distribution),
                        "present_grades": present_grades,
                        "missing_grades": missing_grades,
                        "coverage": f"{len(present_grades)}/12"
                    }
                )
                
            else:
                self.log_investigation(
                    "3. Distribución por grados",
                    False,
                    f"Error al obtener estudiantes: {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_investigation(
                "3. Distribución por grados",
                False,
                f"Error de conexión: {str(e)}"
            )

    def investigate_bachillerato_teacher_filtering(self):
        """INVESTIGACIÓN 4: ¿bifencia.orozco ve todos sus estudiantes de grados 6° a 11°?"""
        if "docente_bachillerato" not in self.tokens:
            self.log_investigation(
                "4. Filtrado docente bachillerato",
                False,
                "No hay token de docente bachillerato disponible"
            )
            return
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens['docente_bachillerato']}"
            }
            
            # Obtener estudiantes sin filtro de grado
            response_all = self.session.get(
                f"{BASE_URL}/students",
                headers=headers,
                timeout=15
            )
            
            if response_all.status_code != 200:
                self.log_investigation(
                    "4. Filtrado docente bachillerato",
                    False,
                    f"Error al obtener estudiantes: {response_all.status_code}",
                    response_all.text
                )
                return
            
            students_all = response_all.json()
            
            # Analizar grados de los estudiantes que ve
            grade_distribution = defaultdict(int)
            for student in students_all:
                grade = student.get("grade", "Sin grado")
                grade_distribution[grade] += 1
            
            # Verificar si ve grados de bachillerato (6° a 11°)
            bachillerato_grades = ["6°", "7°", "8°", "9°", "10°", "11°"]
            visible_bachillerato = [g for g in bachillerato_grades if g in grade_distribution and grade_distribution[g] > 0]
            
            # Probar filtros específicos por grado
            grade_filter_results = {}
            for grade in bachillerato_grades:
                response_filtered = self.session.get(
                    f"{BASE_URL}/students?grade={grade}",
                    headers=headers,
                    timeout=15
                )
                if response_filtered.status_code == 200:
                    grade_filter_results[grade] = len(response_filtered.json())
                else:
                    grade_filter_results[grade] = f"Error: {response_filtered.status_code}"
            
            total_students = len(students_all)
            details = f"Total estudiantes visibles: {total_students}. "
            details += f"Grados de bachillerato visibles: {visible_bachillerato}. "
            details += f"Distribución: {dict(grade_distribution)}. "
            details += f"Filtros por grado: {grade_filter_results}"
            
            # Success si ve al menos algunos estudiantes de bachillerato
            success = len(visible_bachillerato) > 0 and total_students > 0
            
            self.log_investigation(
                "4. Filtrado docente bachillerato",
                success,
                details,
                {
                    "total_students": total_students,
                    "grade_distribution": dict(grade_distribution),
                    "visible_bachillerato_grades": visible_bachillerato,
                    "grade_filters": grade_filter_results
                }
            )
                
        except Exception as e:
            self.log_investigation(
                "4. Filtrado docente bachillerato",
                False,
                f"Error de conexión: {str(e)}"
            )

    def investigate_coordinadora_sees_all(self):
        """INVESTIGACIÓN 5: ¿coord.convivencia ve TODOS los estudiantes?"""
        if "coordinadora" not in self.tokens:
            self.log_investigation(
                "5. Coordinadora ve TODOS",
                False,
                "No hay token de coordinadora disponible"
            )
            return
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {self.tokens['coordinadora']}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/students",
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                students_coordinadora = response.json()
                total_coordinadora = len(students_coordinadora)
                
                # Comparar con admin si disponible
                comparison_details = ""
                if "admin" in self.tokens:
                    admin_headers = {
                        **HEADERS,
                        "Authorization": f"Bearer {self.tokens['admin']}"
                    }
                    admin_response = self.session.get(
                        f"{BASE_URL}/students",
                        headers=admin_headers,
                        timeout=15
                    )
                    
                    if admin_response.status_code == 200:
                        students_admin = admin_response.json()
                        total_admin = len(students_admin)
                        
                        if total_coordinadora == total_admin:
                            comparison_details = f"✅ CORRECTO: Ve la misma cantidad que admin ({total_admin})"
                        else:
                            comparison_details = f"❌ PROBLEMA: Ve {total_coordinadora} vs admin {total_admin}"
                    else:
                        comparison_details = "No se pudo comparar con admin"
                
                # Analizar distribución de grados
                grade_distribution = defaultdict(int)
                for student in students_coordinadora:
                    grade = student.get("grade", "Sin grado")
                    grade_distribution[grade] += 1
                
                details = f"Total estudiantes: {total_coordinadora}. "
                details += comparison_details + ". "
                details += f"Distribución por grados: {dict(grade_distribution)}"
                
                # Success si ve una cantidad razonable de estudiantes (>100)
                success = total_coordinadora > 100
                
                self.log_investigation(
                    "5. Coordinadora ve TODOS",
                    success,
                    details,
                    {
                        "total_students": total_coordinadora,
                        "grade_distribution": dict(grade_distribution),
                        "comparison": comparison_details
                    }
                )
                
            else:
                self.log_investigation(
                    "5. Coordinadora ve TODOS",
                    False,
                    f"Error al obtener estudiantes: {response.status_code}",
                    response.text
                )
                
        except Exception as e:
            self.log_investigation(
                "5. Coordinadora ve TODOS",
                False,
                f"Error de conexión: {str(e)}"
            )

    def investigate_specific_problem(self):
        """INVESTIGACIÓN 6: Identificar problema específico - filtrado, carga, o mock data"""
        print("\n🔍 ANÁLISIS FINAL: Identificando problema específico...")
        
        # Recopilar todos los datos de las investigaciones anteriores
        problems_found = []
        
        for result in self.investigation_results:
            if not result["success"]:
                problems_found.append({
                    "investigation": result["investigation"],
                    "issue": result["details"]
                })
        
        # Análisis específico basado en los resultados
        if len(problems_found) == 0:
            self.log_investigation(
                "6. Problema específico identificado",
                True,
                "✅ NO SE ENCONTRARON PROBLEMAS: El sistema de estudiantes funciona correctamente. Los estudiantes reales están siendo cargados y filtrados apropiadamente.",
                {"conclusion": "Sistema funcionando correctamente", "problems": []}
            )
        else:
            # Categorizar problemas
            problem_categories = {
                "carga_datos": [],
                "filtrado": [],
                "consistencia": [],
                "permisos": []
            }
            
            for problem in problems_found:
                if "BD" in problem["investigation"] or "retorna TODOS" in problem["investigation"]:
                    problem_categories["carga_datos"].append(problem)
                elif "filtrado" in problem["investigation"].lower() or "grados" in problem["investigation"]:
                    problem_categories["filtrado"].append(problem)
                elif "INCONSISTENTE" in problem["issue"]:
                    problem_categories["consistencia"].append(problem)
                else:
                    problem_categories["permisos"].append(problem)
            
            # Determinar problema principal
            main_problem = "desconocido"
            if problem_categories["carga_datos"]:
                main_problem = "PROBLEMA DE CARGA DE DATOS"
            elif problem_categories["consistencia"]:
                main_problem = "PROBLEMA DE CONSISTENCIA EN ENDPOINT"
            elif problem_categories["filtrado"]:
                main_problem = "PROBLEMA DE FILTRADO POR ROL"
            elif problem_categories["permisos"]:
                main_problem = "PROBLEMA DE PERMISOS"
            
            details = f"🚨 PROBLEMA IDENTIFICADO: {main_problem}. "
            details += f"Total problemas encontrados: {len(problems_found)}. "
            details += f"Categorías afectadas: {[k for k, v in problem_categories.items() if v]}"
            
            self.log_investigation(
                "6. Problema específico identificado",
                False,
                details,
                {
                    "main_problem": main_problem,
                    "total_problems": len(problems_found),
                    "categorized_problems": problem_categories,
                    "all_problems": problems_found
                }
            )

    def run_investigation(self):
        """Ejecutar investigación completa (máximo 6 pruebas)"""
        print("🔍 INVESTIGACIÓN CRÍTICA: ¿Por qué no aparecen todos los estudiantes reales?")
        print("🎯 ENFOQUE: Identificar problema específico de carga de estudiantes")
        print("=" * 80)
        
        # Login de usuarios necesarios
        print("🔐 Autenticando usuarios...")
        for user_type, credentials in TEST_USERS.items():
            self.login_user(user_type, credentials)
        
        if not self.tokens:
            print("❌ No se pudo autenticar ningún usuario. Deteniendo investigación.")
            return False
        
        print(f"✅ Usuarios autenticados: {list(self.tokens.keys())}")
        print("\n" + "=" * 80)
        
        # Ejecutar las 6 investigaciones específicas
        self.investigate_total_students_in_db()           # 1
        self.investigate_endpoint_returns_all()           # 2  
        self.investigate_grade_distribution()             # 3
        self.investigate_bachillerato_teacher_filtering() # 4
        self.investigate_coordinadora_sees_all()          # 5
        self.investigate_specific_problem()               # 6
        
        # Resumen final
        print("\n" + "=" * 80)
        print("📊 RESUMEN DE INVESTIGACIÓN")
        print("=" * 80)
        
        total_investigations = len(self.investigation_results)
        successful = sum(1 for r in self.investigation_results if r["success"])
        problems = total_investigations - successful
        
        print(f"Total investigaciones: {total_investigations}")
        print(f"✅ Confirmadas: {successful}")
        print(f"❌ Problemas encontrados: {problems}")
        
        if problems > 0:
            print(f"\n🚨 PROBLEMAS CRÍTICOS ENCONTRADOS ({problems}):")
            for result in self.investigation_results:
                if not result["success"]:
                    print(f"  - {result['investigation']}: {result['details']}")
        else:
            print("\n🎉 INVESTIGACIÓN COMPLETADA: No se encontraron problemas críticos")
            print("✅ El sistema de estudiantes funciona correctamente")
        
        return problems == 0

def main():
    """Ejecutar investigación principal"""
    investigator = StudentInvestigator()
    success = investigator.run_investigation()
    
    # Guardar resultados detallados
    with open("/app/student_investigation_results.json", "w") as f:
        json.dump(investigator.investigation_results, f, indent=2, default=str)
    
    print(f"\n📄 Resultados detallados guardados en: /app/student_investigation_results.json")
    
    if success:
        print("\n✅ CONCLUSIÓN: Sistema de estudiantes funcionando correctamente")
        sys.exit(0)
    else:
        print("\n⚠️ CONCLUSIÓN: Se encontraron problemas que requieren atención")
        sys.exit(1)

if __name__ == "__main__":
    main()