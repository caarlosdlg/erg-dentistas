import React from 'react';
import styled, { css } from 'styled-components';
import { clsx } from 'clsx';

/**
 * Grid container component
 */
const StyledGrid = styled.div`
  display: grid;
  width: 100%;

  /* Grid template columns */
  ${({ $cols }) =>
    $cols &&
    css`
      grid-template-columns: repeat(${$cols}, 1fr);
    `}

  /* Grid template rows */
  ${({ $rows }) =>
    $rows &&
    css`
      grid-template-rows: repeat(${$rows}, 1fr);
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
  
  /* Responsive grid */
  ${({ $responsive }) =>
    $responsive &&
    css`
      grid-template-columns: 1fr;

      @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
        grid-template-columns: repeat(3, 1fr);
      }

      @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
        grid-template-columns: repeat(4, 1fr);
      }
    `}
  
  /* Auto fit */
  ${({ $autoFit, $minColWidth }) =>
    $autoFit &&
    css`
      grid-template-columns: repeat(
        auto-fit,
        minmax(${$minColWidth || '250px'}, 1fr)
      );
    `}
  
  /* Auto fill */
  ${({ $autoFill, $minColWidth }) =>
    $autoFill &&
    css`
      grid-template-columns: repeat(
        auto-fill,
        minmax(${$minColWidth || '250px'}, 1fr)
      );
    `}
`;

/**
 * Grid item component
 */
const StyledGridItem = styled.div`
  /* Column span */
  ${({ $colSpan }) =>
    $colSpan &&
    css`
      grid-column: span ${$colSpan};
    `}

  /* Row span */
  ${({ $rowSpan }) =>
    $rowSpan &&
    css`
      grid-row: span ${$rowSpan};
    `}
  
  /* Column start */
  ${({ $colStart }) =>
    $colStart &&
    css`
      grid-column-start: ${$colStart};
    `}
  
  /* Column end */
  ${({ $colEnd }) =>
    $colEnd &&
    css`
      grid-column-end: ${$colEnd};
    `}
  
  /* Row start */
  ${({ $rowStart }) =>
    $rowStart &&
    css`
      grid-row-start: ${$rowStart};
    `}
  
  /* Row end */
  ${({ $rowEnd }) =>
    $rowEnd &&
    css`
      grid-row-end: ${$rowEnd};
    `}
  
  /* Justify self */
  ${({ $justifySelf }) =>
    $justifySelf &&
    css`
      justify-self: ${$justifySelf};
    `}
  
  /* Align self */
  ${({ $alignSelf }) =>
    $alignSelf &&
    css`
      align-self: ${$alignSelf};
    `}
`;

/**
 * Grid component for creating grid layouts
 */
const Grid = React.forwardRef(
  (
    {
      children,
      cols,
      rows,
      gap = 4,
      colGap,
      rowGap,
      responsive = false,
      autoFit = false,
      autoFill = false,
      minColWidth,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <StyledGrid
        ref={ref}
        $cols={cols}
        $rows={rows}
        $gap={gap}
        $colGap={colGap}
        $rowGap={rowGap}
        $responsive={responsive}
        $autoFit={autoFit}
        $autoFill={autoFill}
        $minColWidth={minColWidth}
        className={clsx('grid', className)}
        {...props}
      >
        {children}
      </StyledGrid>
    );
  }
);

/**
 * Grid item component
 */
const GridItem = React.forwardRef(
  (
    {
      children,
      colSpan,
      rowSpan,
      colStart,
      colEnd,
      rowStart,
      rowEnd,
      justifySelf,
      alignSelf,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <StyledGridItem
        ref={ref}
        $colSpan={colSpan}
        $rowSpan={rowSpan}
        $colStart={colStart}
        $colEnd={colEnd}
        $rowStart={rowStart}
        $rowEnd={rowEnd}
        $justifySelf={justifySelf}
        $alignSelf={alignSelf}
        className={clsx('grid-item', className)}
        {...props}
      >
        {children}
      </StyledGridItem>
    );
  }
);

Grid.displayName = 'Grid';
GridItem.displayName = 'GridItem';

// Attach GridItem as a sub-component
Grid.Item = GridItem;

export default Grid;
