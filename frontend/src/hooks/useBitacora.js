import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000';

export const useBitacora = (pacienteId = null) => {
  const [entradas, setEntradas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBitacora = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      // Add paciente filter if provided
      if (pacienteId) {
        queryParams.append('paciente', pacienteId);
      }
      
      // Add additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const url = `${API_BASE_URL}/api/bitacora-citas/?${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setEntradas(data.results || data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching bitácora:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEntrada = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bitacora-citas/${id}/`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      console.error('Error fetching entrada:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createEntrada = async (entradaData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bitacora-citas/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entradaData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error creating entry');
      }
      
      const newEntrada = await response.json();
      setEntradas(prev => [newEntrada, ...prev]);
      return newEntrada;
    } catch (err) {
      setError(err.message);
      console.error('Error creating entrada:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEntrada = async (id, entradaData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bitacora-citas/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entradaData),
      });
      
      if (!response.ok) {
        let errorMessage = 'Error updating entry';
        try {
          const errorData = await response.json();
          console.log('Backend error response:', errorData);
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'object') {
            // Handle field validation errors
            const fieldErrors = Object.entries(errorData)
              .map(([field, errors]) => {
                const errorArray = Array.isArray(errors) ? errors : [errors];
                return `${field}: ${errorArray.join(', ')}`;
              })
              .join('; ');
            errorMessage = fieldErrors || errorMessage;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const updatedEntrada = await response.json();
      setEntradas(prev => prev.map(e => e.id === id ? updatedEntrada : e));
      return updatedEntrada;
    } catch (err) {
      setError(err.message);
      console.error('Error updating entrada:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEntrada = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/bitacora-citas/${id}/`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      setEntradas(prev => prev.filter(e => e.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting entrada:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pacienteId) {
      fetchBitacora();
    }
  }, [pacienteId]);

  return {
    entradas,
    loading,
    error,
    fetchBitacora,
    getEntrada,
    createEntrada,
    updateEntrada,
    deleteEntrada,
    refetch: fetchBitacora
  };
};
