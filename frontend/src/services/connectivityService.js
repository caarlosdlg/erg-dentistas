/**
 * API Connectivity Service
 * Tests and monitors API connectivity status
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ConnectivityService {
  /**
   * Test basic API connectivity
   */
  async testConnection() {
    try {
      console.log('🔍 Testing categories API connection...');
      const response = await fetch(`${API_BASE_URL}/api/categories/public/tree/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      
      const result = {
        status: response.ok ? 'connected' : 'error',
        statusCode: response.status,
        message: response.ok ? 'API connected successfully' : `API error: ${response.status}`,
      };
      
      console.log('✅ Categories API result:', result);
      return result;
    } catch (error) {
      const result = {
        status: 'disconnected',
        statusCode: 0,
        message: `Connection failed: ${error.message}`,
        error: error.name,
      };
      
      console.error('❌ Categories API error:', result);
      return result;
    }
  }

  /**
   * Test reviews API connectivity
   */
  async testReviewsConnection() {
    try {
      console.log('🔍 Testing reviews API connection...');
      const response = await fetch(`${API_BASE_URL}/api/reviews/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      
      const result = {
        status: response.ok ? 'connected' : 'error',
        statusCode: response.status,
        message: response.ok ? 'Reviews API connected successfully' : `Reviews API error: ${response.status}`,
      };
      
      console.log('✅ Reviews API result:', result);
      return result;
    } catch (error) {
      const result = {
        status: 'disconnected',
        statusCode: 0,
        message: `Reviews connection failed: ${error.message}`,
        error: error.name,
      };
      
      console.error('❌ Reviews API error:', result);
      return result;
    }
  }

  /**
   * Get mock data for testing when API is unavailable
   */
  getMockCategoryData() {
    return [
      {
        id: 1,
        name: 'Odontología General',
        description: 'Tratamientos básicos de odontología',
        slug: 'odontologia-general',
        icon: 'tooth',
        level: 0,
        children: [
          {
            id: 2,
            name: 'Limpiezas',
            description: 'Limpiezas dentales profesionales',
            slug: 'limpiezas',
            icon: 'cleaning',
            level: 1,
            children: []
          },
          {
            id: 3,
            name: 'Obturaciones',
            description: 'Empastes y obturaciones',
            slug: 'obturaciones',
            icon: 'filling',
            level: 1,
            children: []
          }
        ]
      },
      {
        id: 4,
        name: 'Ortodoncia',
        description: 'Tratamientos de ortodoncia y alineación',
        slug: 'ortodoncia',
        icon: 'braces',
        level: 0,
        children: [
          {
            id: 5,
            name: 'Brackets',
            description: 'Brackets metálicos y estéticos',
            slug: 'brackets',
            icon: 'bracket',
            level: 1,
            children: []
          }
        ]
      }
    ];
  }

  /**
   * Get mock review data for testing
   */
  getMockReviewData() {
    return {
      results: [
        {
          id: 1,
          user: {
            username: 'usuario_demo',
            first_name: 'Usuario',
            last_name: 'Demo'
          },
          treatment: {
            id: 1,
            name: 'Limpieza Dental',
            category: 'Odontología General'
          },
          rating: 5,
          title: 'Excelente servicio',
          content: 'Muy satisfecho con el tratamiento recibido. El personal es muy profesional.',
          created_at: '2024-06-08T12:00:00Z',
          updated_at: '2024-06-08T12:00:00Z',
          is_verified: true,
          helpful_count: 5,
          media: []
        },
        {
          id: 2,
          user: {
            username: 'paciente_test',
            first_name: 'Paciente',
            last_name: 'Test'
          },
          treatment: {
            id: 2,
            name: 'Ortodoncia',
            category: 'Ortodoncia'
          },
          rating: 4,
          title: 'Buen resultado',
          content: 'El tratamiento de ortodoncia fue efectivo, aunque tomó más tiempo del esperado.',
          created_at: '2024-06-07T15:30:00Z',
          updated_at: '2024-06-07T15:30:00Z',
          is_verified: false,
          helpful_count: 3,
          media: []
        }
      ],
      count: 2,
      next: null,
      previous: null
    };
  }

  /**
   * Get mock statistics data
   */
  getMockStatsData() {
    return {
      total_reviews: 2,
      average_rating: 4.5,
      rating_distribution: {
        5: 1,
        4: 1,
        3: 0,
        2: 0,
        1: 0
      },
      recent_reviews_count: 2,
      verified_reviews_count: 1
    };
  }
}

export default new ConnectivityService();
