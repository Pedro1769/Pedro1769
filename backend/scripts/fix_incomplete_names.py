"""
Script para eliminar estudiantes con nombres incompletos (solo primer nombre)
y otros datos problemáticos de las pruebas
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def clean_incomplete_names():
    """Eliminar estudiantes que solo tienen un nombre (sin apellidos)"""
    
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DB_NAME', 'gaa_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"🔌 Conectado a MongoDB: {db_name}\n")
    
    # Obtener todos los estudiantes
    all_students = await db.students.find({}).to_list(None)
    
    print(f"📊 Total de estudiantes en BD: {len(all_students)}\n")
    
    # Identificar estudiantes con nombres incompletos
    incomplete = []
    complete = []
    
    for student in all_students:
        name = student.get('name', '').strip()
        
        # Un nombre es incompleto si:
        # 1. Tiene menos de 2 palabras
        # 2. O tiene menos de 10 caracteres (probablemente solo nombre)
        words = name.split()
        
        if len(words) < 2 or len(name) < 10:
            incomplete.append(student)
        else:
            complete.append(student)
    
    print(f"📋 Análisis de nombres:")
    print(f"   ✅ Nombres completos (>=2 palabras): {len(complete)}")
    print(f"   ❌ Nombres incompletos (<2 palabras): {len(incomplete)}\n")
    
    if incomplete:
        print(f"🔍 Ejemplos de nombres incompletos que se eliminarán:")
        for i, student in enumerate(incomplete[:20]):
            grade = student.get('grade', 'Sin grado')
            print(f"   {i+1}. \"{student.get('name')}\" - Grado: {grade}")
        
        if len(incomplete) > 20:
            print(f"   ... y {len(incomplete) - 20} más\n")
        
        print(f"\n⚠️  Se eliminarán {len(incomplete)} estudiantes con nombres incompletos")
        confirm = input("¿Continuar? Escribe 'SI' para confirmar: ")
        
        if confirm.strip().upper() == "SI":
            # Obtener IDs de estudiantes a eliminar
            ids_to_delete = [s['_id'] for s in incomplete]
            
            result = await db.students.delete_many({"_id": {"$in": ids_to_delete}})
            
            print(f"\n✅ {result.deleted_count} estudiantes con nombres incompletos eliminados")
            print(f"✅ Quedan {len(complete)} estudiantes con nombres completos")
            
            # Mostrar nueva distribución por grado
            print(f"\n📊 Nueva distribución por grado:")
            pipeline = [
                {"$group": {
                    "_id": "$grade",
                    "count": {"$sum": 1}
                }},
                {"$sort": {"_id": 1}}
            ]
            
            grade_counts = await db.students.aggregate(pipeline).to_list(None)
            
            for item in grade_counts:
                grade = item['_id'] or 'Sin grado'
                count = item['count']
                print(f"   {grade}: {count} estudiantes")
        else:
            print("\n❌ Operación cancelada")
    else:
        print("✅ No hay estudiantes con nombres incompletos")
    
    client.close()


async def show_remaining_duplicates():
    """Mostrar duplicados que quedan después de limpiar"""
    
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DB_NAME', 'gaa_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"\n🔍 Buscando duplicados restantes...\n")
    
    # Buscar duplicados por nombre completo
    pipeline = [
        {"$group": {
            "_id": "$name",
            "count": {"$sum": 1},
            "grades": {"$addToSet": "$grade"}
        }},
        {"$match": {"count": {"$gt": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    duplicates = await db.students.aggregate(pipeline).to_list(None)
    
    if duplicates:
        print(f"⚠️  Encontrados {len(duplicates)} nombres duplicados:")
        for i, dup in enumerate(duplicates[:10], 1):
            print(f"\n   {i}. {dup['_id']}")
            print(f"      Aparece {dup['count']} veces en grados: {', '.join(dup['grades'])}")
        
        if len(duplicates) > 10:
            print(f"\n   ... y {len(duplicates) - 10} más")
    else:
        print("✅ No hay duplicados")
    
    client.close()


async def main():
    print("=" * 70)
    print("  LIMPIEZA DE ESTUDIANTES CON NOMBRES INCOMPLETOS")
    print("=" * 70)
    print()
    
    await clean_incomplete_names()
    await show_remaining_duplicates()
    
    print("\n" + "=" * 70)
    print("✅ Proceso completado")
    print("=" * 70)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n❌ Operación cancelada por el usuario")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
