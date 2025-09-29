// API Service para comunicación con el backend
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

class ApiService {
  
  // Métodos para usuarios
  async createUser(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear usuario: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en createUser:', error);
      throw error;
    }
  }

  async getUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error(`Error al obtener usuarios: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getUsers:', error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      if (!response.ok) {
        throw new Error(`Error al obtener usuario: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getUser:', error);
      throw error;
    }
  }

  // Métodos para estudiantes
  async createStudent(studentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear estudiante: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en createStudent:', error);
      throw error;
    }
  }

  async getStudents(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
      
      const url = queryParams.toString() 
        ? `${API_BASE_URL}/students?${queryParams}`
        : `${API_BASE_URL}/students`;
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al obtener estudiantes: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getStudents:', error);
      throw error;
    }
  }

  // Métodos para calificaciones
  async createGrade(gradeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/grades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradeData),
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear calificación: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en createGrade:', error);
      throw error;
    }
  }

  async getGrades(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
      
      const url = queryParams.toString() 
        ? `${API_BASE_URL}/grades?${queryParams}`
        : `${API_BASE_URL}/grades`;
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al obtener calificaciones: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getGrades:', error);
      throw error;
    }
  }

  // Métodos para observaciones
  async createObservation(observationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/observations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(observationData),
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear observación: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en createObservation:', error);
      throw error;
    }
  }

  async getObservations(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
      
      const url = queryParams.toString() 
        ? `${API_BASE_URL}/observations?${queryParams}`
        : `${API_BASE_URL}/observations`;
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al obtener observaciones: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getObservations:', error);
      throw error;
    }
  }

  // Métodos para notas de convivencia
  async createConvivenciaNote(noteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/convivencia-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear nota de convivencia: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en createConvivenciaNote:', error);
      throw error;
    }
  }

  async getConvivenciaNotes(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
      
      const url = queryParams.toString() 
        ? `${API_BASE_URL}/convivencia-notes?${queryParams}`
        : `${API_BASE_URL}/convivencia-notes`;
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al obtener notas de convivencia: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getConvivenciaNotes:', error);
      throw error;
    }
  }

  // Método de autenticación
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error(`Error en login: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Métodos para configuraciones administrativas
  async createAdminConfig(configData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData),
      });
      
      if (!response.ok) {
        throw new Error(`Error al crear configuración: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en createAdminConfig:', error);
      throw error;
    }
  }

  async getAdminConfig(configKey) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-config/${configKey}`);
      if (!response.ok) {
        throw new Error(`Error al obtener configuración: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getAdminConfig:', error);
      throw error;
    }
  }

  async getAllAdminConfigs() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-config`);
      if (!response.ok) {
        throw new Error(`Error al obtener configuraciones: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getAllAdminConfigs:', error);
      throw error;
    }
  }

  async getStudentPermissions(studentId, period = null) {
    try {
      const url = period 
        ? `${API_BASE_URL}/student-permissions/${studentId}?period=${period}`
        : `${API_BASE_URL}/student-permissions/${studentId}`;
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al obtener permisos: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en getStudentPermissions:', error);
      throw error;
    }
  }

  // Método para verificar conectividad del backend
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      if (!response.ok) {
        throw new Error(`Backend no disponible: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error en healthCheck:', error);
      throw error;
    }
  }
}

export default new ApiService();