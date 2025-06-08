import React from 'react';
import { clsx } from 'clsx';

/**
 * Responsive Typography Component
 * Provides fluid typography that scales across breakpoints
 */
const ResponsiveText = React.forwardRef(
  (
    {
      children,
      as: Component = 'p',
      variant = 'body',
      size,
      responsiveSize,
      weight = 'normal',
      color = 'primary',
      align = 'left',
      className,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      // Headings with responsive scaling
      h1: 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight',
      h2: 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight',
      h3: 'text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold leading-tight',
      h4: 'text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold leading-snug',
      h5: 'text-sm sm:text-base lg:text-lg xl:text-xl font-medium leading-snug',
      h6: 'text-xs sm:text-sm lg:text-base xl:text-lg font-medium leading-normal',
      
      // Body text variants
      'body-lg': 'text-base sm:text-lg lg:text-xl leading-relaxed',
      body: 'text-sm sm:text-base lg:text-lg leading-relaxed',
      'body-sm': 'text-xs sm:text-sm lg:text-base leading-normal',
      
      // Display text for hero sections
      display: 'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-none',
      'display-sm': 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight',
      
      // Caption and small text
      caption: 'text-xs sm:text-sm text-gray-600 leading-normal',
      overline: 'text-xs font-medium uppercase tracking-wider leading-normal',
      
      // Special responsive variants
      subtitle: 'text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed',
      lead: 'text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed font-light',
    };

    const sizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
      '6xl': 'text-6xl',
    };

    const weightClasses = {
      thin: 'font-thin',
      extralight: 'font-extralight',
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
      black: 'font-black',
    };

    const colorClasses = {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      tertiary: 'text-gray-500',
      inverse: 'text-white',
      accent: 'text-primary-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      info: 'text-blue-600',
    };

    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    };

    // Custom responsive size configuration
    const getResponsiveSize = () => {
      if (!responsiveSize) return '';

      const classes = [];
      
      if (responsiveSize.default) classes.push(`text-${responsiveSize.default}`);
      if (responsiveSize.sm) classes.push(`sm:text-${responsiveSize.sm}`);
      if (responsiveSize.md) classes.push(`md:text-${responsiveSize.md}`);
      if (responsiveSize.lg) classes.push(`lg:text-${responsiveSize.lg}`);
      if (responsiveSize.xl) classes.push(`xl:text-${responsiveSize.xl}`);
      if (responsiveSize['2xl']) classes.push(`2xl:text-${responsiveSize['2xl']}`);

      return classes.join(' ');
    };

    return (
      <Component
        ref={ref}
        className={clsx(
          // Use variant classes if provided, otherwise use individual properties
          variant && variantClasses[variant],
          !variant && size && sizeClasses[size],
          !variant && weightClasses[weight],
          responsiveSize && getResponsiveSize(),
          colorClasses[color],
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

ResponsiveText.displayName = 'ResponsiveText';

/**
 * Predefined responsive heading components
 */
const H1 = React.forwardRef((props, ref) => (
  <ResponsiveText ref={ref} as="h1" variant="h1" {...props} />
));

const H2 = React.forwardRef((props, ref) => (
  <ResponsiveText ref={ref} as="h2" variant="h2" {...props} />
));

const H3 = React.forwardRef((props, ref) => (
  <ResponsiveText ref={ref} as="h3" variant="h3" {...props} />
));

const H4 = React.forwardRef((props, ref) => (
  <ResponsiveText ref={ref} as="h4" variant="h4" {...props} />
));

const H5 = React.forwardRef((props, ref) => (
  <ResponsiveText ref={ref} as="h5" variant="h5" {...props} />
));

const H6 = React.forwardRef((props, ref) => (
  <ResponsiveText ref={ref} as="h6" variant="h6" {...props} />
));

const Body = React.forwardRef((props, ref) => (
  <ResponsiveText ref={ref} as="p" variant="body" {...props} />
));

const Caption = React.forwardRef((props, ref) => (
  <ResponsiveText ref={ref} as="span" variant="caption" {...props} />
));

const Lead = React.forwardRef((props, ref) => (
  <ResponsiveText ref={ref} as="p" variant="lead" {...props} />
));

H1.displayName = 'H1';
H2.displayName = 'H2';
H3.displayName = 'H3';
H4.displayName = 'H4';
H5.displayName = 'H5';
H6.displayName = 'H6';
Body.displayName = 'Body';
Caption.displayName = 'Caption';
Lead.displayName = 'Lead';

export { ResponsiveText, H1, H2, H3, H4, H5, H6, Body, Caption, Lead };
export default ResponsiveText;
