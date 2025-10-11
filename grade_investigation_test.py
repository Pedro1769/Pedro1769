#!/usr/bin/env python3
"""
INVESTIGACIÓN ESPECÍFICA DE GRADOS EN BASE DE DATOS
Sistema de Gestión Escolar GAA - Análisis de Columna "grade"

OBJETIVO: Verificar EXACTAMENTE qué grados están en la columna "grade" de la base de datos
según solicitud específica del usuario.
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, List
from collections import Counter

# Configuration - Using environment variable from frontend/.env
BASE_URL = "https://user-permissions-2.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Test users for authentication
TEST_USERS = {
    "admin": {"username": "pedro.hurtado", "password": "gim123"},
    "coordinadora": {"username": "coord.convivencia", "password": "gim123"}
}

class GradeInvestigator:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.coordinadora_token = None
        
    def authenticate_admin(self):
        """Authenticate as admin to get full access to students"""
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=TEST_USERS["admin"],
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.admin_token = data["token"]
                    print(f"✅ Admin authentication successful: {data.get('user', {}).get('name', 'Unknown')}")
                    return True
                else:
                    print(f"❌ Admin authentication failed: Missing token or success flag")
                    return False
            else:
                print(f"❌ Admin authentication failed: Status {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Admin authentication error: {str(e)}")
            return False

    def authenticate_coordinadora(self):
        """Authenticate as coordinadora to get full access to students"""
        try:
            response = self.session.post(
                f"{BASE_URL}/auth/login",
                json=TEST_USERS["coordinadora"],
                headers=HEADERS,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.coordinadora_token = data["token"]
                    print(f"✅ Coordinadora authentication successful: {data.get('user', {}).get('name', 'Unknown')}")
                    return True
                else:
                    print(f"❌ Coordinadora authentication failed: Missing token or success flag")
                    return False
            else:
                print(f"❌ Coordinadora authentication failed: Status {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Coordinadora authentication error: {str(e)}")
            return False

    def get_all_students(self, user_type: str = "admin"):
        """Get ALL students from the database"""
        token = self.admin_token if user_type == "admin" else self.coordinadora_token
        
        if not token:
            print(f"❌ No token available for {user_type}")
            return None
            
        try:
            headers = {
                **HEADERS,
                "Authorization": f"Bearer {token}"
            }
            
            response = self.session.get(
                f"{BASE_URL}/students",
                headers=headers,
                timeout=15
            )
            
            if response.status_code == 200:
                students = response.json()
                if isinstance(students, list):
                    print(f"✅ Retrieved {len(students)} students from database as {user_type}")
                    return students
                else:
                    print(f"❌ Invalid response format: Expected list, got {type(students)}")
                    return None
            else:
                print(f"❌ Failed to get students: Status {response.status_code}")
                print(f"Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Error getting students: {str(e)}")
            return None

    def analyze_grades_distribution(self, students: List[Dict]):
        """Analyze the exact distribution of grades in the database"""
        print("\n" + "=" * 80)
        print("📊 ANÁLISIS DETALLADO DE GRADOS EN BASE DE DATOS")
        print("=" * 80)
        
        if not students:
            print("❌ No students data available for analysis")
            return
        
        # Extract all grades
        grades = []
        students_with_missing_grade = 0
        
        for student in students:
            grade = student.get("grade")
            if grade:
                grades.append(grade)
            else:
                students_with_missing_grade += 1
        
        print(f"📈 ESTADÍSTICAS GENERALES:")
        print(f"   • Total estudiantes en base de datos: {len(students)}")
        print(f"   • Estudiantes con grado definido: {len(grades)}")
        print(f"   • Estudiantes sin grado: {students_with_missing_grade}")
        
        # Count grade distribution
        grade_distribution = Counter(grades)
        
        print(f"\n📋 DISTRIBUCIÓN EXACTA DE ESTUDIANTES POR GRADO:")
        print(f"   (Ordenado por grado)")
        
        # Sort grades naturally (handle numeric sorting)
        def sort_grade(grade_str):
            try:
                # Extract number from grade (e.g., "1°" -> 1, "11°" -> 11)
                if "°" in grade_str:
                    return int(grade_str.replace("°", ""))
                else:
                    return float('inf')  # Put non-standard grades at the end
            except:
                return float('inf')
        
        sorted_grades = sorted(grade_distribution.items(), key=lambda x: sort_grade(x[0]))
        
        total_with_grades = sum(grade_distribution.values())
        
        for grade, count in sorted_grades:
            percentage = (count / total_with_grades) * 100 if total_with_grades > 0 else 0
            print(f"   • {grade:<4}: {count:>4} estudiantes ({percentage:>5.1f}%)")
        
        print(f"\n🎯 GRADOS ÚNICOS ENCONTRADOS EN LA BASE DE DATOS:")
        unique_grades = sorted(set(grades), key=sort_grade)
        print(f"   Total de grados únicos: {len(unique_grades)}")
        print(f"   Grados: {', '.join(unique_grades)}")
        
        # Check for expected grade structure
        print(f"\n🔍 VERIFICACIÓN DE ESTRUCTURA EDUCATIVA ESPERADA:")
        
        expected_grades = {
            "Transición": ["0°"],
            "Básica Primaria": ["1°", "2°", "3°", "4°", "5°"],
            "Básica Secundaria y Media": ["6°", "7°", "8°", "9°", "10°", "11°"]
        }
        
        for level, expected in expected_grades.items():
            print(f"\n   📚 {level}:")
            found_grades = []
            missing_grades = []
            
            for grade in expected:
                if grade in unique_grades:
                    count = grade_distribution.get(grade, 0)
                    found_grades.append(f"{grade} ({count} estudiantes)")
                else:
                    missing_grades.append(grade)
            
            if found_grades:
                print(f"      ✅ Encontrados: {', '.join(found_grades)}")
            else:
                print(f"      ❌ No se encontraron grados de {level}")
                
            if missing_grades:
                print(f"      ⚠️  Faltantes: {', '.join(missing_grades)}")
        
        # Check for unexpected grades
        all_expected = []
        for grades_list in expected_grades.values():
            all_expected.extend(grades_list)
        
        unexpected_grades = [g for g in unique_grades if g not in all_expected]
        if unexpected_grades:
            print(f"\n   🚨 GRADOS NO ESTÁNDAR ENCONTRADOS:")
            for grade in unexpected_grades:
                count = grade_distribution.get(grade, 0)
                print(f"      • {grade}: {count} estudiantes")
        
        return {
            "total_students": len(students),
            "students_with_grade": len(grades),
            "students_without_grade": students_with_missing_grade,
            "unique_grades": unique_grades,
            "grade_distribution": dict(grade_distribution),
            "unexpected_grades": unexpected_grades
        }

    def show_sample_students_by_grade(self, students: List[Dict], max_samples: int = 3):
        """Show sample students for each grade to verify data quality"""
        print(f"\n📝 MUESTRA DE ESTUDIANTES POR GRADO (máximo {max_samples} por grado):")
        print("=" * 80)
        
        # Group students by grade
        students_by_grade = {}
        for student in students:
            grade = student.get("grade", "SIN_GRADO")
            if grade not in students_by_grade:
                students_by_grade[grade] = []
            students_by_grade[grade].append(student)
        
        # Sort grades
        def sort_grade(grade_str):
            if grade_str == "SIN_GRADO":
                return float('inf')
            try:
                if "°" in grade_str:
                    return int(grade_str.replace("°", ""))
                else:
                    return float('inf')
            except:
                return float('inf')
        
        sorted_grade_keys = sorted(students_by_grade.keys(), key=sort_grade)
        
        for grade in sorted_grade_keys:
            students_in_grade = students_by_grade[grade]
            print(f"\n🎓 GRADO {grade} ({len(students_in_grade)} estudiantes):")
            
            # Show sample students
            sample_count = min(max_samples, len(students_in_grade))
            for i in range(sample_count):
                student = students_in_grade[i]
                name = student.get("name", "NOMBRE_NO_DISPONIBLE")
                student_id = student.get("id") or student.get("_id", "ID_NO_DISPONIBLE")
                level = student.get("level", "NIVEL_NO_DISPONIBLE")
                document = student.get("document_number", "DOC_NO_DISPONIBLE")
                
                print(f"   • {name}")
                print(f"     ID: {student_id}, Nivel: {level}, Documento: {document}")
            
            if len(students_in_grade) > max_samples:
                print(f"   ... y {len(students_in_grade) - max_samples} estudiantes más")

    async def get_students_from_database_direct(self):
        """Get students directly from MongoDB database"""
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            
            client = AsyncIOMotorClient('mongodb://localhost:27017/gaa_database')
            db = client['gaa_database']
            
            # Get all students
            students = await db.students.find({}).to_list(length=None)
            
            # Get grade distribution using aggregation
            pipeline = [
                {"$group": {"_id": "$grade", "count": {"$sum": 1}}},
                {"$sort": {"_id": 1}}
            ]
            grade_distribution = await db.students.aggregate(pipeline).to_list(length=None)
            
            client.close()
            
            print(f"✅ Retrieved {len(students)} students directly from MongoDB")
            
            return students, grade_distribution
            
        except Exception as e:
            print(f"❌ Error accessing database directly: {str(e)}")
            return None, None

    def run_investigation(self):
        """Run the complete grade investigation"""
        print("🔍 INICIANDO INVESTIGACIÓN ESPECÍFICA DE GRADOS")
        print("🎯 OBJETIVO: Verificar EXACTAMENTE qué grados están en la columna 'grade'")
        print("=" * 80)
        
        # Step 1: Try direct database access first
        print("\n1️⃣ ACCESO DIRECTO A BASE DE DATOS:")
        
        import asyncio
        students, grade_distribution_raw = asyncio.run(self.get_students_from_database_direct())
        
        if students and grade_distribution_raw:
            print("✅ Acceso directo a MongoDB exitoso")
            
            # Convert raw distribution to our format
            grade_distribution = {}
            for item in grade_distribution_raw:
                grade_distribution[item["_id"]] = item["count"]
            
            # Step 2: Analyze grade distribution
            print("\n2️⃣ ANÁLISIS DE DISTRIBUCIÓN DE GRADOS:")
            analysis_result = self.analyze_grades_distribution(students)
            
            # Step 3: Show sample students
            print("\n3️⃣ MUESTRA DE ESTUDIANTES:")
            self.show_sample_students_by_grade(students, max_samples=2)
            
            # Step 4: MongoDB Aggregation Results
            print("\n4️⃣ CONSULTA DIRECTA MONGODB (EQUIVALENTE A db.students.aggregate()):")
            print("=" * 80)
            print("📊 RESULTADO DE AGREGACIÓN MONGODB:")
            print("   db.students.aggregate([")
            print("     { $group: { _id: '$grade', count: { $sum: 1 } } },")
            print("     { $sort: { '_id': 1 } }")
            print("   ])")
            print()
            
            # Sort grades for display
            def sort_grade(grade_str):
                try:
                    if "°" in grade_str:
                        return int(grade_str.replace("°", ""))
                    else:
                        return float('inf')
                except:
                    return float('inf')
            
            sorted_distribution = sorted(grade_distribution.items(), key=lambda x: sort_grade(x[0]))
            
            for grade, count in sorted_distribution:
                print(f"   • {grade}: {count} estudiantes")
            
            # Step 5: Summary and conclusions
            print("\n" + "=" * 80)
            print("📋 RESUMEN EJECUTIVO DE LA INVESTIGACIÓN")
            print("=" * 80)
            
            if analysis_result:
                print(f"✅ DATOS OBTENIDOS EXITOSAMENTE:")
                print(f"   • Total estudiantes: {analysis_result['total_students']}")
                print(f"   • Estudiantes con grado: {analysis_result['students_with_grade']}")
                print(f"   • Grados únicos encontrados: {len(analysis_result['unique_grades'])}")
                
                print(f"\n📊 GRADOS PRESENTES EN LA BASE DE DATOS:")
                for grade in analysis_result['unique_grades']:
                    count = analysis_result['grade_distribution'].get(grade, 0)
                    print(f"   • {grade}: {count} estudiantes")
                
                if analysis_result['unexpected_grades']:
                    print(f"\n⚠️  GRADOS NO ESTÁNDAR:")
                    for grade in analysis_result['unexpected_grades']:
                        count = analysis_result['grade_distribution'].get(grade, 0)
                        print(f"   • {grade}: {count} estudiantes")
                
                # Save results to file
                results_file = "/app/grade_investigation_results.json"
                with open(results_file, "w", encoding="utf-8") as f:
                    json.dump({
                        "timestamp": datetime.now().isoformat(),
                        "investigation_summary": analysis_result,
                        "mongodb_aggregation_result": grade_distribution,
                        "sample_students": students[:10] if students else []  # Save first 10 as sample
                    }, f, indent=2, ensure_ascii=False, default=str)
                
                print(f"\n💾 Resultados guardados en: {results_file}")
                
            return True
        
        else:
            # Fallback to API approach
            print("⚠️  Acceso directo falló, intentando vía API...")
            
            # Step 2: Authenticate
            print("\n2️⃣ AUTENTICACIÓN:")
            admin_auth = self.authenticate_admin()
            coord_auth = self.authenticate_coordinadora()
            
            if not admin_auth and not coord_auth:
                print("❌ No se pudo autenticar con ningún usuario. Abortando investigación.")
                return False
            
            # Step 3: Get all students (prefer admin for complete access)
            print("\n3️⃣ OBTENCIÓN DE DATOS DE ESTUDIANTES:")
            if admin_auth:
                students = self.get_all_students("admin")
            elif coord_auth:
                students = self.get_all_students("coordinadora")
            else:
                students = None
            
            if not students:
                print("❌ No se pudieron obtener datos de estudiantes. Abortando investigación.")
                return False
            
            # Step 4: Analyze grade distribution
            print("\n4️⃣ ANÁLISIS DE DISTRIBUCIÓN DE GRADOS:")
            analysis_result = self.analyze_grades_distribution(students)
            
            # Step 5: Show sample students
            print("\n5️⃣ MUESTRA DE ESTUDIANTES:")
            self.show_sample_students_by_grade(students, max_samples=2)
            
            # Step 6: Summary and conclusions
            print("\n" + "=" * 80)
            print("📋 RESUMEN EJECUTIVO DE LA INVESTIGACIÓN")
            print("=" * 80)
            
            if analysis_result:
                print(f"✅ DATOS OBTENIDOS EXITOSAMENTE:")
                print(f"   • Total estudiantes: {analysis_result['total_students']}")
                print(f"   • Estudiantes con grado: {analysis_result['students_with_grade']}")
                print(f"   • Grados únicos encontrados: {len(analysis_result['unique_grades'])}")
                
                print(f"\n📊 GRADOS PRESENTES EN LA BASE DE DATOS:")
                for grade in analysis_result['unique_grades']:
                    count = analysis_result['grade_distribution'].get(grade, 0)
                    print(f"   • {grade}: {count} estudiantes")
                
                if analysis_result['unexpected_grades']:
                    print(f"\n⚠️  GRADOS NO ESTÁNDAR:")
                    for grade in analysis_result['unexpected_grades']:
                        count = analysis_result['grade_distribution'].get(grade, 0)
                        print(f"   • {grade}: {count} estudiantes")
                
                # Save results to file
                results_file = "/app/grade_investigation_results.json"
                with open(results_file, "w", encoding="utf-8") as f:
                    json.dump({
                        "timestamp": datetime.now().isoformat(),
                        "investigation_summary": analysis_result,
                        "sample_students": students[:10] if students else []  # Save first 10 as sample
                    }, f, indent=2, ensure_ascii=False, default=str)
                
                print(f"\n💾 Resultados guardados en: {results_file}")
                
            return True

def main():
    """Main investigation execution"""
    investigator = GradeInvestigator()
    success = investigator.run_investigation()
    
    if success:
        print("\n🎉 INVESTIGACIÓN COMPLETADA EXITOSAMENTE")
        print("✅ Se ha obtenido la información exacta de los grados en la base de datos")
        sys.exit(0)
    else:
        print("\n❌ INVESTIGACIÓN FALLÓ")
        print("⚠️  No se pudo completar el análisis de grados")
        sys.exit(1)

if __name__ == "__main__":
    main()