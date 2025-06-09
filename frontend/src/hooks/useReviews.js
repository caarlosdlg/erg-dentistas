import { useState, useEffect, useCallback } from 'react';
import reviewService from '../services/reviewService';

/**
 * Custom hook for managing reviews
 * Provides review data, CRUD operations, and state management
 */
export const useReviews = (options = {}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false
  });

  const {
    contentType,
    objectId,
    autoFetch = true,
    pageSize = 10,
    initialPage = 1,
    ordering = '-created_at'
  } = options;

  const fetchReviews = useCallback(async (page = initialPage, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reviewService.getReviews({
        contentType,
        objectId,
        page,
        pageSize,
        ordering,
        ...filters
      });
      
      setReviews(response.results || []);
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(response.count / pageSize),
        totalItems: response.count,
        hasNext: !!response.next,
        hasPrevious: !!response.previous
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [contentType, objectId, pageSize, ordering, initialPage]);

  // Auto-fetch reviews on mount
  useEffect(() => {
    if (autoFetch) {
      fetchReviews();
    }
  }, [autoFetch, fetchReviews]);

  const createReview = async (reviewData) => {
    try {
      setError(null);
      const newReview = await reviewService.createReview(reviewData);
      
      // Add the new review to the beginning of the list
      setReviews(prev => [newReview, ...prev]);
      
      return newReview;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateReview = async (reviewId, reviewData) => {
    try {
      setError(null);
      const updatedReview = await reviewService.updateReview(reviewId, reviewData);
      
      // Update the review in the list
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId ? updatedReview : review
        )
      );
      
      return updatedReview;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      setError(null);
      await reviewService.deleteReview(reviewId);
      
      // Remove the review from the list
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loadNextPage = () => {
    if (pagination.hasNext) {
      fetchReviews(pagination.currentPage + 1);
    }
  };

  const loadPreviousPage = () => {
    if (pagination.hasPrevious) {
      fetchReviews(pagination.currentPage - 1);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchReviews(page);
    }
  };

  return {
    reviews,
    loading,
    error,
    pagination,
    fetchReviews,
    createReview,
    updateReview,
    deleteReview,
    loadNextPage,
    loadPreviousPage,
    goToPage
  };
};

/**
 * Hook for managing a single review
 */
export const useReview = (reviewId) => {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!reviewId) {
      setReview(null);
      setLoading(false);
      return;
    }

    fetchReview();
  }, [reviewId]);

  const fetchReview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const reviewData = await reviewService.getReviewById(reviewId);
      setReview(reviewData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    review,
    loading,
    error,
    refetch: fetchReview
  };
};

/**
 * Hook for review statistics
 */
export const useReviewStats = (contentType, objectId) => {
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!contentType || !objectId) {
      setStats({
        total: 0,
        average: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
      setLoading(false);
      return;
    }

    fetchStats();
  }, [contentType, objectId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statsData = await reviewService.getReviewStats(contentType, objectId);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};

/**
 * Hook for managing review media (images, videos)
 */
export const useReviewMedia = (reviewId) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (reviewId) {
      fetchMedia();
    }
  }, [reviewId]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const mediaData = await reviewService.getReviewMedia(reviewId);
      setMedia(mediaData.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadMedia = async (file) => {
    try {
      setError(null);
      const uploadedMedia = await reviewService.uploadReviewMedia(reviewId, file);
      
      // Add the new media to the list
      setMedia(prev => [...prev, uploadedMedia]);
      
      return uploadedMedia;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    media,
    loading,
    error,
    uploadMedia,
    refetch: fetchMedia
  };
};

/**
 * Hook for creating and managing review reports
 */
export const useReviewReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reportReview = async (reviewId, reportData) => {
    try {
      setLoading(true);
      setError(null);
      
      const report = await reviewService.reportReview(reviewId, reportData);
      return report;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    reportReview,
    loading,
    error
  };
};
