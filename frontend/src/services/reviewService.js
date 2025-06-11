/**
 * API Service for Reviews
 * Handles all review-related API calls to the Django backend
 */

import connectivityService from './connectivityService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ReviewService {
  /**
   * Get reviews with filtering and pagination
   */
  async getReviews(options = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filtering parameters
      if (options.contentType) params.append('content_type', options.contentType);
      if (options.objectId) params.append('object_id', options.objectId);
      if (options.rating) params.append('rating', options.rating);
      if (options.status) params.append('status', options.status);
      if (options.user) params.append('user', options.user);
      
      // Add pagination parameters
      if (options.page) params.append('page', options.page);
      if (options.pageSize) params.append('page_size', options.pageSize);
      
      // Add ordering
      if (options.ordering) params.append('ordering', options.ordering);
      
      const response = await fetch(`${API_BASE_URL}/api/reviews/?${params}`, {
        timeout: 5000,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn('Reviews API not available, using mock data:', error.message);
      return connectivityService.getMockReviewData();
    }
  }

  /**
   * Get a specific review by ID
   */
  async getReviewById(reviewId) {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/api/reviews/${reviewId}/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching review details:', error);
      throw error;
    }
  }

  /**
   * Create a new review
   */
  async createReview(reviewData) {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/api/reviews/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In production, add authentication headers here
        },
        body: JSON.stringify(reviewData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Update an existing review
   */
  async updateReview(reviewId, reviewData) {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/api/reviews/${reviewId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Note: In production, add authentication headers here
        },
        body: JSON.stringify(reviewData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId) {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/api/reviews/${reviewId}/`, {
        method: 'DELETE',
        headers: {
          // Note: In production, add authentication headers here
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a specific content object (e.g., treatment)
   */
  async getReviewsForObject(contentType, objectId, options = {}) {
    return this.getReviews({
      contentType,
      objectId,
      ...options
    });
  }

  /**
   * Get review statistics for a content object
   */
  async getReviewStats(contentType, objectId) {
    try {
      const reviews = await this.getReviewsForObject(contentType, objectId, { pageSize: 1000 });
      
      if (!reviews.results || reviews.results.length === 0) {
        return {
          total: 0,
          average: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }
      
      const ratings = reviews.results.map(review => review.rating);
      const total = ratings.length;
      const average = ratings.reduce((sum, rating) => sum + rating, 0) / total;
      
      const distribution = ratings.reduce((dist, rating) => {
        dist[rating] = (dist[rating] || 0) + 1;
        return dist;
      }, {});
      
      return {
        total,
        average: Math.round(average * 10) / 10,
        distribution
      };
    } catch (error) {
      console.error('Error calculating review stats:', error);
      throw error;
    }
  }

  /**
   * Upload media for a review
   */
  async uploadReviewMedia(reviewId, mediaFile) {
    try {
      const formData = new FormData();
      formData.append('file', mediaFile);
      
      const response = await fetch(`${API_BASE_URL}/reviews/api/reviews/${reviewId}/media/`, {
        method: 'POST',
        // Note: Don't set Content-Type header when using FormData
        headers: {
          // Note: In production, add authentication headers here
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading review media:', error);
      throw error;
    }
  }

  /**
   * Get media for a specific review
   */
  async getReviewMedia(reviewId) {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/api/reviews/${reviewId}/media/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching review media:', error);
      throw error;
    }
  }

  /**
   * Report a review
   */
  async reportReview(reviewId, reportData) {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/api/reports/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In production, add authentication headers here
        },
        body: JSON.stringify({
          review: reviewId,
          ...reportData
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error reporting review:', error);
      throw error;
    }
  }
}

export default new ReviewService();
