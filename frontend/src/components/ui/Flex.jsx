import React from 'react';
import { clsx } from 'clsx';

/**
 * Flex component using Tailwind CSS
 * Componente flexbox reutilizable para DentalERP
 */
const Flex = React.forwardRef(
  (
    {
      children,
      direction = 'row',
      align = 'stretch',
      justify = 'start',
      wrap = 'nowrap',
      gap = '0',
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
    };

    const alignClasses = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    };

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    };

    const wrapClasses = {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
    };

    const gapClasses = {
      '0': 'gap-0',
      '1': 'gap-1',
      '2': 'gap-2',
      '3': 'gap-3',
      '4': 'gap-4',
      '5': 'gap-5',
      '6': 'gap-6',
      '8': 'gap-8',
      '10': 'gap-10',
      '12': 'gap-12',
      '16': 'gap-16',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'flex',
          directionClasses[direction],
          alignClasses[align],
          justifyClasses[justify],
          wrapClasses[wrap],
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

Flex.displayName = 'Flex';

export default Flex;
