import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React refresh
      fastRefresh: true,
      // Include JSX runtime optimizations
      jsxRuntime: 'automatic',
    }),
    splitVendorChunkPlugin()
  ],
  
  // Performance optimizations
  build: {
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create separate chunks for vendors
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('styled-components') || id.includes('clsx')) {
              return 'ui-vendor';
            }
            if (id.includes('lucide-react') || id.includes('@heroicons')) {
              return 'icons-vendor';
            }
            if (id.includes('@react-oauth') || id.includes('auth')) {
              return 'auth-vendor';
            }
            if (id.includes('lodash')) {
              return 'utils-vendor';
            }
            // Other vendor libraries
            return 'vendor';
          }
          
          // Create separate chunks for main features
          if (id.includes('/pages/Dashboard')) {
            return 'dashboard';
          }
          if (id.includes('/pages/Pacientes')) {
            return 'patients';
          }
          if (id.includes('/pages/Citas')) {
            return 'appointments';
          }
          if (id.includes('/pages/Tratamientos')) {
            return 'treatments';
          }
          if (id.includes('/components/performance')) {
            return 'performance';
          }
          if (id.includes('/components/ui')) {
            return 'ui-components';
          }
        },
      },
    },
    // Enhanced minification and compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_proto: true,
        passes: 3,
        keep_infinity: true,
        reduce_vars: true,
        collapse_vars: true,
        join_vars: true,
        sequences: true,
        properties: true,
        dead_code: true,
        conditionals: true,
        comparisons: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: true,
        hoist_funs: true,
        hoist_vars: false,
        if_return: true,
        inline: true,
        side_effects: true,
      },
      mangle: {
        safari10: true,
        properties: {
          regex: /^_/
        }
      },
      format: {
        comments: false,
      },
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 600,
    // Target modern browsers for better optimization
    target: ['es2020', 'chrome80', 'firefox78', 'safari13', 'edge88'],
    // Source maps for production debugging (disabled for performance)
    sourcemap: process.env.NODE_ENV === 'development',
    // Asset optimization
    assetsInlineLimit: 2048, // Reduced for better caching
    // CSS code splitting and optimization
    cssCodeSplit: true,
    cssMinify: 'lightningcss',
    // Report bundle size and compression
    reportCompressedSize: true,
    // Modern build features
    modulePreload: {
      polyfill: false,
    },
  },

  // Development optimizations
  server: {
    port: 3000,
    open: true,
    // Enable HMR
    hmr: {
      overlay: true,
    },
    // Faster dependency resolution
    fs: {
      strict: false,
    },
  },

  // Dependency pre-bundling optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'styled-components',
      'clsx',
      '@react-oauth/google',
      'lodash-es',
    ],
    exclude: ['@vitejs/plugin-react'],
  },

  // CSS optimizations
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    // PostCSS optimizations will be handled by Tailwind
    devSourcemap: true,
  },

  // Asset optimization
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp'],

  // Resolve configuration for faster imports
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@hooks': '/src/hooks',
      '@styles': '/src/styles',
      '@utils': '/src/utils',
    },
  },

  // Enable experimental features
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'css') {
        return { runtime: `window.__cssRuntime(${JSON.stringify(filename)})` };
      }
    },
  },
});
