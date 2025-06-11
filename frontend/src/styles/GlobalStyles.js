import { createGlobalStyle } from 'styled-components';

/**
 * Global styles using styled-components
 * Combines CSS reset, typography, and utility classes
 */
const GlobalStyles = createGlobalStyle`
  /* Import Google Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap');

  /* CSS Reset */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* HTML and Body */
  html {
    height: 100%;
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    height: 100%;
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* Root element */
  #root {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.typography.fontFamily.secondary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
  }

  h1 { font-size: ${({ theme }) => theme.typography.fontSize['4xl']}; }
  h2 { font-size: ${({ theme }) => theme.typography.fontSize['3xl']}; }
  h3 { font-size: ${({ theme }) => theme.typography.fontSize['2xl']}; }
  h4 { font-size: ${({ theme }) => theme.typography.fontSize.xl}; }
  h5 { font-size: ${({ theme }) => theme.typography.fontSize.lg}; }
  h6 { font-size: ${({ theme }) => theme.typography.fontSize.base}; }

  p {
    margin-bottom: ${({ theme }) => theme.spacing[4]};
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  /* Links */
  a {
    color: ${({ theme }) => theme.colors.primary[500]};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transition.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.primary[600]};
      text-decoration: underline;
    }

    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.primary[500]};
      outline-offset: 2px;
    }
  }

  /* Lists */
  ul, ol {
    padding-left: ${({ theme }) => theme.spacing[6]};
    margin-bottom: ${({ theme }) => theme.spacing[4]};
  }

  li {
    margin-bottom: ${({ theme }) => theme.spacing[1]};
  }

  /* Images */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* Forms */
  input, textarea, select, button {
    font-family: inherit;
    font-size: inherit;
  }

  /* Focus styles */
  *:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary[500]};
    outline-offset: 2px;
  }

  button:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary[500]};
    outline-offset: 2px;
  }

  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.neutral[100]};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.neutral[300]};
    border-radius: ${({ theme }) => theme.borderRadius.full};

    &:hover {
      background: ${({ theme }) => theme.colors.neutral[400]};
    }
  }

  /* Selection styling */
  ::selection {
    background-color: ${({ theme }) => theme.colors.primary[100]};
    color: ${({ theme }) => theme.colors.primary[800]};
  }

  ::-moz-selection {
    background-color: ${({ theme }) => theme.colors.primary[100]};
    color: ${({ theme }) => theme.colors.primary[800]};
  }
`;

export default GlobalStyles;
