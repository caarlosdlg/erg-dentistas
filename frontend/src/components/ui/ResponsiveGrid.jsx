import React from 'react';
import { clsx } from 'clsx';

/**
 * Responsive Grid Component
 * Provides flexible responsive grid layouts with customizable breakpoints
 */
const ResponsiveGrid = React.forwardRef(
  (
    {
      children,
      cols = { default: 1, sm: 2, lg: 3 },
      gap = 'default',
      autoFit = false,
      minItemWidth = '250px',
      className,
      ...props
    },
    ref
  ) => {
    const gapClasses = {
      none: 'gap-0',
      xs: 'gap-2',
      sm: 'gap-4',
      default: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12',
    };

    // Handle auto-fit grid
    if (autoFit) {
      return (
        <div
          ref={ref}
          className={clsx(
            'grid',
            gapClasses[gap],
            className
          )}
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
          }}
          {...props}
        >
          {children}
        </div>
      );
    }

    // Handle responsive column configuration
    const getGridCols = () => {
      if (typeof cols === 'number') {
        return `grid-cols-${cols}`;
      }

      const classes = [];
      
      // Default columns
      if (cols.default) {
        classes.push(`grid-cols-${cols.default}`);
      }
      
      // Responsive breakpoints
      if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
      if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
      if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
      if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
      if (cols['2xl']) classes.push(`2xl:grid-cols-${cols['2xl']}`);

      return classes.join(' ');
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'grid',
          getGridCols(),
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveGrid.displayName = 'ResponsiveGrid';

/**
 * Responsive Grid Item Component
 * Provides responsive column spanning for grid items
 */
const ResponsiveGridItem = React.forwardRef(
  (
    {
      children,
      colSpan = 1,
      rowSpan = 1,
      className,
      ...props
    },
    ref
  ) => {
    const getColSpan = () => {
      if (typeof colSpan === 'number') {
        return `col-span-${colSpan}`;
      }

      const classes = [];
      
      if (colSpan.default) classes.push(`col-span-${colSpan.default}`);
      if (colSpan.sm) classes.push(`sm:col-span-${colSpan.sm}`);
      if (colSpan.md) classes.push(`md:col-span-${colSpan.md}`);
      if (colSpan.lg) classes.push(`lg:col-span-${colSpan.lg}`);
      if (colSpan.xl) classes.push(`xl:col-span-${colSpan.xl}`);
      if (colSpan['2xl']) classes.push(`2xl:col-span-${colSpan['2xl']}`);

      return classes.join(' ');
    };

    const getRowSpan = () => {
      if (typeof rowSpan === 'number') {
        return `row-span-${rowSpan}`;
      }

      const classes = [];
      
      if (rowSpan.default) classes.push(`row-span-${rowSpan.default}`);
      if (rowSpan.sm) classes.push(`sm:row-span-${rowSpan.sm}`);
      if (rowSpan.md) classes.push(`md:row-span-${rowSpan.md}`);
      if (rowSpan.lg) classes.push(`lg:row-span-${rowSpan.lg}`);
      if (rowSpan.xl) classes.push(`xl:row-span-${rowSpan.xl}`);
      if (rowSpan['2xl']) classes.push(`2xl:row-span-${rowSpan['2xl']}`);

      return classes.join(' ');
    };

    return (
      <div
        ref={ref}
        className={clsx(
          getColSpan(),
          getRowSpan(),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveGridItem.displayName = 'ResponsiveGridItem';

export { ResponsiveGrid, ResponsiveGridItem };
export default ResponsiveGrid;
