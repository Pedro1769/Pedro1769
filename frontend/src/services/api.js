import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Configurar axios
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gaa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gaa_token');
      localStorage.removeItem('gaa_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};

// Servicios de estudiantes
export const studentService = {
  getAll: async (params = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
  },
  
  getStudents: async (params = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
  },
  
  getStudent: async (studentId) => {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
  },
  
  createStudent: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },
  
  updateStudent: async (studentId, studentData) => {
    const response = await api.put(`/students/${studentId}`, studentData);
    return response.data;
  },
  
  deleteStudent: async (studentId) => {
    const response = await api.delete(`/students/${studentId}`);
    return response.data;
  },
  
  createBulkStudents: async (studentsData) => {
    const response = await api.post('/students/bulk', studentsData);
    return response.data;
  },
  
  deleteBulkStudents: async (studentIds) => {
    const response = await api.delete('/students/bulk/delete', { data: studentIds });
    return response.data;
  },
  
  getStudentsByTeacher: async (teacherId) => {
    const response = await api.get(`/students/by-teacher/${teacherId}`);
    return response.data;
  },
  
  getStudentsByGrade: async (grade) => {
    const response = await api.get(`/students/by-grade/${grade}`);
    return response.data;
  }
};

// Servicios de notas
export const gradeService = {
  getStudentGrades: async (studentId, period = null) => {
    const params = period ? { period } : {};
    const response = await api.get(`/grades/student/${studentId}`, { params });
    return response.data;
  },
  
  assignGrade: async (gradeData) => {
    const response = await api.post('/grades', gradeData);
    return response.data;
  },
  
  updateGrade: async (gradeId, gradeData) => {
    const response = await api.put(`/grades/${gradeId}`, gradeData);
    return response.data;
  },
  
  deleteGrade: async (gradeId) => {
    const response = await api.delete(`/grades/${gradeId}`);
    return response.data;
  },
  
  getConsolidatedGrades: async (periods, grade = null) => {
    const params = { periods, grade };
    const response = await api.get('/grades/consolidated', { params });
    return response.data;
  }
};

// Servicios de convivencia
export const convivenciaService = {
  getStudentObservations: async (studentId, period = null) => {
    const params = period ? { period } : {};
    const response = await api.get(`/convivencia/student/${studentId}`, { params });
    return response.data;
  },
  
  createObservation: async (observationData) => {
    const response = await api.post('/convivencia', observationData);
    return response.data;
  },
  
  updateObservation: async (observationId, observationData) => {
    const response = await api.put(`/convivencia/${observationId}`, observationData);
    return response.data;
  },
  
  deleteObservation: async (observationId) => {
    const response = await api.delete(`/convivencia/${observationId}`);
    return response.data;
  },
  
  getConvivenciaReports: async (period, grade = null, observationType = null) => {
    const params = { grade, observation_type: observationType };
    const response = await api.get(`/convivencia/reports/period/${period}`, { params });
    return response.data;
  },
  
  getSpecialCases: async () => {
    const response = await api.get('/convivencia/students/special-cases');
    return response.data;
  }
};

// Servicios de proyectos
export const projectService = {
  getProjects: async (params = {}) => {
    const response = await api.get('/projects', { params });
    return response.data;
  },
  
  getMyProjects: async () => {
    const response = await api.get('/projects/my-projects');
    return response.data;
  },
  
  getProject: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },
  
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },
  
  updateProject: async (projectId, projectData) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },
  
  deleteProject: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },
  
  uploadFile: async (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/projects/${projectId}/upload-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Servicios de boletines
export const bulletinService = {
  getStudentBulletin: async (studentId, period) => {
    const response = await api.get(`/bulletins/student/${studentId}/${period}`);
    return response.data;
  },
  
  generateBulletinCode: async (studentId, period) => {
    const response = await api.post(`/bulletins/generate-code/${studentId}/${period}`);
    return response.data;
  },
  
  downloadBulletinWithCode: async (code) => {
    const response = await api.get(`/bulletins/download/${code}`, {
      responseType: 'blob'
    });
    return response;
  },
  
  getStudentCodes: async (studentId) => {
    const response = await api.get(`/bulletins/codes/student/${studentId}`);
    return response.data;
  }
};

// Servicios de administración
export const adminService = {
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },
  
  toggleUserStatus: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/toggle-status`);
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
  
  getStatistics: async () => {
    const response = await api.get('/admin/statistics');
    return response.data;
  },
  
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },
  
  updateSetting: async (settingKey, settingValue, description = null) => {
    const response = await api.put(`/admin/settings/${settingKey}`, settingValue, {
      params: { description }
    });
    return response.data;
  },
  
  bulkDeleteStudents: async (studentIds) => {
    const response = await api.post('/admin/bulk-operations/students/delete', studentIds);
    return response.data;
  },
  
  exportSystemData: async () => {
    const response = await api.post('/admin/backup/export');
    return response.data;
  }
};

export default api;