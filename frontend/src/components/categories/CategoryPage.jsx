import React from 'react';
import { ArrowRight, Users, Star, Calendar, MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import { CardTW, ButtonTW, Badge } from '../ui';
import { useCategory } from '../../hooks/useCategories';
import { useReviews, useReviewStats } from '../../hooks/useReviews';
import { ReviewList } from '../reviews/ReviewList';
import { ReviewStats, ReviewSummary } from '../reviews/ReviewStats';

/**
 * CategoryCard Component
 * Card display for individual categories
 */
const CategoryCard = ({
  category,
  onSelect,
  onViewTreatments,
  onViewReviews,
  showStats = true,
  showActions = true,
  compact = false,
  className = ''
}) => {
  const {
    id,
    name,
    description,
    treatment_count = 0,
    parent,
    level = 0
  } = category;

  // Get review stats for this category
  const { stats: reviewStats, loading: statsLoading } = useReviewStats('category', id);

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(category);
    }
  };

  return (
    <CardTW
      variant="default"
      size={compact ? 'sm' : 'md'}
      interactive={!!onSelect}
      className={clsx('category-card', className)}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={clsx(
            'font-semibold text-neutral-800 mb-1',
            compact ? 'text-base' : 'text-lg'
          )}>
            {name}
          </h3>
          
          {/* Breadcrumb */}
          {parent && (
            <div className="flex items-center text-xs text-neutral-500 mb-2">
              <span>{parent.name}</span>
              <ArrowRight className="w-3 h-3 mx-1" />
              <span className="text-neutral-700">{name}</span>
            </div>
          )}
        </div>

        {/* Level Indicator */}
        {level > 0 && (
          <Badge variant="secondary" size="sm">
            Nivel {level}
          </Badge>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className={clsx(
          'text-neutral-600 mb-4',
          compact ? 'text-sm line-clamp-2' : 'line-clamp-3'
        )}>
          {description}
        </p>
      )}

      {/* Stats */}
      {showStats && (
        <div className="space-y-3 mb-4">
          {/* Treatment Count */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-neutral-600">
              <Users className="w-4 h-4" />
              <span>{treatment_count} tratamiento{treatment_count !== 1 ? 's' : ''}</span>
            </div>
            
            {treatment_count > 0 && (
              <Badge variant={treatment_count > 10 ? 'success' : 'info'} size="sm">
                {treatment_count > 10 ? 'Popular' : 'Disponible'}
              </Badge>
            )}
          </div>

          {/* Review Summary */}
          {reviewStats && reviewStats.total > 0 && (
            <ReviewSummary
              stats={reviewStats}
              loading={statsLoading}
              size="sm"
            />
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
          <div className="flex space-x-2">
            {treatment_count > 0 && (
              <ButtonTW
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewTreatments?.(category);
                }}
              >
                Ver tratamientos
              </ButtonTW>
            )}
            
            {reviewStats && reviewStats.total > 0 && (
              <ButtonTW
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewReviews?.(category);
                }}
              >
                Ver reseñas
              </ButtonTW>
            )}
          </div>

          <ButtonTW
            variant="primary"
            size="sm"
            rightIcon={ArrowRight}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(category);
            }}
          >
            Explorar
          </ButtonTW>
        </div>
      )}
    </CardTW>
  );
};

/**
 * CategoryPage Component
 * Full page view for a category with treatments and reviews
 */
