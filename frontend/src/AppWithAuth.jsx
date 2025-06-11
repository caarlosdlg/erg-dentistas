import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './styles';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components';
import ProtectedRoute, { PublicRoute } from './components/auth/ProtectedRoute';
import { Dashboard, Pacientes, Citas, Tratamientos, Busqueda } from './pages';
import LoginPage from './pages/LoginPage';
import DesignSystemDemo from './pages/DesignSystemDemo';

// Configuración de Google OAuth
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "test-client-id.apps.googleusercontent.com";

/**
 * Main App component with Authentication
 * Sets up routing, authentication, and theme for the dental ERP system
 */
function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  } 
                />

                {/* Protected Routes */}
                <Route 
                  path="/*" 
                  element={
                    <ProtectedRoute>
                      <ProtectedApp />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </div>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

/**
 * Protected App Component
 * Contains the main application layout with navigation
 */
function ProtectedApp() {
  return (
    <>
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/citas" element={<Citas />} />
          <Route path="/tratamientos" element={<Tratamientos />} />
          <Route path="/busqueda" element={<Busqueda />} />
          <Route path="/design-system" element={<DesignSystemDemo />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
