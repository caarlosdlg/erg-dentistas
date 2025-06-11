import React from 'react';
import { clsx } from 'clsx';

/**
 * Loading Spinner component
 */
const Spinner = ({ size = 'md', className }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  return (
    <svg
      className={clsx(
        'animate-spin text-current',
        sizeClasses[size],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
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
};

/**
 * Loading Dots component
 */
const LoadingDots = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <div className={clsx('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={clsx(
            'bg-current rounded-full animate-pulse',
            sizeClasses[size]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
};

/**
 * Loading Skeleton component
 */
const Skeleton = ({ 
  width = 'w-full', 
  height = 'h-4', 
  rounded = 'rounded',
  className 
}) => {
  return (
    <div
      className={clsx(
        'bg-neutral-200 animate-pulse',
        width,
        height,
        rounded,
        className
      )}
    />
  );
};

/**
 * Loading component with different variants
 */
const Loading = React.forwardRef(
  (
    {
      variant = 'spinner',
      size = 'md',
      text,
      overlay = false,
      centered = false,
      className,
      ...props
    },
    ref
  ) => {
    const LoadingIcon = {
      spinner: Spinner,
      dots: LoadingDots,
    }[variant];

    const content = (
      <div
        ref={ref}
        className={clsx(
          'flex items-center gap-3',
          centered && 'justify-center',
          className
        )}
        {...props}
      >
        <LoadingIcon size={size} />
        {text && (
          <span className="text-neutral-600 font-medium">
            {text}
          </span>
        )}
      </div>
    );

    if (overlay) {
      return (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          {content}
        </div>
      );
    }

    return content;
  }
);

Loading.displayName = 'Loading';

/**
 * Page Loading component
 */
const PageLoading = ({ message = 'Cargando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="relative">
        <Spinner size="xl" className="text-primary-500" />
      </div>
      <p className="text-neutral-600 font-medium">{message}</p>
    </div>
  );
};

/**
 * Card Loading component with skeleton
 */
const CardLoading = ({ lines = 3 }) => {
  return (
    <div className="card-base card-default p-6 space-y-4">
      <Skeleton height="h-6" width="w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height="h-4" />
      ))}
      <div className="flex gap-2 pt-2">
        <Skeleton height="h-8" width="w-20" rounded="rounded-md" />
        <Skeleton height="h-8" width="w-16" rounded="rounded-md" />
      </div>
    </div>
  );
};

/**
 * Table Loading component
 */
const TableLoading = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              height="h-6" 
              width={colIndex === 0 ? "w-24" : "w-full"} 
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export { 
  Loading, 
  Spinner, 
  LoadingDots, 
  Skeleton, 
  PageLoading, 
  CardLoading, 
  TableLoading 
};

export default Loading;
