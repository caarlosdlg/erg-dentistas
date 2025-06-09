import React from 'react';
import { Star, TrendingUp, BarChart3, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { CardTW, Badge } from '../ui';

/**
 * ReviewStats Component
 * Displays aggregated review statistics and rating distribution
 */
const ReviewStats = ({
  stats = {
    total: 0,
    average: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  },
  loading = false,
  compact = false,
  showDistribution = true,
  className = ''
}) => {
  const { total, average, distribution } = stats;

  const renderStars = (rating, size = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={clsx(
          sizeClasses[size],
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-neutral-300'
        )}
      />
    ));
  };

  const getDistributionPercentage = (count) => {
    return total > 0 ? (count / total) * 100 : 0;
  };

  const getRatingLabel = (average) => {
    if (average >= 4.5) return 'Excelente';
    if (average >= 3.5) return 'Muy bueno';
    if (average >= 2.5) return 'Bueno';
    if (average >= 1.5) return 'Regular';
    return 'Necesita mejorar';
  };

  if (loading) {
    return (
      <CardTW className={clsx('animate-pulse', className)}>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-8 bg-neutral-200 rounded"></div>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-neutral-200 rounded"></div>
              ))}
            </div>
          </div>
          
          {!compact && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-8 h-4 bg-neutral-200 rounded"></div>
                  <div className="flex-1 h-2 bg-neutral-200 rounded"></div>
                  <div className="w-8 h-4 bg-neutral-200 rounded"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardTW>
    );
  }

  if (total === 0) {
    return (
      <CardTW className={clsx('text-center py-6', className)}>
        <Star className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
        <p className="text-neutral-600 mb-1">Sin reseñas aún</p>
        <p className="text-sm text-neutral-500">
          Sé el primero en dejar una reseña
        </p>
      </CardTW>
    );
  }

  return (
    <CardTW className={clsx('review-stats', className)}>
      {/* Overall Rating */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span className="text-3xl font-bold text-neutral-800">
            {average.toFixed(1)}
          </span>
          <div className="flex space-x-1">
            {renderStars(average, 'lg')}
          </div>
        </div>
        
        <p className="text-neutral-600 mb-1">{getRatingLabel(average)}</p>
        
        <div className="flex items-center justify-center space-x-4 text-sm text-neutral-500">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{total} reseña{total !== 1 ? 's' : ''}</span>
          </div>
          
          <Badge variant="info" size="sm">
            {average >= 4 ? 'Recomendado' : 'Popular'}
          </Badge>
        </div>
      </div>

      {/* Rating Distribution */}
      {showDistribution && !compact && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-neutral-700 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Distribución de calificaciones</span>
          </h4>
          
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = distribution[rating] || 0;
              const percentage = getDistributionPercentage(count);
              
              return (
                <div key={rating} className="flex items-center space-x-3 text-sm">
                  <div className="flex items-center space-x-1 w-12">
                    <span className="text-neutral-600">{rating}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  </div>
                  
                  <div className="flex-1 bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <span className="text-neutral-500 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Compact Distribution */}
      {showDistribution && compact && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>1★</span>
            <span>2★</span>
            <span>3★</span>
            <span>4★</span>
            <span>5★</span>
          </div>
          
          <div className="flex space-x-1 h-2">
            {[1, 2, 3, 4, 5].map(rating => {
              const count = distribution[rating] || 0;
              const percentage = getDistributionPercentage(count);
              
              return (
                <div
                  key={rating}
                  className="flex-1 bg-neutral-200 rounded overflow-hidden"
                >
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ height: `${percentage}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </CardTW>
  );
};

/**
 * ReviewSummary Component
 * Compact summary of review statistics
 */
const ReviewSummary = ({
  stats,
  loading = false,
  showCount = true,
  showRating = true,
  size = 'md',
  className = ''
}) => {
  const { total = 0, average = 0 } = stats || {};

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const starSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (loading) {
    return (
      <div className={clsx('flex items-center space-x-2 animate-pulse', className)}>
        <div className="w-8 h-4 bg-neutral-200 rounded"></div>
        <div className="flex space-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={clsx(starSizes[size], 'bg-neutral-200 rounded')}></div>
          ))}
        </div>
        {showCount && <div className="w-16 h-4 bg-neutral-200 rounded"></div>}
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className={clsx('flex items-center space-x-2 text-neutral-500', sizeClasses[size], className)}>
        <span>Sin reseñas</span>
      </div>
    );
  }

  return (
    <div className={clsx('flex items-center space-x-2', sizeClasses[size], className)}>
      {showRating && (
        <>
          <span className="font-medium text-neutral-800">
            {average.toFixed(1)}
          </span>
          
          <div className="flex space-x-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={clsx(
                  starSizes[size],
                  index < Math.floor(average)
                    ? 'text-yellow-400 fill-current'
                    : 'text-neutral-300'
                )}
              />
            ))}
          </div>
        </>
      )}
      
      {showCount && (
        <span className="text-neutral-600">
          ({total} reseña{total !== 1 ? 's' : ''})
        </span>
      )}
    </div>
  );
};

/**
 * ReviewTrends Component
 * Shows review trends and insights
 */
const ReviewTrends = ({
  recentStats = [],
  period = '7d',
  className = ''
}) => {
  const calculateTrend = () => {
    if (recentStats.length < 2) return 0;
    
    const current = recentStats[recentStats.length - 1]?.average || 0;
    const previous = recentStats[recentStats.length - 2]?.average || 0;
    
    return current - previous;
  };

  const trend = calculateTrend();
  const isPositive = trend > 0;
  const isNeutral = trend === 0;

  const getPeriodLabel = () => {
    switch (period) {
      case '7d': return 'últimos 7 días';
      case '30d': return 'último mes';
      case '90d': return 'últimos 3 meses';
      default: return 'período reciente';
    }
  };

  return (
    <CardTW className={clsx('review-trends', className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-neutral-700 flex items-center space-x-2">
          <TrendingUp className="w-4 h-4" />
          <span>Tendencia - {getPeriodLabel()}</span>
        </h4>
        
        <div className={clsx(
          'flex items-center space-x-1 text-sm',
          {
            'text-green-600': isPositive,
            'text-red-600': trend < 0,
            'text-neutral-600': isNeutral
          }
        )}>
          {!isNeutral && (
            <span>{isPositive ? '↗' : '↘'}</span>
          )}
          <span>
            {isNeutral ? 'Sin cambios' : `${isPositive ? '+' : ''}${trend.toFixed(1)}`}
          </span>
        </div>
      </div>
      
      <div className="text-xs text-neutral-500">
        {isPositive && 'Las reseñas están mejorando'}
        {trend < 0 && 'Las reseñas necesitan atención'}
        {isNeutral && 'Calificación estable'}
      </div>
    </CardTW>
  );
};

export { ReviewStats, ReviewSummary, ReviewTrends };
export default ReviewStats;
