import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000/api';

export const usePacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPacientes = async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const url = `${API_BASE_URL}/pacientes/?${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setPacientes(data.results || data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching pacientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPaciente = async (id) => {
    if (!id || id === 'undefined') {
      setError('ID de paciente inválido');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/pacientes/${id}/`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      console.error('Error fetching paciente:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createPaciente = async (pacienteData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending patient data:', pacienteData);
      
      const response = await fetch(`${API_BASE_URL}/pacientes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pacienteData),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || JSON.stringify(errorData) || 'Error creating patient');
      }
      
      const newPaciente = await response.json();
      setPacientes(prev => [newPaciente, ...prev]);
      return newPaciente;
    } catch (err) {
      setError(err.message);
      console.error('Error creating paciente:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePaciente = async (id, pacienteData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/pacientes/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pacienteData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error updating patient');
      }
      
      const updatedPaciente = await response.json();
      setPacientes(prev => prev.map(p => p.id === id ? updatedPaciente : p));
      return updatedPaciente;
    } catch (err) {
      setError(err.message);
      console.error('Error updating paciente:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleActivePaciente = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/pacientes/${id}/toggle_active/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const result = await response.json();
      setPacientes(prev => prev.map(p => 
        p.id === id ? result.paciente : p
      ));
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error toggling patient status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePaciente = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/pacientes/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Remover el paciente de la lista local
      setPacientes(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting paciente:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPacienteById = async (id) => {
    return await getPaciente(id);
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  return {
    pacientes,
    loading,
    error,
    fetchPacientes,
    getPaciente,
    getPacienteById,
    createPaciente,
    updatePaciente,
    toggleActivePaciente,
    deletePaciente,
    refetch: fetchPacientes
  };
};
