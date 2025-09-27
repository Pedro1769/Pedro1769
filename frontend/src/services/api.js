// API service para comunicación con el backend
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Usuarios
  static async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async getUsers() {
    return this.request('/users');
  }

  static async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  // Estudiantes
  static async createStudent(studentData) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  static async getStudents() {
    return this.request('/students');
  }

  static async getStudent(studentId) {
    return this.request(`/students/${studentId}`);
  }

  // Status check
  static async createStatusCheck(clientData) {
    return this.request('/status', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  static async getStatusChecks() {
    return this.request('/status');
  }
}

export default ApiService;