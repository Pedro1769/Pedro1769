"""
Script simple para limpiar estudiantes de prueba de la base de datos
Esto te permite empezar limpio con los 503 estudiantes de tu Excel
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys

# Agregar el directorio padre al path para importar módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from dotenv import load_dotenv
load_dotenv()

async def show_current_students():
    """Mostrar estudiantes actuales en la base de datos"""
    
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DB_NAME', 'gaa_eduportal')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"\n🔌 Conectado a MongoDB: {db_name}")
    
    # Contar por grado
    pipeline = [
        {"$match": {"is_active": True}},
        {"$group": {
            "_id": "$grade",
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    grade_counts = await db.students.aggregate(pipeline).to_list(None)
    
    total = sum(item['count'] for item in grade_counts)
    
    print(f"\n📊 ESTUDIANTES ACTUALES EN LA BASE DE DATOS:")
    print(f"   Total: {total} estudiantes")
    print(f"\n   Distribución por grado:")
    for item in grade_counts:
        grade = item['_id'] or 'Sin grado'
        count = item['count']
        print(f"      {grade}: {count} estudiantes")
    
    # Mostrar algunos nombres
    print(f"\n   📋 Primeros 10 estudiantes:")
    students = await db.students.find({"is_active": True}).limit(10).to_list(None)
    for i, student in enumerate(students, 1):
        print(f"      {i}. {student.get('name', 'Sin nombre')} - Grado: {student.get('grade', 'Sin grado')}")
    
    client.close()
    return total


async def delete_all_students():
    """Eliminar TODOS los estudiantes de la base de datos"""
    
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DB_NAME', 'gaa_eduportal')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Contar total
    total = await db.students.count_documents({})
    
    print(f"\n⚠️  ADVERTENCIA: Se eliminarán {total} estudiantes de la base de datos")
    print(f"   Esta acción NO se puede deshacer.")
    print(f"   Después podrás cargar los 503 estudiantes desde tu Excel.")
    
    confirm = input(f"\n¿Estás SEGURO de eliminar {total} estudiantes? Escribe 'SI ELIMINAR' para confirmar: ")
    
    if confirm.strip().upper() == "SI ELIMINAR":
        result = await db.students.delete_many({})
        print(f"\n✅ {result.deleted_count} estudiantes eliminados correctamente")
        print(f"   La base de datos está limpia y lista para cargar tus 503 estudiantes desde Excel.")
    else:
        print(f"\n❌ Operación cancelada. No se eliminó ningún estudiante.")
    
    client.close()


async def delete_students_except_from_excel():
    """
    Eliminar solo estudiantes que NO están en el Excel del usuario
    (Esto requiere que agregues los nombres del Excel completo)
    """
    
    # Lista de nombres CORRECTOS del Excel (debes completar esta lista con los 503)
    excel_students = {
        "JOSUE DAVID BLANCO MARTINEZ",
        "MAYLI ALEXANDRA BORRERO UTRIA",
        "YIRBELIN SOFIA BORRERO PALACIO",
        "BRIAN DE JESUS CASTILLO PIZARRO",
        # ... Agregar los 503 nombres aquí
    }
    
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DB_NAME', 'gaa_eduportal')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"\n🔌 Conectado a MongoDB: {db_name}")
    print(f"⚠️  NOTA: Esta opción solo funciona si has agregado los 503 nombres al script")
    print(f"   Por ahora solo hay {len(excel_students)} nombres en la lista")
    
    confirm = input("\n¿Continuar? (S/N): ")
    
    if confirm.strip().upper() != "S":
        print("❌ Operación cancelada")
        client.close()
        return
    
    # Obtener todos los estudiantes
    all_students = await db.students.find({}).to_list(None)
    
    to_delete = []
    to_keep = []
    
    for student in all_students:
        name = student.get('name', '').upper().strip()
        if name not in excel_students:
            to_delete.append(student['_id'])
        else:
            to_keep.append(name)
    
    print(f"\n📊 Análisis:")
    print(f"   ✅ Estudiantes a mantener (en Excel): {len(to_keep)}")
    print(f"   🗑️  Estudiantes a eliminar (NO en Excel): {len(to_delete)}")
    
    if len(to_delete) > 0:
        confirm2 = input(f"\n¿Eliminar {len(to_delete)} estudiantes? (S/N): ")
        
        if confirm2.strip().upper() == "S":
            result = await db.students.delete_many({"_id": {"$in": to_delete}})
            print(f"\n✅ {result.deleted_count} estudiantes eliminados")
        else:
            print("❌ Operación cancelada")
    else:
        print("\n✅ No hay estudiantes para eliminar")
    
    client.close()


async def main():
    print("=" * 70)
    print("  HERRAMIENTA DE LIMPIEZA DE ESTUDIANTES DE PRUEBA")
    print("=" * 70)
    
    # Mostrar estado actual
    await show_current_students()
    
    print("\n" + "=" * 70)
    print("\n📋 OPCIONES:")
    print("\n   1. Ver estudiantes actuales (ya mostrado arriba)")
    print("   2. 🗑️  ELIMINAR TODOS los estudiantes (empezar limpio)")
    print("   3. 🔍 Eliminar solo estudiantes que NO están en tu Excel")
    print("   4. ❌ Salir sin hacer cambios")
    
    print("\n" + "=" * 70)
    choice = input("\n👉 Selecciona una opción (1-4): ").strip()
    
    if choice == "1":
        print("\n✅ Ya viste los estudiantes actuales arriba")
    elif choice == "2":
        await delete_all_students()
    elif choice == "3":
        print("\n⚠️  Esta opción requiere que agregues los 503 nombres del Excel al script")
        print("   Por ahora, usa la opción 2 para eliminar todo y luego carga el Excel")
        # await delete_students_except_from_excel()
    elif choice == "4":
        print("\n👋 Saliendo sin hacer cambios...")
    else:
        print("\n❌ Opción inválida")
    
    print("\n" + "=" * 70)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n❌ Operación cancelada por el usuario")
    except Exception as e:
        print(f"\n❌ Error: {e}")
