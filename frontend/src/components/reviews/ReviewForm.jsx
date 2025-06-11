import React, { useState } from 'react';
import { Star, Camera, Upload, X, Save, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { FormInput, Textarea, ButtonTW, CardTW, Modal } from '../ui';

/**
 * ReviewForm Component
 * Form for creating and editing reviews
 */
const ReviewForm = ({
  isOpen = false,
  onClose,
  onSubmit,
  initialData = null,
  contentType = null,
  objectId = null,
  title = 'Escribir Reseña',
  loading = false,
  error = null
}) => {
  const [formData, setFormData] = useState({
    rating: initialData?.rating || 0,
    title: initialData?.title || '',
    content: initialData?.content || '',
    media: initialData?.media || []
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleMediaUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMediaFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      return;
    }

    const submitData = {
      ...formData,
      content_type: contentType,
      object_id: objectId,
      media: mediaFiles
    };

    try {
      await onSubmit(submitData);
      
      // Reset form if successful
      if (!initialData) {
        setFormData({
          rating: 0,
          title: '',
          content: '',
          media: []
        });
        setMediaFiles([]);
      }
    } catch (err) {
      // Error handling is done by parent component
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => {
      const filled = index < (hoverRating || formData.rating);
      return (
        <button
          key={index}
          type="button"
          onMouseEnter={() => setHoverRating(index + 1)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => handleRatingClick(index + 1)}
          className="p-1 transition-transform hover:scale-110"
        >
          <Star
            className={clsx(
              'w-8 h-8 transition-colors',
              filled
                ? 'text-yellow-400 fill-current'
                : 'text-neutral-300 hover:text-yellow-200'
            )}
          />
        </button>
      );
    });
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Muy malo',
      2: 'Malo',
      3: 'Regular',
      4: 'Bueno',
      5: 'Excelente'
    };
    return labels[rating] || 'Selecciona una calificación';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      className="review-form-modal"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div className="text-center">
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Calificación *
          </label>
          
          <div className="flex justify-center items-center space-x-1 mb-2">
            {renderStars()}
          </div>
          
          <p className={clsx(
            'text-sm transition-colors',
            formData.rating > 0 ? 'text-neutral-600' : 'text-red-500'
          )}>
            {getRatingLabel(hoverRating || formData.rating)}
          </p>
        </div>

        {/* Title Field */}
        <div>
          <FormInput
            label="Título (opcional)"
            placeholder="Breve descripción de tu experiencia..."
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            maxLength={100}
            helperText={`${formData.title.length}/100 caracteres`}
          />
        </div>

        {/* Content Field */}
        <div>
          <Textarea
            label="Tu reseña *"
            placeholder="Cuéntanos sobre tu experiencia en detalle..."
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            rows={6}
            maxLength={1000}
            required
            helperText={`${formData.content.length}/1000 caracteres`}
          />
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Imágenes (opcional)
          </label>
          
          {/* Upload Button */}
          <div className="flex items-center space-x-3 mb-4">
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleMediaUpload}
                className="hidden"
                disabled={uploadingMedia || mediaFiles.length >= 5}
              />
              <div className="flex items-center space-x-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
                <Camera className="w-4 h-4 text-neutral-600" />
                <span className="text-sm text-neutral-700">
                  Agregar fotos
                </span>
              </div>
            </label>
            
            <span className="text-xs text-neutral-500">
              Máximo 5 imágenes, 5MB cada una
            </span>
          </div>

          {/* Media Preview */}
          {mediaFiles.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {mediaFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeMediaFile(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <ButtonTW
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </ButtonTW>
          
          <ButtonTW
            type="submit"
            variant="primary"
            loading={loading}
            disabled={formData.rating === 0 || !formData.content.trim()}
            leftIcon={Save}
          >
            {initialData ? 'Actualizar' : 'Publicar'} Reseña
          </ButtonTW>
        </div>
      </form>
    </Modal>
  );
};

/**
 * QuickReviewForm Component
 * Compact inline form for quick reviews
 */
const QuickReviewForm = ({
  onSubmit,
  contentType,
  objectId,
  placeholder = 'Escribe una reseña rápida...',
  loading = false,
  className = ''
}) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0 || !content.trim()) return;

    try {
      await onSubmit({
        rating,
        content: content.trim(),
        content_type: contentType,
        object_id: objectId
      });
      
      // Reset form
      setRating(0);
      setContent('');
      setIsExpanded(false);
    } catch (err) {
      // Error handling by parent
    }
  };

  const renderQuickStars = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => setRating(index + 1)}
        className="p-1"
      >
        <Star
          className={clsx(
            'w-5 h-5 transition-colors',
            index < rating
              ? 'text-yellow-400 fill-current'
              : 'text-neutral-300 hover:text-yellow-200'
          )}
        />
      </button>
    ));
  };

  return (
    <CardTW className={clsx('quick-review-form', className)}>
      <form onSubmit={handleSubmit}>
        {!isExpanded ? (
          /* Collapsed State */
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="w-full text-left p-3 text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            {placeholder}
          </button>
        ) : (
          /* Expanded State */
          <div className="space-y-4">
            {/* Rating */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-700">Calificación:</span>
              <div className="flex space-x-1">
                {renderQuickStars()}
              </div>
            </div>

            {/* Content */}
            <Textarea
              placeholder={placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              maxLength={500}
              autoFocus
            />

            {/* Actions */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-500">
                {content.length}/500 caracteres
              </span>
              
              <div className="flex space-x-2">
                <ButtonTW
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsExpanded(false);
                    setRating(0);
                    setContent('');
                  }}
                >
                  Cancelar
                </ButtonTW>
                
                <ButtonTW
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={loading}
                  disabled={rating === 0 || !content.trim()}
                >
                  Enviar
                </ButtonTW>
              </div>
            </div>
          </div>
        )}
      </form>
    </CardTW>
  );
};

export { QuickReviewForm };
export default ReviewForm;
