import React from 'react';
import styled, { css } from 'styled-components';
import { clsx } from 'clsx';

/**
 * Card variants and sizes
 */
const cardVariants = {
  default: css`
    background-color: ${({ theme }) => theme.colors.background.primary};
    border: 1px solid ${({ theme }) => theme.colors.border.light};
    box-shadow: ${({ theme }) => theme.boxShadow.sm};
  `,

  elevated: css`
    background-color: ${({ theme }) => theme.colors.background.primary};
    border: 1px solid ${({ theme }) => theme.colors.border.light};
    box-shadow: ${({ theme }) => theme.boxShadow.md};
  `,

  outlined: css`
    background-color: ${({ theme }) => theme.colors.background.primary};
    border: 2px solid ${({ theme }) => theme.colors.border.medium};
    box-shadow: none;
  `,

  filled: css`
    background-color: ${({ theme }) => theme.colors.background.secondary};
    border: 1px solid transparent;
    box-shadow: none;
  `,
};

const cardSizes = {
  sm: css`
    padding: ${({ theme }) => theme.spacing[4]};
    border-radius: ${({ theme }) => theme.borderRadius.md};
  `,

  md: css`
    padding: ${({ theme }) => theme.spacing[6]};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
  `,

  lg: css`
    padding: ${({ theme }) => theme.spacing[8]};
    border-radius: ${({ theme }) => theme.borderRadius.xl};
  `,
};

/**
 * Styled card component
 */
const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  transition: all ${({ theme }) => theme.transition.fast};

  /* Apply variant styles */
  ${({ $variant }) => cardVariants[$variant]}

  /* Apply size styles */
  ${({ $size }) => cardSizes[$size]}
  
  /* Hoverable effect */
  ${({ $hoverable }) =>
    $hoverable &&
    css`
      cursor: pointer;

      &:hover {
        box-shadow: ${({ theme }) => theme.boxShadow.lg};
        transform: translateY(-2px);
      }
    `}
  
  /* Clickable effect */
  ${({ $clickable }) =>
    $clickable &&
    css`
      cursor: pointer;

      &:active {
        transform: translateY(1px);
      }
    `}
`;

/**
 * Card header component
 */
const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding-bottom: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

/**
 * Card title component
 */
const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

/**
 * Card subtitle component
 */
const CardSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.tertiary};
  margin: 0;
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

/**
 * Card content component
 */
const CardContent = styled.div`
  flex: 1;
  color: ${({ theme }) => theme.colors.text.secondary};

  /* Remove margin from last child */
  > *:last-child {
    margin-bottom: 0;
  }
`;

/**
 * Card footer component
 */
const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing[4]};
  padding-top: ${({ theme }) => theme.spacing[4]};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};

  &:first-child {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }
`;

/**
 * Main Card component
 */
const Card = React.forwardRef(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      hoverable = false,
      clickable = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <StyledCard
        ref={ref}
        $variant={variant}
        $size={size}
        $hoverable={hoverable}
        $clickable={clickable}
        className={clsx('card', className)}
        {...props}
      >
        {children}
      </StyledCard>
    );
  }
);

Card.displayName = 'Card';

// Attach sub-components
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Subtitle = CardSubtitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
