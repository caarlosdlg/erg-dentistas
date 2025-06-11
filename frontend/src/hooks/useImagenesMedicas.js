import { useState, useEffect } from 'react';

const API_BASE_URL = '/api';

export const useImagenesMedicas = (pacienteId = null) => {
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchImagenes = async (filters = {}) => {
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
      
      const url = `${API_BASE_URL}/imagenes-medicas/?${queryParams.toString()}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Fetched images data:', data);
      setImagenes(data.results || data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching imágenes:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadImagen = async (imagenData, archivo) => {
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      
      // Add file
      formData.append('archivo', archivo);
      
      // Add required fields with proper validation
      const requiredFields = {
        paciente: imagenData.paciente,
        tipo_imagen: imagenData.tipo_imagen,
        titulo: imagenData.titulo || archivo.name,
        fecha_toma: imagenData.fecha_toma
      };
      
      // Validate required fields
      for (const [key, value] of Object.entries(requiredFields)) {
        if (!value) {
          throw new Error(`El campo ${key} es requerido`);
        }
        formData.append(key, value);
      }
      
      // Add optional fields
      const optionalFields = {
        descripcion: imagenData.descripcion || '',
        diente_especifico: imagenData.diente_especifico || '',
        cuadrante: imagenData.cuadrante || '',
        observaciones_medicas: imagenData.observaciones_medicas || '',
        confidencial: imagenData.confidencial !== false
      };
      
      Object.entries(optionalFields).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      console.log('Uploading image with FormData:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      const response = await fetch(`${API_BASE_URL}/imagenes-medicas/`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        const errorMessage = errorData.detail || 
                           Object.values(errorData).flat().join(', ') || 
                           `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      const newImagen = await response.json();
      console.log('Successfully uploaded image:', newImagen);
      setImagenes(prev => [newImagen, ...prev]);
      setUploadProgress(100);
      
      return newImagen;
    } catch (err) {
      setError(err.message);
      console.error('Error uploading imagen:', err);
      throw err;
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const updateImagen = async (id, imagenData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/imagenes-medicas/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(imagenData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error updating image');
      }
      
      const updatedImagen = await response.json();
      setImagenes(prev => prev.map(img => img.id === id ? updatedImagen : img));
      return updatedImagen;
    } catch (err) {
      setError(err.message);
      console.error('Error updating imagen:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteImagen = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/imagenes-medicas/${id}/`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      setImagenes(prev => prev.filter(img => img.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting imagen:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getImagenesPorTipo = (tipo) => {
    return imagenes.filter(img => img.tipo_imagen === tipo);
  };

  const getImagenesPorBitacora = (bitacoraId) => {
    return imagenes.filter(img => img.bitacora_cita === bitacoraId);
  };

  useEffect(() => {
    if (pacienteId) {
      fetchImagenes();
    }
  }, [pacienteId]);

  return {
    imagenes,
    loading,
    error,
    uploadProgress,
    fetchImagenes,
    uploadImagen,
    updateImagen,
    deleteImagen,
    getImagenesPorTipo,
    getImagenesPorBitacora,
    refetch: fetchImagenes
  };
};
