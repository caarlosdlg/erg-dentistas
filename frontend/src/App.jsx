import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './styles';
import { Navigation } from './components';
import { 
  AccessibilityProvider,
  FeedbackProvider, 
  NavigationProvider,
  NavigationPageTransition,
  OfflineStatus,
  PWAInstallPrompt,
  KeyboardShortcuts,
} from './components/ux';
import { 
  preloadCriticalRoutes, 
  PerformanceDashboard,
  BundleOptimizer,
  PerformanceWrapper
} from './components/performance';
import { registerServiceWorker } from './utils/serviceWorker';
import { performanceMonitor } from './utils/performance';

// Import performance CSS for optimizations
import './styles/performance.css';

// Lazy load pages for better performance
import { 
  Dashboard, 
  Pacientes, 
  Citas, 
  Tratamientos, 
  Busqueda,
  DesignSystemDemo,
} from './components/performance/LazyComponents';

// Import showcase page directly (not critical for initial load)
import PerformanceUXShowcase from './pages/PerformanceUXShowcase';

// Preload critical routes on app initialization
preloadCriticalRoutes();

/**
 * Main App component with enhanced UX and performance optimizations
 * Sets up routing, theme, and UX providers for the dental ERP system
 */
function App() {
  // Initialize performance monitoring and service worker
  useEffect(() => {
    // Start performance monitoring
    performanceMonitor.monitorCoreWebVitals();
    
    // Register service worker for PWA functionality
    registerServiceWorker().then(registration => {
      if (registration) {
        console.log('✅ Service Worker registered successfully');
      }
    }).catch(error => {
      console.error('❌ Service Worker registration failed:', error);
    });

    // Log initial performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        const report = performanceMonitor.generateReport();
        console.group('🚀 Initial Performance Report');
        console.table(report.metrics);
        console.log('Navigation Timing:', report.timing);
        console.log('Memory Info:', report.memory);
        console.groupEnd();
      }, 2000);
    }
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider>
        <AccessibilityProvider>
          <FeedbackProvider>
            <Router>
              <NavigationProvider>
                <KeyboardShortcuts>
                  <PerformanceWrapper>
                    <BundleOptimizer>
                      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
                        {/* PWA Install Prompt */}
                        <PWAInstallPrompt variant="banner" />
                        
                        {/* Offline Status Indicator */}
                        <OfflineStatus variant="badge" />
                        
                        {/* Navigation */}
                        <Navigation />

                        {/* Main Content with page transitions */}
                        <main id="main-content" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                          <NavigationPageTransition>
                            <Routes>
                              <Route path="/" element={<Dashboard />} />
                              <Route path="/pacientes" element={<Pacientes />} />
                              <Route path="/citas" element={<Citas />} />
                              <Route path="/tratamientos" element={<Tratamientos />} />
                              <Route path="/busqueda" element={<Busqueda />} />
                              <Route path="/design-system" element={<DesignSystemDemo />} />
                              <Route path="/performance-ux" element={<PerformanceUXShowcase />} />
                              <Route path="/performance-dashboard" element={<PerformanceDashboard />} />
                            </Routes>
                          </NavigationPageTransition>
                        </main>
                      </div>
                    </BundleOptimizer>
                  </PerformanceWrapper>
                </KeyboardShortcuts>
              </NavigationProvider>
            </Router>
          </FeedbackProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
