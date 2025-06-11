import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Main application components
import DentalERP from '../pages/DentalERP';
import LoginPage from '../pages/LoginPage';

// Patient management components
import Pacientes from '../pages/pacientes/Pacientes';
import ExpedientePaciente from '../pages/pacientes/ExpedientePaciente';
import NuevoPaciente from '../pages/pacientes/NuevoPaciente';

// Demo pages
import DesignSystemDemo from '../pages/DesignSystemDemo';
import DesignSystemTest from '../pages/DesignSystemTest';
import ResponsiveDemo from '../pages/ResponsiveDemo';
import ResponsiveShowcase from '../pages/ResponsiveShowcase';

// Other pages
import Dashboard from '../pages/Dashboard';
import Citas from '../pages/Citas';
import Tratamientos from '../pages/Tratamientos';
import Inventario from '../pages/Inventario';

const AppRouter = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Demo routes */}
            <Route path="/demo/design-system" element={<DesignSystemDemo />} />
            <Route path="/demo/design-test" element={<DesignSystemTest />} />
            <Route path="/demo/responsive" element={<ResponsiveDemo />} />
            <Route path="/demo/showcase" element={<ResponsiveShowcase />} />
            
            {/* Protected application routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DentalERP />
              </ProtectedRoute>
            }>
              {/* Nested routes for the main app */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Patient management routes */}
              <Route path="pacientes" element={<Pacientes />} />
              <Route path="pacientes/:id/expediente" element={<ExpedientePaciente />} />
              <Route path="pacientes/nuevo" element={<NuevoPaciente />} />
              
              {/* Other module routes */}
              <Route path="citas" element={<Citas />} />
              <Route path="tratamientos" element={<Tratamientos />} />
              <Route path="inventario" element={<Inventario />} />
            </Route>
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default AppRouter;
