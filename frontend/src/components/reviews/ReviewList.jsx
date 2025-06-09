import React from 'react';
import { Star, Calendar, User, ThumbsUp, ThumbsDown, Flag, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { Badge, ButtonTW, CardTW } from '../ui';

/**
 * ReviewCard Component
 * Displays an individual review with rating, content, and actions
 */
const ReviewCard = ({
  review,
  showActions = true,
  showContent = true,
  showMeta = true,
  compact = false,
  onLike,
  onDislike,
  onReport,
  onEdit,
  onDelete,
  currentUserId = null,
  className = ''
}) => {
  const {
    id,
    rating,
    title,
    content,
    user,
    created_at,
    updated_at,
    likes_count = 0,
    dislikes_count = 0,
    media = [],
    status = 'published'
  } = review;

  const isOwner = currentUserId && user?.id === currentUserId;
  const canEdit = isOwner && status !== 'reported';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={clsx(
          'w-4 h-4',
          index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-neutral-300'
        )}
      />
    ));
  };

  return (
    <CardTW 
      variant="default" 
      size={compact ? 'sm' : 'md'}
      className={clsx('review-card', className)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* Rating */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex items-center space-x-1">
              {renderStars(rating)}
            </div>
            <span className="text-sm font-medium text-neutral-700">
              {rating}/5
            </span>
            
            {/* Status Badge */}
            {status !== 'published' && (
              <Badge 
                variant={status === 'reported' ? 'warning' : 'secondary'}
                size="sm"
              >
                {status === 'reported' ? 'Reportada' : 'Pendiente'}
              </Badge>
            )}
          </div>

          {/* Title */}
          {title && (
            <h4 className="font-medium text-neutral-800 mb-1 line-clamp-2">
              {title}
            </h4>
          )}
        </div>

        {/* Actions Menu */}
        {showActions && (
          <div className="ml-3">
            <div className="relative group">
              <button className="p-1 rounded-full hover:bg-neutral-100 transition-colors">
                <MoreHorizontal className="w-4 h-4 text-neutral-400" />
              </button>
              
              {/* Actions Dropdown */}
              <div className="absolute right-0 top-8 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 min-w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {canEdit && (
                  <>
                    <button
                      onClick={() => onEdit?.(review)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 first:rounded-t-lg"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete?.(review)}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </>
                )}
                {!isOwner && (
                  <button
                    onClick={() => onReport?.(review)}
                    className="w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 last:rounded-b-lg"
                  >
                    Reportar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {showContent && content && (
        <div className="mb-4">
          <p className={clsx(
            'text-neutral-700 leading-relaxed',
            compact ? 'text-sm line-clamp-3' : 'line-clamp-4'
          )}>
            {content}
          </p>
        </div>
      )}

      {/* Media */}
      {media && media.length > 0 && (
        <div className="mb-4">
          <div className="flex space-x-2 overflow-x-auto">
            {media.slice(0, 3).map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden"
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={`Review media ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    📎
                  </div>
                )}
              </div>
            ))}
            {media.length > 3 && (
              <div className="flex-shrink-0 w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center text-xs text-neutral-600">
                +{media.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Meta Information */}
      {showMeta && (
        <div className="border-t border-neutral-100 pt-3">
          <div className="flex items-center justify-between">
            {/* User and Date */}
            <div className="flex items-center space-x-3 text-sm text-neutral-600">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{user?.name || user?.username || 'Usuario'}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(created_at)}</span>
              </div>
              
              {updated_at !== created_at && (
                <span className="text-xs text-neutral-500">
                  (editada)
                </span>
              )}
            </div>

            {/* Like/Dislike Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onLike?.(review)}
                className="flex items-center space-x-1 text-sm text-neutral-600 hover:text-green-600 transition-colors"
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{likes_count}</span>
              </button>
              
              <button
                onClick={() => onDislike?.(review)}
                className="flex items-center space-x-1 text-sm text-neutral-600 hover:text-red-600 transition-colors"
              >
                <ThumbsDown className="w-3 h-3" />
                <span>{dislikes_count}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </CardTW>
  );
};

/**
 * ReviewList Component
 * Container for displaying multiple reviews
 */
const ReviewList = ({
  reviews = [],
  loading = false,
  error = null,
  emptyState = null,
  onLike,
  onDislike,
  onReport,
  onEdit,
  onDelete,
  currentUserId = null,
  compact = false,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={clsx('space-y-4', className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <CardTW key={index} className="animate-pulse">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <div key={starIndex} className="w-4 h-4 bg-neutral-200 rounded"></div>
                  ))}
                </div>
                <div className="w-12 h-4 bg-neutral-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="w-3/4 h-4 bg-neutral-200 rounded"></div>
                <div className="w-full h-3 bg-neutral-200 rounded"></div>
                <div className="w-5/6 h-3 bg-neutral-200 rounded"></div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="w-24 h-3 bg-neutral-200 rounded"></div>
                <div className="flex space-x-4">
                  <div className="w-8 h-3 bg-neutral-200 rounded"></div>
                  <div className="w-8 h-3 bg-neutral-200 rounded"></div>
                </div>
              </div>
            </div>
          </CardTW>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx('text-center py-8', className)}>
        <div className="text-red-600 mb-2">Error al cargar las reseñas</div>
        <div className="text-sm text-neutral-600">{error}</div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={clsx('text-center py-8', className)}>
        {emptyState || (
          <>
            <Star className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
            <p className="text-neutral-600 mb-2">No hay reseñas disponibles</p>
            <p className="text-sm text-neutral-500">
              Sé el primero en dejar una reseña
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={clsx('review-list space-y-4', className)}>
      {reviews.map(review => (
        <ReviewCard
          key={review.id}
          review={review}
          onLike={onLike}
          onDislike={onDislike}
          onReport={onReport}
          onEdit={onEdit}
          onDelete={onDelete}
          currentUserId={currentUserId}
          compact={compact}
        />
      ))}
    </div>
  );
};

export { ReviewCard, ReviewList };
export default ReviewList;
