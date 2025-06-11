import React, { useState, useEffect, useRef } from 'react';
import { useImagenesMedicas } from '../../hooks/useImagenesMedicas';

const GestorImagenes = ({ pacienteId }) => {
  const {
    imagenes,
    loading,
    error,
    uploadProgress,
    fetchImagenes,
    uploadImagen,
    deleteImagen,
    updateImagen
  } = useImagenesMedicas();

  const [selectedImages, setSelectedImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  // const [filtros, setFiltros] = useState({
  //   categoria: '',
  //   fecha_desde: '',
  //   fecha_hasta: ''
  // });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedImage, setSelectedImage] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const fileInputRef = useRef(null);

  const categorias = [
    { value: 'radiografia_panoramica', label: 'Radiografía Panorámica' },
    { value: 'radiografia_periapical', label: 'Radiografía Periapical' },
    { value: 'radiografia_bite_wing', label: 'Radiografía Bite-Wing' },
    { value: 'foto_intraoral', label: 'Fotografía Intraoral' },
    { value: 'foto_extraoral', label: 'Fotografía Extraoral' },
    { value: 'foto_sonrisa', label: 'Fotografía de Sonrisa' },
    { value: 'scan_3d', label: 'Escaneo 3D' },
    { value: 'documento', label: 'Documento Médico' },
    { value: 'consentimiento', label: 'Consentimiento Informado' },
    { value: 'receta', label: 'Receta Médica' },
    { value: 'otro', label: 'Otro' }
  ];

  useEffect(() => {
    if (pacienteId) {
      // fetchImagenes({ paciente: pacienteId, ...filtros });
      fetchImagenes({ paciente: pacienteId });
    }
  }, [pacienteId]); // , filtros

  const handleFileSelect = (files) => {
    setSelectedImages(Array.from(files));
    setShowUploadForm(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleUpload = async (imageData) => {
    try {
      for (const file of selectedImages) {
        // Prepare data with correct field names for backend
        const imagenDataForBackend = {
          paciente: pacienteId,
          tipo_imagen: imageData.categoria, // Map categoria -> tipo_imagen
          titulo: imageData.titulo || file.name, // Use provided title or filename
          descripcion: imageData.descripcion,
          fecha_toma: imageData.fecha_toma,
          diente_especifico: imageData.diente_especifico || '',
          cuadrante: imageData.cuadrante || '',
          observaciones_medicas: imageData.observaciones_medicas || '',
          confidencial: imageData.confidencial !== false // default to true
        };
        
        console.log('Uploading with data:', imagenDataForBackend);
        
        // Call uploadImagen with correct signature: (imagenData, archivo)
        await uploadImagen(imagenDataForBackend, file);
      }
      
      setSelectedImages([]);
      setShowUploadForm(false);
      
      // Refresh the images list
      // await fetchImagenes({ paciente: pacienteId, ...filtros });
      await fetchImagenes({ paciente: pacienteId });
      
    } catch (error) {
      console.error('Error uploading images:', error);
      // El hook useImagenesMedicas ya maneja el estado de error
    }
  };

  const handleDelete = async (imageId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta imagen?')) {
      try {
        await deleteImagen(imageId);
        // fetchImagenes({ paciente: pacienteId, ...filtros });
        fetchImagenes({ paciente: pacienteId });
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  };

  // const handleFiltroChange = (key, value) => {
  //   setFiltros(prev => ({
  //     ...prev,
  //     [key]: value
  //   }));
  // };

  // const clearFilters = () => {
  //   setFiltros({
  //     categoria: '',
  //     fecha_desde: '',
  //     fecha_hasta: ''
  //   });
  // };

  const getFileIcon = (filename) => {
    if (!filename) {
      return (
        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'dcm':
      case 'dicom':
        return (
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Imágenes Médicas</h2>
          <p className="text-gray-600">Gestiona radiografías, fotos y estudios del paciente</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Subir Imágenes
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.dcm,.dicom"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* Filters */}
      {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
          {Object.values(filtros).some(v => v !== '') && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={filtros.categoria}
              onChange={(e) => handleFiltroChange('categoria', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.value} value={categoria.value}>
                  {categoria.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desde
            </label>
            <input
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hasta
            </label>
            <input
              type="date"
              value={filtros.fecha_hasta}
              onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div> */}

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <svg className={`mx-auto h-12 w-12 ${dragOver ? 'text-blue-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Arrastra y suelta imágenes aquí
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          O{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            selecciona archivos
          </button>
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Formatos soportados: JPG, PNG, GIF, DICOM, PDF
        </p>
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Subiendo imágenes...</span>
            <span className="text-sm text-gray-500">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error al cargar las imágenes</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Images Display */}
      {loading && imagenes.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando imágenes...</span>
        </div>
      ) : imagenes.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay imágenes médicas</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Aún no se han subido imágenes para este paciente. 
            Comienza agregando radiografías, fotos o estudios médicos.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Subir Primera Imagen
            </button>
            <p className="text-xs text-gray-400">
              También puedes arrastrar y soltar archivos aquí
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {imagenes.map((imagen) => (
                <div key={imagen.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {/* Image Preview */}
                  <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                    <img
                      src={imagen.miniatura || imagen.archivo}
                      alt={imagen.descripcion || imagen.titulo}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => setSelectedImage(imagen)}
                      onError={(e) => {
                        // Try fallback URLs if primary fails
                        if (e.target.src === imagen.miniatura && imagen.archivo) {
                          e.target.src = imagen.archivo;
                        } else if (e.target.src === imagen.archivo && imagen.url_completa) {
                          e.target.src = `http://localhost:8000${imagen.url_completa}`;
                        } else {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="hidden w-full h-48 items-center justify-center bg-gray-100">
                      {getFileIcon(imagen.nombre_archivo)}
                    </div>
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedImage(imagen)}
                        className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      
                     
                      <button
                        onClick={() => handleDelete(imagen.id)}
                        className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {imagen.descripcion || imagen.nombre_archivo}
                        </h4>
                        <p className="text-xs text-gray-500 capitalize">
                          {categorias.find(c => c.value === imagen.categoria)?.label || imagen.categoria}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(imagen.fecha_toma).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {imagen.tamaño_formateado || formatFileSize(imagen.tamano_archivo)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tamaño
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {imagenes.map((imagen) => (
                    <tr key={imagen.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 object-cover rounded-md cursor-pointer"
                              src={imagen.miniatura || imagen.archivo}
                              alt={imagen.descripcion || imagen.titulo}
                              onClick={() => setSelectedImage(imagen)}
                              onError={(e) => {
                                // Try fallback URLs if primary fails
                                if (e.target.src === imagen.miniatura && imagen.archivo) {
                                  e.target.src = imagen.archivo;
                                } else if (e.target.src === imagen.archivo && imagen.url_completa) {
                                  e.target.src = `http://localhost:8000${imagen.url_completa}`;
                                } else {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                            <div className="hidden h-10 w-10 items-center justify-center bg-gray-100 rounded-md">
                              {getFileIcon(imagen.nombre_archivo)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {imagen.descripcion || imagen.nombre_archivo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {categorias.find(c => c.value === imagen.tipo_imagen)?.label || imagen.tipo_imagen}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(imagen.fecha_toma).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {imagen.tamaño_formateado || formatFileSize(imagen.tamano_archivo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setSelectedImage(imagen)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Ver
                          </button>
                        
                          <button
                            onClick={() => handleDelete(imagen.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && (
        <UploadForm
          images={selectedImages}
          categorias={categorias}
          onSubmit={handleUpload}
          onCancel={() => {
            setSelectedImages([]);
            setShowUploadForm(false);
          }}
        />
      )}

      {/* Image Viewer Modal */}
      {selectedImage && (
        <ImageViewer
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

// Upload Form Component
const UploadForm = ({ images, categorias, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    categoria: 'radiografia_panoramica',
    titulo: '',
    descripcion: '',
    fecha_toma: new Date().toISOString().split('T')[0],
    diente_especifico: '',
    cuadrante: '',
    observaciones_medicas: '',
    confidencial: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Subir {images.length} imagen{images.length > 1 ? 'es' : ''}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Título de la imagen..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {categorias.map(categoria => (
                  <option key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                rows={3}
                placeholder="Descripción de las imágenes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Toma
              </label>
              <input
                type="date"
                value={formData.fecha_toma}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha_toma: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diente Específico
                </label>
                <input
                  type="text"
                  value={formData.diente_especifico}
                  onChange={(e) => setFormData(prev => ({ ...prev, diente_especifico: e.target.value }))}
                  placeholder="Ej: 11, 21, 31..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuadrante
                </label>
                <select
                  value={formData.cuadrante}
                  onChange={(e) => setFormData(prev => ({ ...prev, cuadrante: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar cuadrante</option>
                  <option value="superior_derecho">Superior Derecho</option>
                  <option value="superior_izquierdo">Superior Izquierdo</option>
                  <option value="inferior_derecho">Inferior Derecho</option>
                  <option value="inferior_izquierdo">Inferior Izquierdo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones Médicas
              </label>
              <textarea
                value={formData.observaciones_medicas}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones_medicas: e.target.value }))}
                rows={2}
                placeholder="Observaciones médicas específicas..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="confidencial"
                checked={formData.confidencial}
                onChange={(e) => setFormData(prev => ({ ...prev, confidencial: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="confidencial" className="ml-2 block text-sm text-gray-900">
                Imagen confidencial
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Subir
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Image Viewer Component
const ImageViewer = ({ image, onClose }) => {
  console.log('ImageViewer - image data:', image);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative max-w-4xl max-h-screen m-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <img
          src={image.archivo}
          alt={image.descripcion || image.titulo}
          className="max-w-full max-h-screen object-contain"
          onError={(e) => {
            console.error('Error loading image:', e.target.src);
            console.error('Available image data:', image);
            // Try alternative URLs
            if (e.target.src === image.archivo && image.url_completa) {
              e.target.src = `http://localhost:8000${image.url_completa}`;
            } else if (image.miniatura) {
              e.target.src = image.miniatura;
            }
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', image.titulo);
          }}
        />
        
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
          <h4 className="font-medium">{image.titulo || image.descripcion || image.nombre_archivo}</h4>
          <p className="text-sm opacity-75">
            {new Date(image.fecha_toma).toLocaleDateString()} • {image.tipo_imagen}
          </p>
          {image.tamaño_formateado && (
            <p className="text-xs opacity-60 mt-1">{image.tamaño_formateado}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestorImagenes;
