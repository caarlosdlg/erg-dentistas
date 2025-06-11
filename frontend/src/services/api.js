/**
 * API Service for DentalERP
 * Handles all API communication with the backend
 */

const API_BASE_URL = 'http://localhost:8000/api';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method for making requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get auth token from localStorage
    const tokens = localStorage.getItem('dental_erp_tokens');
    const authToken = tokens ? JSON.parse(tokens).access : null;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized - try to refresh token or re-authenticate
      if (response.status === 401) {
        console.log('Token inválido o expirado, intentando re-autenticar...');
        
        // Try to get new token using GitHub auth
        try {
          const authResponse = await fetch('http://localhost:8000/api/auth/github/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: 'dev_test_code' })
          });

          if (authResponse.ok) {
            const authData = await authResponse.json();
            localStorage.setItem('dental_erp_user', JSON.stringify(authData.user));
            localStorage.setItem('dental_erp_tokens', JSON.stringify(authData.tokens));
            
            // Retry the original request with new token
            const newConfig = {
              ...config,
              headers: {
                ...config.headers,
                'Authorization': `Bearer ${authData.tokens.access}`
              }
            };
            
            const retryResponse = await fetch(url, newConfig);
            if (retryResponse.ok) {
              return await retryResponse.json();
            }
          }
        } catch (authError) {
          console.error('Error re-autenticando:', authError);
        }
        
        throw new Error('API Error: 401 Unauthorized');
      }
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Patients API
  async getPatients(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/pacientes/${queryString ? `?${queryString}` : ''}`);
  }

  async getPatient(id) {
    return this.request(`/pacientes/${id}/`);
  }

  async createPatient(patientData) {
    return this.request('/pacientes/', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  async updatePatient(id, patientData) {
    return this.request(`/pacientes/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(patientData),
    });
  }

  async deletePatient(id) {
    return this.request(`/pacientes/${id}/`, {
      method: 'DELETE',
    });
  }

  async togglePatientActive(id) {
    return this.request(`/pacientes/${id}/toggle_active/`, {
      method: 'POST',
    });
  }

  async getPatientMedicalHistory(id) {
    return this.request(`/pacientes/${id}/medical_history/`);
  }

  async getPatientStats() {
    return this.request('/pacientes/stats/');
  }

  async searchPatients(query, filters = {}) {
    const params = { q: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/pacientes/search/?${queryString}`);
  }

  // Endpoint optimizado para dropdown de pacientes
  async getPatientsForDropdown() {
    return this.request('/pacientes/dropdown/');
  }

  // Appointments API
  async getAppointments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/citas/${queryString ? `?${queryString}` : ''}`);
  }

  async getAppointment(id) {
    return this.request(`/citas/${id}/`);
  }

  // Helper para validar UUID
  isValidUUID(uuid) {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(uuid);
  }

  // Helper para validar los datos de la cita
  validateAppointmentData(appointmentData) {
    // Validar paciente UUID
    if (!this.isValidUUID(appointmentData.paciente)) {
      throw new Error('ID de paciente inválido');
    }

    // Validar dentista UUID
    if (!this.isValidUUID(appointmentData.dentista)) {
      throw new Error('ID de dentista inválido');
    }

    // Validar tratamiento UUID
    if (appointmentData.tratamiento && !this.isValidUUID(appointmentData.tratamiento)) {
      throw new Error('ID de tratamiento inválido');
    }

    // Validar fecha y hora
    if (!appointmentData.fecha_hora) {
      throw new Error('Fecha y hora son requeridas');
    }

    return true;
  }

  async createAppointment(appointmentData) {
    try {
      // Validar los datos antes de enviar
      this.validateAppointmentData(appointmentData);

      return await this.request('/citas/', {
        method: 'POST',
        body: JSON.stringify(appointmentData)
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async createAppointmentWithEmail(appointmentData) {
    try {
      // Validar los datos antes de enviar
      this.validateAppointmentData(appointmentData);

      // Agregar flag para envío automático de email
      const dataWithEmail = {
        ...appointmentData,
        enviar_email_automatico: true
      };

      return await this.request('/citas/', {
        method: 'POST',
        body: JSON.stringify(dataWithEmail)
      });
    } catch (error) {
      console.error('Error creating appointment with email:', error);
      throw error;
    }
  }

  async updateAppointment(id, appointmentData) {
    return this.request(`/citas/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(appointmentData),
    });
  }

  async cancelAppointment(id, reason) {
    return this.request(`/citas/${id}/cancel/`, {
      method: 'POST',
      body: JSON.stringify({ motivo: reason }),
    });
  }

  async confirmAppointment(id) {
    return this.request(`/citas/${id}/confirm/`, {
      method: 'POST',
    });
  }

  async sendConfirmationEmail(id) {
    return this.request(`/citas/${id}/send_confirmation_email/`, {
      method: 'POST',
    });
  }

  async getAppointmentsByDate(date) {
    return this.request(`/citas/?fecha=${date}`);
  }

  // Treatments API
  async getTreatments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/tratamientos/${queryString ? `?${queryString}` : ''}`);
  }

  async getTreatment(id) {
    return this.request(`/tratamientos/${id}/`);
  }

  async createTreatment(treatmentData) {
    return this.request('/tratamientos/', {
      method: 'POST',
      body: JSON.stringify(treatmentData),
    });
  }

  async updateTreatment(id, treatmentData) {
    return this.request(`/tratamientos/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(treatmentData),
    });
  }

  async getTreatmentCategories() {
    return this.request('/tratamientos/categorias/');
  }

  // Inventory API
  async getInventoryItems(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/inventario/${queryString ? `?${queryString}` : ''}`);
  }

  async getInventoryItem(id) {
    return this.request(`/inventario/${id}/`);
  }

  async createInventoryItem(itemData) {
    return this.request('/inventario/', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateInventoryItem(id, itemData) {
    return this.request(`/inventario/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(itemData),
    });
  }

  async createInventoryTransaction(itemId, transactionData) {
    return this.request(`/inventario/${itemId}/transaction/`, {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async getInventoryStats() {
    return this.request('/inventario/stats/');
  }

  async getLowStockItems() {
    return this.request('/inventario/low-stock/');
  }

  // Financial Reports API
  async getFinancialStats(period, params = {}) {
    const queryString = new URLSearchParams({ period, ...params }).toString();
    return this.request(`/reportes/financieros/stats/?${queryString}`);
  }

  async getIncomeByPeriod(startDate, endDate) {
    return this.request(`/reportes/ingresos/?start_date=${startDate}&end_date=${endDate}`);
  }

  async getExpensesByPeriod(startDate, endDate) {
    return this.request(`/reportes/gastos/?start_date=${startDate}&end_date=${endDate}`);
  }

  async getTreatmentProfitability() {
    return this.request('/reportes/tratamientos/rentabilidad/');
  }

  async getPatientMetrics() {
    return this.request('/reportes/pacientes/metricas/');
  }

  // Categories API (hierarchical)
  async getCategories(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/categorias/${queryString ? `?${queryString}` : ''}`);
  }

  async getCategoryTree() {
    return this.request('/categorias/tree/');
  }

  async createCategory(categoryData) {
    return this.request('/categorias/', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id, categoryData) {
    return this.request(`/categorias/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData),
    });
  }

  async moveCategory(id, newParentId, position) {
    return this.request(`/categorias/${id}/move/`, {
      method: 'POST',
      body: JSON.stringify({ 
        parent_id: newParentId, 
        position: position 
      }),
    });
  }

  // Search API
  async globalSearch(query, filters = {}) {
    const params = { q: query, ...filters };
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/search/global/?${queryString}`);
  }

  async searchCategories(query) {
    return this.request(`/search/categorias/?q=${encodeURIComponent(query)}`);
  }

  async searchTreatments(query) {
    return this.request(`/search/tratamientos/?q=${encodeURIComponent(query)}`);
  }

  // Reviews API
  async getReviews(contentType, objectId) {
    return this.request(`/reviews/?content_type=${contentType}&object_id=${objectId}`);
  }

  async createReview(reviewData) {
    return this.request('/reviews/', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(id, reviewData) {
    return this.request(`/reviews/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(reviewData),
    });
  }

  async markReviewHelpful(id) {
    return this.request(`/reviews/${id}/helpful/`, {
      method: 'POST',
    });
  }

  async reportReview(id, reason) {
    return this.request(`/reviews/${id}/report/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Authentication API
  async login(credentials) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout/', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/user/');
  }

  async refreshToken() {
    return this.request('/auth/refresh/', {
      method: 'POST',
    });
  }

  // File upload helper
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  // Image optimization
  async uploadAndOptimizeImage(file, options = {}) {
    return this.uploadFile('/imagenes/upload/', file, options);
  }

  // Bulk operations
  async bulkCreatePatients(patientsData) {
    return this.request('/pacientes/bulk-create/', {
      method: 'POST',
      body: JSON.stringify({ patients: patientsData }),
    });
  }

  async bulkUpdateInventory(updates) {
    return this.request('/inventario/bulk-update/', {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }

  // Export/Import
  async exportData(dataType, format = 'xlsx', filters = {}) {
    const params = { format, ...filters };
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/export/${dataType}/?${queryString}`);
    return response.blob();
  }

  async importData(dataType, file) {
    return this.uploadFile(`/import/${dataType}/`, file);
  }

  // Dentists API
  async getDentists(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/dentistas/${queryString ? `?${queryString}` : ''}`);
  }
}

// Create and export a singleton instance
const apiService = new APIService();
export default apiService;

// Also export the class for testing or multiple instances
export { APIService };
