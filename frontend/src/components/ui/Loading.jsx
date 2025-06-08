import React from 'react';
import clsx from 'clsx';

const Loading = ({
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  text,
  fullscreen = false,
  overlay = false,
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const Spinner = () => (
    <svg 
      className={clsx(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color]
      )}
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const Dots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={clsx(
            'rounded-full animate-pulse',
            sizeClasses[size],
            colorClasses[color],
            'bg-current'
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );

  const Pulse = () => (
    <div 
      className={clsx(
        'rounded-full animate-pulse bg-current',
        sizeClasses[size],
        colorClasses[color]
      )}
    />
  );

  const Bars = () => (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={clsx(
            'bg-current animate-pulse',
            colorClasses[color],
            size === 'sm' ? 'w-1' : size === 'md' ? 'w-1.5' : size === 'lg' ? 'w-2' : 'w-3',
            size === 'sm' ? 'h-4' : size === 'md' ? 'h-6' : size === 'lg' ? 'h-8' : 'h-12'
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1.2s'
          }}
        />
      ))}
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <Dots />;
      case 'pulse':
        return <Pulse />;
      case 'bars':
        return <Bars />;
      default:
        return <Spinner />;
    }
  };

  const content = (
    <div 
      className={clsx(
        'flex flex-col items-center justify-center space-y-3',
        className
      )}
      {...props}
    >
      {renderLoader()}
      {text && (
        <p className={clsx(
          'font-medium animate-pulse',
          textSizeClasses[size],
          colorClasses[color]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
