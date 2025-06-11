// Este archivo facilita las importaciones desde el directorio constants
// Ejemplo de uso: import { API_ENDPOINTS, APP_ROUTES } from './constants'

// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

// App Configuration
export const APP_NAME = 'Sistema Dental ERP';
export const APP_VERSION = '1.0.0';

// Routes
export const APP_ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  CATEGORIES: '/categories',
  TREATMENTS: '/treatments',
  PATIENTS: '/patients',
  LOGIN: '/login',
};

// API Endpoints
export const API_ENDPOINTS = {
  SEARCH: {
    GLOBAL: '/api/search/global/',
    CATEGORIES: '/api/search/categories/',
    TREATMENTS: '/api/search/tratamientos/',
  },
  CATEGORIES: {
    LIST: '/api/categories/',
    TREE: '/api/categories/public/tree/',
    STATS: '/api/categories/public/stats/',
  },
};

// Other constants
export const DEFAULT_PAGE_SIZE = 20;
export const SEARCH_MIN_LENGTH = 3;
