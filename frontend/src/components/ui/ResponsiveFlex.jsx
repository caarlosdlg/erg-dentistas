import React from 'react';
import { clsx } from 'clsx';

/**
 * Responsive Flex Component
 * Provides flexible responsive flexbox layouts
 */
const ResponsiveFlex = React.forwardRef(
  (
    {
      children,
      direction = 'row',
      wrap = false,
      align = 'stretch',
      justify = 'start',
      gap = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const directionClasses = {
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
      col: 'flex-col',
      'col-reverse': 'flex-col-reverse',
      // Responsive directions
      'col-sm-row': 'flex-col sm:flex-row',
      'col-md-row': 'flex-col md:flex-row',
      'col-lg-row': 'flex-col lg:flex-row',
      'row-sm-col': 'flex-row sm:flex-col',
      'row-md-col': 'flex-row md:flex-col',
      'row-lg-col': 'flex-row lg:flex-col',
    };

    const wrapClasses = {
      true: 'flex-wrap',
      false: 'flex-nowrap',
      wrap: 'flex-wrap',
      nowrap: 'flex-nowrap',
      reverse: 'flex-wrap-reverse',
    };

    const alignClasses = {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
    };

    const justifyClasses = {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    };

    const gapClasses = {
      none: 'gap-0',
      xs: 'gap-2',
      sm: 'gap-4',
      default: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'flex',
          directionClasses[direction],
          wrapClasses[wrap],
          alignClasses[align],
          justifyClasses[justify],
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

ResponsiveFlex.displayName = 'ResponsiveFlex';

/**
 * Responsive Stack Component
 * Provides vertical or horizontal stack layouts with responsive behavior
 */
const ResponsiveStack = React.forwardRef(
  (
    {
      children,
      direction = 'vertical',
      spacing = 'default',
      align = 'stretch',
      divider,
      className,
      ...props
    },
    ref
  ) => {
    const directionClasses = {
      vertical: 'flex-col',
      horizontal: 'flex-row',
      'vertical-sm-horizontal': 'flex-col sm:flex-row',
      'horizontal-sm-vertical': 'flex-row sm:flex-col',
    };

    const spacingClasses = {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      default: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    };

    const alignClasses = {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      stretch: 'items-stretch',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'flex',
          directionClasses[direction],
          spacingClasses[spacing],
          alignClasses[align],
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child, index) => (
          <React.Fragment key={index}>
            {child}
            {divider && index < React.Children.count(children) - 1 && (
              <div className="divider">
                {divider}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }
);

ResponsiveStack.displayName = 'ResponsiveStack';

export { ResponsiveFlex, ResponsiveStack };
export default ResponsiveFlex;
