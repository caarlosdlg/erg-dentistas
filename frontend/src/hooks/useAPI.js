import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

/**
 * Custom hook for managing API state
 * Provides loading, error handling, and data management
 */
export const useAPI = (apiCall, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { 
    immediate = true, 
    onSuccess, 
    onError,
    transform 
  } = options;

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      let result = await apiCall(...args);
      
      if (transform) {
        result = transform(result);
      }
      
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      setError(err);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, transform, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute,
    setData
  };
};

/**
 * Hook for managing patients
 */
export const usePatients = (filters = {}) => {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPatients = useCallback(async (newFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedFilters = { ...filters, ...newFilters };
      const response = await apiService.getPatients(mergedFilters);
      
      setPatients(response.results || response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await apiService.getPatientStats();
      setStats(statsData);
      return statsData;
    } catch (err) {
      console.error('Failed to load patient stats:', err);
    }
  }, []);

  const createPatient = useCallback(async (patientData) => {
    try {
      const newPatient = await apiService.createPatient(patientData);
      setPatients(prev => [newPatient, ...prev]);
      loadStats(); // Refresh stats
      return newPatient;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [loadStats]);

  const updatePatient = useCallback(async (id, patientData) => {
    try {
      const updatedPatient = await apiService.updatePatient(id, patientData);
      setPatients(prev => 
        prev.map(patient => 
          patient.id === id ? updatedPatient : patient
        )
      );
      return updatedPatient;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const deletePatient = useCallback(async (id) => {
    try {
      await apiService.deletePatient(id);
      setPatients(prev => prev.filter(patient => patient.id !== id));
      loadStats(); // Refresh stats
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [loadStats]);

  const togglePatientActive = useCallback(async (id) => {
    try {
      const response = await apiService.togglePatientActive(id);
      setPatients(prev => 
        prev.map(patient => 
          patient.id === id ? response.paciente : patient
        )
      );
      return response;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const searchPatients = useCallback(async (query, searchFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.searchPatients(query, searchFilters);
      setPatients(response.results);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
    loadStats();
  }, [loadPatients, loadStats]);

  return {
    patients,
    stats,
    loading,
    error,
    loadPatients,
    createPatient,
    updatePatient,
    deletePatient,
    togglePatientActive,
    searchPatients,
    refreshStats: loadStats
  };
};

/**
 * Hook for managing appointments
 */
export const useAppointments = (filters = {}) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAppointments = useCallback(async (newFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedFilters = { ...filters, ...newFilters };
      const response = await apiService.getAppointments(mergedFilters);
      
      setAppointments(response.results || response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createAppointment = useCallback(async (appointmentData) => {
    try {
      const newAppointment = await apiService.createAppointment(appointmentData);
      setAppointments(prev => [newAppointment, ...prev]);
      return newAppointment;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const updateAppointment = useCallback(async (id, appointmentData) => {
    try {
      const updatedAppointment = await apiService.updateAppointment(id, appointmentData);
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === id ? updatedAppointment : appointment
        )
      );
      return updatedAppointment;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const cancelAppointment = useCallback(async (id, reason) => {
    try {
      const response = await apiService.cancelAppointment(id, reason);
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === id ? { ...appointment, estado: 'cancelada' } : appointment
        )
      );
      return response;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const confirmAppointment = useCallback(async (id) => {
    try {
      const response = await apiService.confirmAppointment(id);
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === id ? { ...appointment, estado: 'confirmada' } : appointment
        )
      );
      return response;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  return {
    appointments,
    loading,
    error,
    loadAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    confirmAppointment
  };
};

/**
 * Hook for managing inventory
 */
export const useInventory = (filters = {}) => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadItems = useCallback(async (newFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const mergedFilters = { ...filters, ...newFilters };
      const response = await apiService.getInventoryItems(mergedFilters);
      
      setItems(response.results || response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await apiService.getInventoryStats();
      setStats(statsData);
      return statsData;
    } catch (err) {
      console.error('Failed to load inventory stats:', err);
    }
  }, []);

  const createItem = useCallback(async (itemData) => {
    try {
      const newItem = await apiService.createInventoryItem(itemData);
      setItems(prev => [newItem, ...prev]);
      loadStats(); // Refresh stats
      return newItem;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [loadStats]);

  const updateItem = useCallback(async (id, itemData) => {
    try {
      const updatedItem = await apiService.updateInventoryItem(id, itemData);
      setItems(prev => 
        prev.map(item => 
          item.id === id ? updatedItem : item
        )
      );
      return updatedItem;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const createTransaction = useCallback(async (itemId, transactionData) => {
    try {
      const response = await apiService.createInventoryTransaction(itemId, transactionData);
      // Refresh the specific item or reload all items
      loadItems();
      loadStats();
      return response;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [loadItems, loadStats]);

  useEffect(() => {
    loadItems();
    loadStats();
  }, [loadItems, loadStats]);

  return {
    items,
    stats,
    loading,
    error,
    loadItems,
    createItem,
    updateItem,
    createTransaction,
    refreshStats: loadStats
  };
};

/**
 * Hook for financial reports
 */
export const useFinancialReports = () => {
  const [stats, setStats] = useState(null);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFinancialStats = useCallback(async (period, params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const statsData = await apiService.getFinancialStats(period, params);
      setStats(statsData);
      return statsData;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadIncomeData = useCallback(async (startDate, endDate) => {
    try {
      const incomeData = await apiService.getIncomeByPeriod(startDate, endDate);
      setIncome(incomeData);
      return incomeData;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const loadExpenseData = useCallback(async (startDate, endDate) => {
    try {
      const expenseData = await apiService.getExpensesByPeriod(startDate, endDate);
      setExpenses(expenseData);
      return expenseData;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  return {
    stats,
    income,
    expenses,
    loading,
    error,
    loadFinancialStats,
    loadIncomeData,
    loadExpenseData
  };
};

/**
 * Hook for global search
 */
export const useSearch = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const search = useCallback(async (searchQuery, filters = {}) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setQuery(searchQuery);
      
      const searchResults = await apiService.globalSearch(searchQuery, filters);
      setResults(searchResults);
      return searchResults;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setQuery('');
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    query,
    search,
    clearResults
  };
};
