"""
Script para corregir los grados de estudiantes que fueron creados con grados incorrectos
durante las pruebas, basándose en el archivo Excel original del usuario.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# Datos correctos del Excel del usuario (503 estudiantes)
# Estructura: {"NOMBRE COMPLETO": "GRADO"}
CORRECT_GRADES = {
    # Grado 0° (32 estudiantes)
    "JOSUE DAVID BLANCO MARTINEZ": "0°",
    "MAYLI ALEXANDRA BORRERO UTRIA": "0°",
    "YIRBELIN SOFIA BORRERO PALACIO": "0°",
    "BRIAN DE JESUS CASTILLO PIZARRO": "0°",
    "CHARLOTTE MARIA CARREÑO MILLAN": "0°",
    "LUCIANA CERVERA GONZALEZ": "0°",
    "ADRIAN DAVID CORREDOR RODELO": "0°",
    "VALERY SOFIA DE LA HOZ BOLIVAR": "0°",
    "ANGEL FABIAN ESCALONA MEDINA": "0°",
    "ANDRES CAMILO ESPITIA BELTRAN": "0°",
    "CARLOS JUNIOR FRILE ESCORCIA": "0°",
    "BAIRON JOSE HENRY CASTRO": "0°",
    "SALOMON DAVID HERRERA CASTRO": "0°",
    "LUCIA ISABEL JIMENEZ MEDINA": "0°",
    "JENNIRETH VANESSA LOPEZ FONSECA": "0°",
    "HELLEN LUCIA MACIAS JIMENEZ": "0°",
    "ANTONELLA MANGA ALVAREZ": "0°",
    "JAIDER JOSEPH MARTINEZ MONTERO": "0°",
    "MAILY VANESA MARTELO NOVOA": "0°",
    "SAMUEL ANDRES MOLINA RODRIGUEZ": "0°",
    "LUIS ALFONSO NAVARRO OLIVARES": "0°",
    "BRAYAN JOSE NUÑEZ ANGULO": "0°",
    "DANIELA PAOLA PATERNINA TORRES": "0°",
    "JUAN CAMILO QUESSEP MIRANDA": "0°",
    "DANNA LUCIA RANGEL MOLINA": "0°",
    "LUIS DAVID RODELO BOHORQUEZ": "0°",
    "SOFIA ANDREA RUIZ PACHECO": "0°",
    "THIAGO ANTONIO SIERRA CEBALLOS": "0°",
    "MARIA FERNANDA SOLANO JIMENEZ": "0°",
    "SHARITH DANIELA SUAREZ TORRES": "0°",
    "ESTEFANIA VALENTINA VALEGA RANGEL": "0°",
    "SEBASTIAN VILLAREAL ECHEVERRIA": "0°",
    
    # Si necesitas más estudiantes, agregarlos aquí...
    # Por ahora solo pongo algunos ejemplos para mostrar el formato
}

# Mapeo de niveles según grado
LEVELS = {
    '0°': 'PREESCOLAR',
    'Transición': 'PREESCOLAR',
    '1°': 'BÁSICA PRIMARIA',
    '2°': 'BÁSICA PRIMARIA',
    '3°': 'BÁSICA PRIMARIA',
    '4°': 'BÁSICA PRIMARIA',
    '5°': 'BÁSICA PRIMARIA',
    '6°': 'BÁSICA SECUNDARIA',
    '7°': 'BÁSICA SECUNDARIA',
    '8°': 'BÁSICA SECUNDARIA',
    '9°': 'BÁSICA SECUNDARIA',
    '10°': 'MEDIA VOCACIONAL',
    '11°': 'MEDIA VOCACIONAL'
}


async def fix_student_grades():
    """Corregir los grados de estudiantes en la base de datos"""
    
    # Conectar a MongoDB
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DB_NAME', 'gaa_eduportal')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"🔌 Conectado a MongoDB: {db_name}")
    
    # Obtener todos los estudiantes
    students_cursor = db.students.find({"is_active": True})
    students = await students_cursor.to_list(length=None)
    
    print(f"📊 Total de estudiantes en BD: {len(students)}")
    
    updated_count = 0
    not_found_count = 0
    already_correct = 0
    
    # Actualizar cada estudiante
    for student in students:
        student_name = student.get('name', '').upper().strip()
        current_grade = student.get('grade', '')
        
        if student_name in CORRECT_GRADES:
            correct_grade = CORRECT_GRADES[student_name]
            
            if current_grade != correct_grade:
                # Actualizar grado y nivel
                correct_level = LEVELS.get(correct_grade, 'BÁSICA PRIMARIA')
                
                result = await db.students.update_one(
                    {"_id": student["_id"]},
                    {"$set": {
                        "grade": correct_grade,
                        "level": correct_level
                    }}
                )
                
                if result.modified_count > 0:
                    print(f"✅ {student_name}: {current_grade} → {correct_grade}")
                    updated_count += 1
            else:
                already_correct += 1
        else:
            # Estudiante no está en el Excel del usuario
            not_found_count += 1
            print(f"⚠️  {student_name}: No encontrado en Excel (grado actual: {current_grade})")
    
    print(f"\n📈 RESUMEN:")
    print(f"   ✅ Actualizados: {updated_count}")
    print(f"   ✔️  Ya correctos: {already_correct}")
    print(f"   ⚠️  No encontrados en Excel: {not_found_count}")
    print(f"   📊 Total procesados: {len(students)}")
    
    client.close()
    print("\n🎉 Proceso completado")


async def delete_test_students():
    """
    OPCIONAL: Eliminar TODOS los estudiantes de prueba actuales
    para empezar limpio con los datos del Excel
    """
    
    mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.getenv('DB_NAME', 'gaa_eduportal')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"🔌 Conectado a MongoDB: {db_name}")
    
    # Contar estudiantes actuales
    count = await db.students.count_documents({})
    print(f"⚠️  ADVERTENCIA: Se eliminarán {count} estudiantes")
    
    confirm = input("¿Estás seguro? Escribe 'SI' para confirmar: ")
    
    if confirm.strip().upper() == "SI":
        result = await db.students.delete_many({})
        print(f"🗑️  {result.deleted_count} estudiantes eliminados")
    else:
        print("❌ Operación cancelada")
    
    client.close()


if __name__ == "__main__":
    print("=" * 60)
    print("SCRIPT DE CORRECCIÓN DE GRADOS DE ESTUDIANTES")
    print("=" * 60)
    print()
    print("Opciones:")
    print("1. Corregir grados de estudiantes existentes")
    print("2. ELIMINAR TODOS los estudiantes (empezar limpio)")
    print()
    
    choice = input("Selecciona una opción (1 o 2): ").strip()
    
    if choice == "1":
        asyncio.run(fix_student_grades())
    elif choice == "2":
        asyncio.run(delete_test_students())
    else:
        print("❌ Opción inválida")
