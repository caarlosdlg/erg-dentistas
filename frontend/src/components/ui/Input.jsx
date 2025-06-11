import React from 'react';
import styled, { css } from 'styled-components';
import { clsx } from 'clsx';

/**
 * Input variants and sizes
 */
const inputSizes = {
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
      ${({ theme }) => theme.spacing[5]};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  `,
};

/**
 * Styled input wrapper
 */
const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  width: 100%;
`;

/**
 * Styled label
 */
const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};

  ${({ $required }) =>
    $required &&
    css`
      &::after {
        content: ' *';
        color: ${({ theme }) => theme.colors.error};
      }
    `}
`;

/**
 * Styled input field
 */
const StyledInput = styled.input`
  width: 100%;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  transition: all ${({ theme }) => theme.transition.fast};

  /* Apply size styles */
  ${({ $size }) => inputSizes[$size]}

  /* Placeholder styles */
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  /* Focus styles */
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary[100]};
  }

  /* Hover styles */
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.border.dark};
  }

  /* Error state */
  ${({ $error }) =>
    $error &&
    css`
      border-color: ${({ theme }) => theme.colors.error};

      &:focus {
        border-color: ${({ theme }) => theme.colors.error};
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }
    `}

  /* Success state */
  ${({ $success }) =>
    $success &&
    css`
      border-color: ${({ theme }) => theme.colors.success};

      &:focus {
        border-color: ${({ theme }) => theme.colors.success};
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }
    `}
  
  /* Disabled state */
  &:disabled {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
    color: ${({ theme }) => theme.colors.text.tertiary};
    cursor: not-allowed;
    border-color: ${({ theme }) => theme.colors.border.light};
  }

  /* Full width */
  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}
`;

/**
 * Styled textarea
 */
const StyledTextarea = styled.textarea`
  width: 100%;
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  transition: all ${({ theme }) => theme.transition.fast};
  resize: vertical;
  min-height: 100px;

  /* Apply size styles */
  ${({ $size }) => inputSizes[$size]}

  /* Placeholder styles */
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  /* Focus styles */
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary[100]};
  }

  /* Hover styles */
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.border.dark};
  }

  /* Error state */
  ${({ $error }) =>
    $error &&
    css`
      border-color: ${({ theme }) => theme.colors.error};

      &:focus {
        border-color: ${({ theme }) => theme.colors.error};
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }
    `}

  /* Success state */
  ${({ $success }) =>
    $success &&
    css`
      border-color: ${({ theme }) => theme.colors.success};

      &:focus {
        border-color: ${({ theme }) => theme.colors.success};
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }
    `}
  
  /* Disabled state */
  &:disabled {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
    color: ${({ theme }) => theme.colors.text.tertiary};
    cursor: not-allowed;
    border-color: ${({ theme }) => theme.colors.border.light};
  }
`;

/**
 * Help text component
 */
const HelpText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.tertiary};

  ${({ $error }) =>
    $error &&
    css`
      color: ${({ theme }) => theme.colors.error};
    `}

  ${({ $success }) =>
    $success &&
    css`
      color: ${({ theme }) => theme.colors.success};
    `}
`;

/**
 * Input component with label and help text
 */
const Input = React.forwardRef(
  (
    {
      label,
      helpText,
      error,
      success,
      required = false,
      size = 'md',
      fullWidth = false,
      multiline = false,
      rows = 3,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isError = Boolean(error);
    const isSuccess = Boolean(success);

    const InputComponent = multiline ? StyledTextarea : StyledInput;

    return (
      <InputWrapper className={clsx('input-wrapper', className)}>
        {label && (
          <Label htmlFor={inputId} $required={required}>
            {label}
          </Label>
        )}

        <InputComponent
          ref={ref}
          id={inputId}
          $size={size}
          $fullWidth={fullWidth}
          $error={isError}
          $success={isSuccess}
          rows={multiline ? rows : undefined}
          {...props}
        />

        {(helpText || error) && (
          <HelpText $error={isError} $success={isSuccess}>
            {error || helpText}
          </HelpText>
        )}
      </InputWrapper>
    );
  }
);

Input.displayName = 'Input';

export default Input;
