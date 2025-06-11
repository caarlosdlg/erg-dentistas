import React from 'react';
import styled, { css } from 'styled-components';
import { clsx } from 'clsx';

/**
 * Styled flex container
 */
const StyledFlex = styled.div`
  display: flex;

  /* Flex direction */
  ${({ $direction }) =>
    $direction &&
    css`
      flex-direction: ${$direction};
    `}

  /* Justify content */
  ${({ $justify }) =>
    $justify &&
    css`
      justify-content: ${$justify};
    `}
  
  /* Align items */
  ${({ $align }) =>
    $align &&
    css`
      align-items: ${$align};
    `}
  
  /* Align content */
  ${({ $alignContent }) =>
    $alignContent &&
    css`
      align-content: ${$alignContent};
    `}
  
  /* Flex wrap */
  ${({ $wrap }) =>
    $wrap &&
    css`
      flex-wrap: ${$wrap === true ? 'wrap' : $wrap};
    `}
  
  /* Gap */
  ${({ $gap, theme }) =>
    $gap &&
    css`
      gap: ${theme.spacing[$gap] || $gap};
    `}
  
  /* Column gap */
  ${({ $colGap, theme }) =>
    $colGap &&
    css`
      column-gap: ${theme.spacing[$colGap] || $colGap};
    `}
  
  /* Row gap */
  ${({ $rowGap, theme }) =>
    $rowGap &&
    css`
      row-gap: ${theme.spacing[$rowGap] || $rowGap};
    `}
  
  /* Full width */
  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}
  
  /* Full height */
  ${({ $fullHeight }) =>
    $fullHeight &&
    css`
      height: 100%;
    `}
  
  /* Center content (shorthand) */
  ${({ $center }) =>
    $center &&
    css`
      justify-content: center;
      align-items: center;
    `}
  
  /* Responsive direction */
  ${({ $responsive }) =>
    $responsive &&
    css`
      flex-direction: column;

      @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
        flex-direction: row;
      }
    `}
`;

/**
 * Styled flex item
 */
const StyledFlexItem = styled.div`
  /* Flex grow */
  ${({ $grow }) =>
    $grow !== undefined &&
    css`
      flex-grow: ${$grow === true ? 1 : $grow};
    `}

  /* Flex shrink */
  ${({ $shrink }) =>
    $shrink !== undefined &&
    css`
      flex-shrink: ${$shrink === true ? 1 : $shrink};
    `}
  
  /* Flex basis */
  ${({ $basis }) =>
    $basis &&
    css`
      flex-basis: ${$basis};
    `}
  
  /* Flex shorthand */
  ${({ $flex }) =>
    $flex &&
    css`
      flex: ${$flex === true ? '1' : $flex};
    `}
  
  /* Align self */
  ${({ $alignSelf }) =>
    $alignSelf &&
    css`
      align-self: ${$alignSelf};
    `}
  
  /* Order */
  ${({ $order }) =>
    $order !== undefined &&
    css`
      order: ${$order};
    `}
`;

/**
 * Flex container component
 */
const Flex = React.forwardRef(
  (
    {
      children,
      direction = 'row',
      justify = 'flex-start',
      align = 'stretch',
      alignContent,
      wrap = false,
      gap,
      colGap,
      rowGap,
      fullWidth = false,
      fullHeight = false,
      center = false,
      responsive = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <StyledFlex
        ref={ref}
        $direction={direction}
        $justify={justify}
        $align={align}
        $alignContent={alignContent}
        $wrap={wrap}
        $gap={gap}
        $colGap={colGap}
        $rowGap={rowGap}
        $fullWidth={fullWidth}
        $fullHeight={fullHeight}
        $center={center}
        $responsive={responsive}
        className={clsx('flex', className)}
        {...props}
      >
        {children}
      </StyledFlex>
    );
  }
);

/**
 * Flex item component
 */
const FlexItem = React.forwardRef(
  (
    {
      children,
      grow,
      shrink,
      basis,
      flex,
      alignSelf,
      order,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <StyledFlexItem
        ref={ref}
        $grow={grow}
        $shrink={shrink}
        $basis={basis}
        $flex={flex}
        $alignSelf={alignSelf}
        $order={order}
        className={clsx('flex-item', className)}
        {...props}
      >
        {children}
      </StyledFlexItem>
    );
  }
);

Flex.displayName = 'Flex';
FlexItem.displayName = 'FlexItem';

// Attach FlexItem as a sub-component
Flex.Item = FlexItem;

export default Flex;
