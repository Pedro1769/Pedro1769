# Contratos de API - Sistema de Gestión Escolar GAA

## Información General
- **Institución:** Gimnasio Americano del Atlántico
- **Coordinador:** Pedro Hurtado (pedro_12hurbe@hotmail.com, 3011968877)
- **Sistema:** Gestión académica integral con roles diferenciados

## Datos Mockeados en Frontend (mockData.js)

### Usuarios del Sistema
- **Administrador:** pedro.hurtado / gim123
- **Docente Primaria:** yocelyn.cabarcas / gim123 (Grado 2°)
- **Docente Bachillerato:** carolina.sierra / gim123 (Matemática/Geometría)
- **Coordinadora Convivencia:** coord.convivencia / gim123

### Estudiantes de Prueba
- ANTÓN ROSANÍA GABRIEL ESTEBAN (2°)
- MUÑOZ RADA ASHLEY SALOME (1°)
- GEOVANNY ERICK SALAS PÁEZ (11°)
- TALAIGUA PERIRAN DANNY MANUEL (3°)

### Estructura de Notas
- **4 Períodos:** I, II, III, IV
- **Escala:** 1.0 - 5.0
- **Desempeño:** SUPERIOR (4.6-5.0), ALTO (4.0-4.5), BÁSICO (3.0-3.9), BAJO (1.0-2.9)

## Contratos de API Backend

### 1. Autenticación
```
POST /api/auth/login
Body: { username: string, password: string }
Response: { success: boolean, user: UserObject, token?: string }

POST /api/auth/logout
Headers: { Authorization: Bearer <token> }
Response: { success: boolean }
```

### 2. Gestión de Usuarios
```
GET /api/users
GET /api/users/:id
POST /api/users (Crear usuario)
PUT /api/users/:id (Actualizar usuario)
DELETE /api/users/:id (Eliminar usuario)
```

### 3. Gestión de Estudiantes
```
GET /api/students
GET /api/students/by-teacher/:teacherId
GET /api/students/by-grade/:grade
POST /api/students (Crear estudiante)
POST /api/students/bulk (Carga masiva)
PUT /api/students/:id
DELETE /api/students/:id
DELETE /api/students/bulk (Eliminación masiva)
```

### 4. Gestión de Notas
```
GET /api/grades/:studentId
GET /api/grades/:studentId/:period
POST /api/grades (Asignar nota)
PUT /api/grades/:id (Actualizar nota)
GET /api/grades/consolidated/:periods (Consolidado académico)
```

### 5. Convivencia Escolar
```
GET /api/convivencia/students/:studentId
POST /api/convivencia/observation (Crear observación)
GET /api/convivencia/reports/:period
PUT /api/convivencia/:id (Actualizar observación)
```

### 6. Proyectos Institucionales
```
GET /api/projects
GET /api/projects/by-user/:userId
POST /api/projects (Subir proyecto)
PUT /api/projects/:id
DELETE /api/projects/:id
```

### 7. Boletines y Reportes
```
GET /api/bulletins/:studentId/:period
POST /api/bulletins/generate-code (Generar código único para padres)
GET /api/bulletins/download/:code (Descarga con código)
GET /api/reports/consolidated/:periods
```

### 8. Administración
```
GET /api/admin/permissions
PUT /api/admin/permissions/:type (Habilitar períodos/visualización)
GET /api/admin/statistics
POST /api/admin/bulk-operations
```

## Modelos de Base de Datos (MongoDB)

### User
```javascript
{
  _id: ObjectId,
  username: String,
  password: String (hashed),
  name: String,
  role: String,
  email: String,
  phone: String,
  grade?: String, // Solo docentes primaria
  grades?: [String], // Solo docentes bachillerato
  subjects?: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Student
```javascript
{
  _id: ObjectId,
  name: String,
  grade: String,
  level: String,
  teacherId: ObjectId,
  parentId?: ObjectId,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Grade
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  teacherId: ObjectId,
  subject: String,
  period: String,
  grade: Number,
  teacherNotes?: String,
  createdAt: Date,
  updatedAt: Date
}
```

### ConvivenciaObservation
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  teacherId: ObjectId,
  type: String,
  observation: String,
  period: String,
  followUp?: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Project
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  uploadedBy: ObjectId,
  targetGrades: [String],
  status: String,
  fileUrl?: String,
  createdAt: Date,
  updatedAt: Date
}
```

### BulletinCode
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  period: String,
  code: String,
  expiresAt: Date,
  isUsed: Boolean,
  createdAt: Date
}
```

## Integración Frontend-Backend

### 1. Reemplazar Mock Data
- Eliminar importaciones de `mockData.js` en components
- Reemplazar datos estáticos por llamadas a API
- Implementar manejo de estados de carga y error

### 2. Context de Auth
- Actualizar `AuthContext.js` para usar token JWT
- Implementar refresh token si es necesario
- Manejar expiración de sesión

### 3. Servicios API
- Crear `src/services/api.js` con axios configurado
- Interceptores para tokens y manejo de errores
- Servicios específicos por módulo

### 4. Estado Global
- Implementar Redux/Zustand si es necesario
- Manejo de cache para datos frecuentes
- Sincronización en tiempo real (optional)

## Funcionalidades Específicas por Rol

### Administrador (Pedro Hurtado)
- ✅ Consolidados académicos con filtros por períodos
- ✅ Gestión masiva de estudiantes (crear/eliminar lotes)
- ✅ Generación de códigos únicos para boletines
- ✅ Habilitación de períodos y permisos
- ✅ Visualización de todos los proyectos institucionales

### Docentes Primaria
- ✅ Gestión de estudiantes de su grado específico
- ✅ Asignación de notas en todas las materias
- ✅ Registro de observaciones de convivencia
- ✅ Seguimiento de acompañamiento familiar
- ✅ Gestión de proyectos pedagógicos

### Docentes Bachillerato
- ✅ Selección de grado para gestionar (6° a 11°)
- ✅ Asignación de notas en sus materias específicas
- ✅ Función de tutor de grupo
- ✅ Gestión de proyectos institucionales

### Coordinadora Convivencia
- ✅ Acceso a todos los estudiantes de la institución
- ✅ Filtros por grado y búsqueda de estudiantes
- ✅ Registro completo de observaciones de convivencia
- ✅ Generación de reportes especializados
- ✅ Gestión de proyectos de convivencia

## Tipos de Boletines (Según imágenes proporcionadas)

1. **Transición:** Formato especial preescolar
2. **Primaria (1° a 5°):** Todas las materias con docente único
3. **Bachillerato (6° a 10°):** Materias especializadas por docente
4. **Grado 11°:** Formato especial con énfasis vocacional

## Notas de Implementación

### Seguridad
- Validación de roles en cada endpoint
- Encriptación de contraseñas con bcrypt
- JWT con expiración
- Validación de permisos por funcionalidad

### Performance
- Paginación en listados de estudiantes
- Índices en MongoDB para consultas frecuentes
- Cache de consolidados académicos
- Lazy loading de componentes pesados

### Escalabilidad
- Separación por módulos en backend
- Middleware de validación
- Logs estructurados
- Manejo de archivos con límites de tamaño

Este sistema está **completamente funcional en frontend con mock data** y listo para integración backend siguiendo estos contratos.