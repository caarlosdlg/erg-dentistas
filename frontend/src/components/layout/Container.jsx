import React from 'react';
import styled, { css } from 'styled-components';
import { clsx } from 'clsx';

/**
 * Container sizes
 */
const containerSizes = {
  sm: css`
    max-width: 640px;
  `,

  md: css`
    max-width: 768px;
  `,

  lg: css`
    max-width: 1024px;
  `,

  xl: css`
    max-width: 1280px;
  `,

  '2xl': css`
    max-width: 1536px;
  `,

  full: css`
    max-width: 100%;
  `,
};

/**
 * Styled container component
 */
const StyledContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  padding-left: ${({ theme }) => theme.spacing[4]};
  padding-right: ${({ theme }) => theme.spacing[4]};

  /* Apply size constraints */
  ${({ $maxWidth }) => containerSizes[$maxWidth]}

  /* Responsive padding */
  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding-left: ${({ theme }) => theme.spacing[6]};
    padding-right: ${({ theme }) => theme.spacing[6]};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding-left: ${({ theme }) => theme.spacing[8]};
    padding-right: ${({ theme }) => theme.spacing[8]};
  }

  /* Center content */
  ${({ $center }) =>
    $center &&
    css`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `}

  /* No padding */
  ${({ $noPadding }) =>
    $noPadding &&
    css`
      padding-left: 0;
      padding-right: 0;
    `}
`;

/**
 * Container component for consistent page layout
 */
const Container = React.forwardRef(
  (
    {
      children,
      maxWidth = 'xl',
      center = false,
      noPadding = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <StyledContainer
        ref={ref}
        $maxWidth={maxWidth}
        $center={center}
        $noPadding={noPadding}
        className={clsx('container', className)}
        {...props}
      >
        {children}
      </StyledContainer>
    );
  }
);

Container.displayName = 'Container';

export default Container;
