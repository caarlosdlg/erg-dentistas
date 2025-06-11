/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Paleta de colores personalizada para DentalERP
      colors: {
        // Colores primarios (azul dental)
        primary: {
          50: '#e6f3ff',
          100: '#b3daff',
          200: '#80c1ff',
          300: '#4da8ff',
          400: '#1a8fff',
          500: '#0066cc', // Color principal
          600: '#0052a3',
          700: '#003d7a',
          800: '#002952',
          900: '#001429',
        },
        
        // Colores secundarios (verde médico)
        secondary: {
          50: '#e6f7f1',
          100: '#b3e6d1',
          200: '#80d5b1',
          300: '#4dc491',
          400: '#1ab371',
          500: '#009951', // Color secundario principal
          600: '#007a41',
          700: '#005b31',
          800: '#003c20',
          900: '#001d10',
        },

        // Colores neutros actualizados
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },

        // Colores de estado
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',

        // Fondos semánticos
        background: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
        },

        // Textos semánticos
        text: {
          primary: '#0f172a',
          secondary: '#475569',
          tertiary: '#64748b',
          inverse: '#ffffff',
        },

        // Bordes
        border: {
          light: '#e2e8f0',
          medium: '#cbd5e1',
          dark: '#94a3b8',
        },
      },

      // Tipografía personalizada
      fontFamily: {
        'primary': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'secondary': ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'mono': ['Fira Code', 'ui-monospace', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'monospace'],
      },

      // Espaciado extendido
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },

      // Sombras personalizadas
      boxShadow: {
        'dental': '0 4px 14px 0 rgba(0, 102, 204, 0.1)',
        'dental-lg': '0 10px 25px -3px rgba(0, 102, 204, 0.1), 0 4px 6px -2px rgba(0, 102, 204, 0.05)',
        'medical': '0 4px 14px 0 rgba(0, 153, 81, 0.1)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },

      // Animaciones personalizadas
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      // Radios de borde extendidos
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },

      // Grid extendido
      gridTemplateColumns: {
        '16': 'repeat(16, minmax(0, 1fr))',
        'footer': '200px minmax(900px, 1fr) 100px',
      },

      // Z-index personalizado
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
