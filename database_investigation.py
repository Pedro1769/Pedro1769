#!/usr/bin/env python3
"""
Investigación directa de la base de datos MongoDB
Para entender exactamente qué estudiantes están almacenados
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from collections import defaultdict
import json

async def investigate_database():
    """Investigar directamente la base de datos"""
    
    # Conectar a MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/gaa_database')
    client = AsyncIOMotorClient(mongo_url)
    db = client.gaa_database
    
    print("🔍 INVESTIGACIÓN DIRECTA DE BASE DE DATOS")
    print("=" * 60)
    
    try:
        # 1. Contar total de estudiantes
        total_students = await db.students.count_documents({"is_active": True})
        print(f"📊 Total estudiantes activos: {total_students}")
        
        # 2. Obtener distribución por grados
        pipeline = [
            {"$match": {"is_active": True}},
            {"$group": {"_id": "$grade", "count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]
        
        grade_distribution = {}
        async for doc in db.students.aggregate(pipeline):
            grade_distribution[doc["_id"]] = doc["count"]
        
        print(f"📈 Distribución por grados:")
        for grade, count in sorted(grade_distribution.items()):
            print(f"   {grade}: {count} estudiantes")
        
        # 3. Verificar si hay estudiantes con grados faltantes
        all_grades = ["Transición", "1°", "2°", "3°", "4°", "5°", "6°", "7°", "8°", "9°", "10°", "11°"]
        missing_grades = [g for g in all_grades if g not in grade_distribution]
        
        if missing_grades:
            print(f"❌ Grados sin estudiantes: {missing_grades}")
        else:
            print("✅ Todos los grados tienen estudiantes")
        
        # 4. Verificar algunos estudiantes de muestra
        print(f"\n📋 Muestra de estudiantes por grado:")
        for grade in sorted(grade_distribution.keys()):
            students = await db.students.find({"grade": grade, "is_active": True}).limit(3).to_list(3)
            print(f"   {grade}:")
            for student in students:
                print(f"     - {student.get('name', 'Sin nombre')} (ID: {student.get('_id', 'Sin ID')})")
        
        # 5. Verificar si hay estudiantes inactivos
        inactive_students = await db.students.count_documents({"is_active": False})
        print(f"\n⚠️  Estudiantes inactivos: {inactive_students}")
        
        # 6. Verificar estructura de datos
        sample_student = await db.students.find_one({"is_active": True})
        if sample_student:
            print(f"\n🔍 Estructura de estudiante (muestra):")
            print(f"   Campos disponibles: {list(sample_student.keys())}")
            print(f"   Ejemplo: {sample_student.get('name', 'Sin nombre')} - Grado: {sample_student.get('grade', 'Sin grado')}")
        
        # 7. Verificar si hay problemas de encoding o caracteres especiales
        problematic_grades = await db.students.find({"grade": {"$regex": r"[^\w°\s]"}}).to_list(10)
        if problematic_grades:
            print(f"\n⚠️  Estudiantes con grados problemáticos:")
            for student in problematic_grades:
                print(f"   - {student.get('name', 'Sin nombre')}: '{student.get('grade', 'Sin grado')}'")
        
        return {
            "total_students": total_students,
            "grade_distribution": grade_distribution,
            "missing_grades": missing_grades,
            "inactive_students": inactive_students,
            "sample_student": sample_student
        }
        
    except Exception as e:
        print(f"❌ Error al investigar base de datos: {e}")
        return None
    finally:
        client.close()

async def main():
    """Función principal"""
    result = await investigate_database()
    
    if result:
        # Guardar resultados
        with open("/app/database_investigation_results.json", "w") as f:
            json.dump(result, f, indent=2, default=str)
        
        print(f"\n📄 Resultados guardados en: /app/database_investigation_results.json")
        
        # Conclusiones
        print(f"\n🎯 CONCLUSIONES:")
        if result["missing_grades"]:
            print(f"❌ PROBLEMA CONFIRMADO: Faltan estudiantes en {len(result['missing_grades'])} grados")
            print(f"   Grados faltantes: {result['missing_grades']}")
            print(f"   Esto explica por qué no aparecen todos los estudiantes en los dashboards")
        else:
            print(f"✅ Todos los grados tienen estudiantes")
        
        if result["total_students"] < 500:
            print(f"⚠️  Total de estudiantes ({result['total_students']}) parece bajo para una institución completa")
        else:
            print(f"✅ Cantidad de estudiantes ({result['total_students']}) parece adecuada")

if __name__ == "__main__":
    asyncio.run(main())