import React from 'react';
import styled, { css } from 'styled-components';
import { clsx } from 'clsx';

/**
 * Button variants and sizes configuration
 */
const buttonVariants = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary[500]};
    color: ${({ theme }) => theme.colors.text.inverse};
    border: 1px solid ${({ theme }) => theme.colors.primary[500]};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primary[600]};
      border-color: ${({ theme }) => theme.colors.primary[600]};
    }

    &:active:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primary[700]};
      border-color: ${({ theme }) => theme.colors.primary[700]};
    }
  `,

  secondary: css`
    background-color: ${({ theme }) => theme.colors.secondary[500]};
    color: ${({ theme }) => theme.colors.text.inverse};
    border: 1px solid ${({ theme }) => theme.colors.secondary[500]};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.secondary[600]};
      border-color: ${({ theme }) => theme.colors.secondary[600]};
    }

    &:active:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.secondary[700]};
      border-color: ${({ theme }) => theme.colors.secondary[700]};
    }
  `,

  outline: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.primary[500]};
    border: 1px solid ${({ theme }) => theme.colors.primary[500]};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primary[50]};
      color: ${({ theme }) => theme.colors.primary[600]};
      border-color: ${({ theme }) => theme.colors.primary[600]};
    }

    &:active:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.primary[100]};
    }
  `,

  ghost: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.text.primary};
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.neutral[100]};
      color: ${({ theme }) => theme.colors.text.primary};
    }

    &:active:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.neutral[200]};
    }
  `,

  danger: css`
    background-color: ${({ theme }) => theme.colors.error};
    color: ${({ theme }) => theme.colors.text.inverse};
    border: 1px solid ${({ theme }) => theme.colors.error};

    &:hover:not(:disabled) {
      background-color: #dc2626;
      border-color: #dc2626;
    }

    &:active:not(:disabled) {
      background-color: #b91c1c;
      border-color: #b91c1c;
    }
  `,
};

const buttonSizes = {
  sm: css`
    padding: ${({ theme }) => theme.spacing[2]}
      ${({ theme }) => theme.spacing[3]};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    border-radius: ${({ theme }) => theme.borderRadius.md};
  `,

  md: css`
    padding: ${({ theme }) => theme.spacing[3]}
      ${({ theme }) => theme.spacing[4]};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    border-radius: ${({ theme }) => theme.borderRadius.md};
  `,

  lg: css`
    padding: ${({ theme }) => theme.spacing[4]}
      ${({ theme }) => theme.spacing[6]};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  `,

  xl: css`
    padding: ${({ theme }) => theme.spacing[5]}
      ${({ theme }) => theme.spacing[8]};
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  `,
};

/**
 * Styled button component
 */
const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  user-select: none;
  white-space: nowrap;

  /* Apply variant styles */
  ${({ $variant }) => buttonVariants[$variant]}

  /* Apply size styles */
  ${({ $size }) => buttonSizes[$size]}
  
  /* Full width */
  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}
  
  /* Loading state */
  ${({ $loading }) =>
    $loading &&
    css`
      cursor: default;
      pointer-events: none;
      opacity: 0.7;
    `}
  
  /* Disabled state */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    pointer-events: none;
  }

  /* Focus styles */
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary[500]};
    outline-offset: 2px;
  }
`;

/**
 * Loading spinner component
 */
const Spinner = styled.div`
  width: 1em;
  height: 1em;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

/**
 * Button component with multiple variants and sizes
 */
const Button = React.forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <StyledButton
        ref={ref}
        type={type}
        $variant={variant}
        $size={size}
        $fullWidth={fullWidth}
        $loading={loading}
        disabled={disabled || loading}
        className={clsx('btn', className)}
        {...props}
      >
        {loading && <Spinner />}
        {children}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;