const CategoryPage = ({
  categoryId,
  onBack,
  onTreatmentSelect,
  className = ''
}) => {
  // Get category data with treatments
  const { 
    category, 
    treatments, 
    loading: categoryLoading, 
    error: categoryError 
  } = useCategory(categoryId);

  // Get reviews for this category
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    pagination: reviewsPagination,
    loadNextPage: loadNextReviews
  } = useReviews({
    contentType: 'category',
    objectId: categoryId,
    pageSize: 6
  });

  // Get review statistics
  const { stats: reviewStats, loading: statsLoading } = useReviewStats('category', categoryId);

  if (categoryLoading) {
    return (
      <div className={clsx('category-page animate-pulse', className)}>
        <div className="mb-8">
          <div className="w-32 h-6 bg-neutral-200 rounded mb-4"></div>
          <div className="w-3/4 h-8 bg-neutral-200 rounded mb-2"></div>
          <div className="w-full h-4 bg-neutral-200 rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="w-full h-48 bg-neutral-200 rounded-lg"></div>
            <div className="w-full h-64 bg-neutral-200 rounded-lg"></div>
          </div>
          <div className="space-y-6">
            <div className="w-full h-32 bg-neutral-200 rounded-lg"></div>
            <div className="w-full h-48 bg-neutral-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (categoryError) {
    return (
      <div className={clsx('category-page text-center py-12', className)}>
        <div className="text-red-600 mb-4">Error al cargar la categoría</div>
        <p className="text-neutral-600 mb-4">{categoryError}</p>
        <ButtonTW variant="outline" onClick={onBack}>
          Volver
        </ButtonTW>
      </div>
    );
  }

  if (!category) {
    return (
      <div className={clsx('category-page text-center py-12', className)}>
        <div className="text-neutral-600 mb-4">Categoría no encontrada</div>
        <ButtonTW variant="outline" onClick={onBack}>
          Volver
        </ButtonTW>
      </div>
    );
  }

  return (
    <div className={clsx('category-page', className)}>
      {/* Header */}
      <div className="mb-8">
        {onBack && (
          <ButtonTW
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-4"
          >
            ← Volver a categorías
          </ButtonTW>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">
              {category.name}
            </h1>
            
            {/* Breadcrumb */}
            {category.parent && (
              <div className="flex items-center text-sm text-neutral-500 mb-3">
                <span>{category.parent.name}</span>
                <ArrowRight className="w-4 h-4 mx-2" />
                <span className="text-neutral-700">{category.name}</span>
              </div>
            )}
            
            {category.description && (
              <p className="text-neutral-600 max-w-3xl">
                {category.description}
              </p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="text-right">
            <div className="flex items-center space-x-4 text-sm text-neutral-600">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{treatments?.length || 0} tratamientos</span>
              </div>
              
              {reviewStats && (
                <ReviewSummary stats={reviewStats} loading={statsLoading} size="sm" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Treatments and Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Treatments Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-800">
                Tratamientos Disponibles
              </h2>
              
              {treatments && treatments.length > 6 && (
                <ButtonTW variant="outline" size="sm">
                  Ver todos ({treatments.length})
                </ButtonTW>
              )}
            </div>

            {categoryLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 bg-neutral-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : treatments && treatments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {treatments.slice(0, 6).map(treatment => (
                  <TreatmentCard
                    key={treatment.id}
                    treatment={treatment}
                    onSelect={onTreatmentSelect}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                <p>No hay tratamientos disponibles en esta categoría</p>
              </div>
            )}
          </section>

          {/* Reviews Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-800">
                Reseñas de la Categoría
              </h2>
              
              {reviewsPagination?.totalItems > reviews?.length && (
                <ButtonTW 
                  variant="outline" 
                  size="sm"
                  onClick={loadNextReviews}
                  loading={reviewsLoading}
                >
                  Cargar más
                </ButtonTW>
              )}
            </div>

            <ReviewList
              reviews={reviews}
              loading={reviewsLoading}
              error={reviewsError}
              compact
              emptyState={
                <div className="text-center py-8 text-neutral-500">
                  <Star className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                  <p>No hay reseñas para esta categoría aún</p>
                  <p className="text-sm mt-2">Las reseñas aparecerán cuando los usuarios evalúen los tratamientos</p>
                </div>
              }
            />
          </section>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Review Stats */}
          <ReviewStats
            stats={reviewStats}
            loading={statsLoading}
            compact
          />

          {/* Category Info */}
          <CardTW>
            <h3 className="text-lg font-medium text-neutral-800 mb-4">
              Información de la Categoría
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Tratamientos:</span>
                <span className="font-medium">{treatments?.length || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Nivel:</span>
                <span className="font-medium">
                  {category.level ? `Subcategoría (${category.level})` : 'Categoría principal'}
                </span>
              </div>
              
              {category.created_at && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Creada:</span>
                  <span className="font-medium">
                    {new Date(category.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}
            </div>
          </CardTW>

          {/* Related Categories */}
          {category.parent?.children && category.parent.children.length > 1 && (
            <CardTW>
              <h3 className="text-lg font-medium text-neutral-800 mb-4">
                Categorías Relacionadas
              </h3>
              
              <div className="space-y-2">
                {category.parent.children
                  .filter(cat => cat.id !== category.id)
                  .slice(0, 5)
                  .map(relatedCategory => (
                    <button
                      key={relatedCategory.id}
                      onClick={() => onCategorySelect?.(relatedCategory)}
                      className="w-full text-left p-2 rounded hover:bg-neutral-50 transition-colors"
                    >
                      <div className="font-medium text-sm">{relatedCategory.name}</div>
                      <div className="text-xs text-neutral-500">
                        {relatedCategory.treatment_count} tratamientos
                      </div>
                    </button>
                  ))}
              </div>
            </CardTW>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Simple TreatmentCard component for category page
 */
const TreatmentCard = ({ treatment, onSelect, compact = false }) => {
  return (
    <CardTW
      variant="default"
      size={compact ? 'sm' : 'md'}
      interactive
      onClick={() => onSelect?.(treatment)}
      className="treatment-card"
    >
      <h4 className="font-medium text-neutral-800 mb-2">{treatment.name}</h4>
      
      {treatment.description && (
        <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
          {treatment.description}
        </p>
      )}
      
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2 text-neutral-500">
          {treatment.duration && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{treatment.duration}</span>
            </div>
          )}
          
          {treatment.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3" />
              <span>{treatment.location}</span>
            </div>
          )}
        </div>
        
        {treatment.price && (
          <Badge variant="secondary" size="sm">
            {treatment.price}
          </Badge>
        )}
      </div>
    </CardTW>
  );
};

export { CategoryCard, CategoryPage, TreatmentCard };
export default CategoryPage;
