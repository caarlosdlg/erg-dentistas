/**
 * Performance Monitoring Dashboard
 * Panel completo de monitoreo de rendimiento para DentalERP
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ButtonTW, CardTW } from '../ui';
import { PerformanceMonitor, performanceMonitor } from '../../utils/performance';
import { AccessibilityAuditor } from '../../utils/accessibility';
import { auditSEO } from '../../utils/seo';

/**
 * Performance Metrics Card
 */
const MetricsCard = React.memo(({ title, value, unit, status, description, icon }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <CardTW className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{icon}</span>
            <h3 className="font-medium text-gray-900">{title}</h3>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            <span className="text-sm text-gray-500">{unit}</span>
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status || 'N/A'}
        </div>
      </div>
    </CardTW>
  );
});

MetricsCard.displayName = 'MetricsCard';

/**
 * Performance Chart Component
 */
const PerformanceChart = React.memo(({ data, title, type = 'line' }) => {
  if (!data || data.length === 0) {
    return (
      <CardTW className="p-6">
        <h3 className="font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          No hay datos disponibles
        </div>
      </CardTW>
    );
  }

  return (
    <CardTW className="p-6">
      <h3 className="font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-32 flex items-end justify-between gap-1">
        {data.slice(-20).map((point, index) => {
          const height = Math.max(4, (point.value / Math.max(...data.map(d => d.value))) * 100);
          return (
            <div
              key={index}
              className="bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
              style={{ height: `${height}%`, minWidth: '4px' }}
              title={`${point.label}: ${point.value}${point.unit || ''}`}
            />
          );
        })}
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center">
        Últimas {Math.min(20, data.length)} mediciones
      </div>
    </CardTW>
  );
});

PerformanceChart.displayName = 'PerformanceChart';

/**
 * Real-time Performance Monitor
 */
const RealTimeMonitor = React.memo(() => {
  const [metrics, setMetrics] = useState({});
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [history, setHistory] = useState([]);

  const updateMetrics = useCallback(() => {
    const currentMetrics = {
      memory: performanceMonitor.getMemoryInfo(),
      timing: performanceMonitor.getNavigationTiming(),
      connection: performanceMonitor.getConnectionInfo(),
      coreWebVitals: performanceMonitor.getAllMetrics(),
    };

    setMetrics(currentMetrics);
    
    // Add to history
    const timestamp = new Date();
    setHistory(prev => [
      ...prev.slice(-50), // Keep last 50 entries
      {
        timestamp,
        memory: currentMetrics.memory?.usedJSHeapSize || 0,
        timing: currentMetrics.timing?.domContentLoaded || 0,
      }
    ]);
  }, []);

  useEffect(() => {
    let interval;
    if (isMonitoring) {
      interval = setInterval(updateMetrics, 2000);
      updateMetrics(); // Initial update
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring, updateMetrics]);

  const memoryData = history.map((entry, index) => ({
    label: entry.timestamp.toLocaleTimeString(),
    value: entry.memory,
    unit: 'MB'
  }));

  const timingData = history.map((entry, index) => ({
    label: entry.timestamp.toLocaleTimeString(),
    value: entry.timing,
    unit: 'ms'
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Monitor en Tiempo Real</h2>
        <ButtonTW
          onClick={() => setIsMonitoring(!isMonitoring)}
          variant={isMonitoring ? 'outline' : 'primary'}
        >
          {isMonitoring ? '⏸️ Pausar' : '▶️ Iniciar'} Monitor
        </ButtonTW>
      </div>

      {isMonitoring && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceChart
            data={memoryData}
            title="Uso de Memoria"
          />
          <PerformanceChart
            data={timingData}
            title="Tiempo de Carga DOM"
          />
        </div>
      )}

      {metrics.memory && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricsCard
            title="Memoria JS Utilizada"
            value={metrics.memory.usedJSHeapSize}
            icon="💾"
            description="Memoria JavaScript en uso"
          />
          <MetricsCard
            title="Memoria Total JS"
            value={metrics.memory.totalJSHeapSize}
            icon="📊"
            description="Memoria JavaScript total asignada"
          />
          <MetricsCard
            title="Límite de Memoria"
            value={metrics.memory.jsHeapSizeLimit}
            icon="⚠️"
            description="Límite máximo de memoria JS"
          />
        </div>
      )}
    </div>
  );
});

RealTimeMonitor.displayName = 'RealTimeMonitor';

/**
 * Accessibility Audit Panel
 */
const AccessibilityPanel = React.memo(() => {
  const [auditResults, setAuditResults] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const runAccessibilityAudit = useCallback(async () => {
    setIsAuditing(true);
    try {
      const auditor = new AccessibilityAuditor();
      const results = await auditor.runAudit();
      setAuditResults(results);
    } catch (error) {
      console.error('Error running accessibility audit:', error);
    } finally {
      setIsAuditing(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Auditoría de Accesibilidad</h2>
        <ButtonTW
          onClick={runAccessibilityAudit}
          disabled={isAuditing}
          variant="outline"
        >
          {isAuditing ? '🔄 Auditando...' : '🔍 Ejecutar Auditoría'}
        </ButtonTW>
      </div>

      {auditResults && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricsCard
            title="Puntuación General"
            value={auditResults.score}
            unit="/100"
            status={auditResults.level}
            icon="🎯"
            description="Puntuación de accesibilidad WCAG 2.1"
          />
          <MetricsCard
            title="Problemas Encontrados"
            value={auditResults.issues.length}
            status={auditResults.issues.length === 0 ? 'good' : auditResults.issues.length < 5 ? 'needs-improvement' : 'poor'}
            icon="⚠️"
            description="Problemas de accesibilidad detectados"
          />
          <MetricsCard
            title="Elementos Correctos"
            value={auditResults.successes.length}
            status="good"
            icon="✅"
            description="Elementos que cumplen estándares"
          />
        </div>
      )}

      {auditResults?.issues.length > 0 && (
        <CardTW className="p-6">
          <h3 className="font-medium text-gray-900 mb-4">Problemas Detectados</h3>
          <div className="space-y-3">
            {auditResults.issues.slice(0, 5).map((issue, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <span className="text-red-500 mt-0.5">⚠️</span>
                <div className="flex-1">
                  <p className="font-medium text-red-800">{issue.issue}</p>
                  <p className="text-sm text-red-600">
                    Elemento: {issue.element} | WCAG: {issue.wcag} | Severidad: {issue.severity}
                  </p>
                </div>
              </div>
            ))}
            {auditResults.issues.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                Y {auditResults.issues.length - 5} problemas más...
              </p>
            )}
          </div>
        </CardTW>
      )}
    </div>
  );
});

AccessibilityPanel.displayName = 'AccessibilityPanel';

/**
 * SEO Audit Panel
 */
const SEOPanel = React.memo(() => {
  const [seoResults, setSeoResults] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const runSEOAudit = useCallback(() => {
    setIsAuditing(true);
    try {
      const results = auditSEO();
      setSeoResults(results);
    } catch (error) {
      console.error('Error running SEO audit:', error);
    } finally {
      setIsAuditing(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Auditoría SEO</h2>
        <ButtonTW
          onClick={runSEOAudit}
          disabled={isAuditing}
          variant="outline"
        >
          {isAuditing ? '🔄 Auditando...' : '🔍 Ejecutar Auditoría SEO'}
        </ButtonTW>
      </div>

      {seoResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricsCard
            title="Puntuación SEO"
            value={seoResults.score}
            unit="/100"
            status={seoResults.score >= 80 ? 'good' : seoResults.score >= 60 ? 'needs-improvement' : 'poor'}
            icon="🔍"
            description="Puntuación general de SEO"
          />
          <MetricsCard
            title="Problemas SEO"
            value={seoResults.issues.length}
            status={seoResults.issues.length === 0 ? 'good' : seoResults.issues.length < 3 ? 'needs-improvement' : 'poor'}
            icon="📝"
            description="Problemas de optimización encontrados"
          />
        </div>
      )}

      {seoResults?.issues.length > 0 && (
        <CardTW className="p-6">
          <h3 className="font-medium text-gray-900 mb-4">Recomendaciones SEO</h3>
          <div className="space-y-2">
            {seoResults.issues.map((issue, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <span className="text-yellow-500 mt-0.5">•</span>
                <span className="text-gray-700">{issue}</span>
              </div>
            ))}
          </div>
        </CardTW>
      )}

      {seoResults?.suggestions.length > 0 && (
        <CardTW className="p-6">
          <h3 className="font-medium text-gray-900 mb-4">Sugerencias de Mejora</h3>
          <div className="space-y-2">
            {seoResults.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <span className="text-blue-500 mt-0.5">💡</span>
                <span className="text-gray-700">{suggestion}</span>
              </div>
            ))}
          </div>
        </CardTW>
      )}
    </div>
  );
});

SEOPanel.displayName = 'SEOPanel';

/**
 * Bundle Analysis Panel
 */
const BundleAnalysisPanel = React.memo(() => {
  const [bundleInfo, setBundleInfo] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeBundles = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const info = await performanceMonitor.measureBundleSize();
      setBundleInfo(info);
    } catch (error) {
      console.error('Error analyzing bundles:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    analyzeBundles(); // Run on mount
  }, [analyzeBundles]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Análisis de Bundle</h2>
        <ButtonTW
          onClick={analyzeBundles}
          disabled={isAnalyzing}
          variant="outline"
        >
          {isAnalyzing ? '🔄 Analizando...' : '📦 Analizar Bundle'}
        </ButtonTW>
      </div>

      {bundleInfo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricsCard
            title="Tamaño Total"
            value={bundleInfo.total}
            icon="📦"
            description="Tamaño total de recursos transferidos"
          />
          <MetricsCard
            title="JavaScript"
            value={bundleInfo.javascript}
            icon="📜"
            description="Tamaño de archivos JavaScript"
          />
          <MetricsCard
            title="CSS"
            value={bundleInfo.css}
            icon="🎨"
            description="Tamaño de archivos CSS"
          />
        </div>
      )}

      {bundleInfo && (
        <CardTW className="p-6">
          <h3 className="font-medium text-gray-900 mb-4">Estado de Compresión</h3>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              bundleInfo.compression ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {bundleInfo.compression ? '✅ Habilitada' : '❌ Deshabilitada'}
            </span>
            <span className="text-gray-600">Compresión GZIP/Brotli</span>
          </div>
        </CardTW>
      )}
    </div>
  );
});

BundleAnalysisPanel.displayName = 'BundleAnalysisPanel';

/**
 * Main Performance Dashboard
 */
const PerformanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [coreWebVitals, setCoreWebVitals] = useState({});

  // Initialize Core Web Vitals monitoring
  useEffect(() => {
    performanceMonitor.monitorCoreWebVitals();
    
    const interval = setInterval(() => {
      const vitals = performanceMonitor.getAllMetrics();
      setCoreWebVitals(vitals);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', label: '📊 Resumen', icon: '📊' },
    { id: 'realtime', label: '⚡ Tiempo Real', icon: '⚡' },
    { id: 'accessibility', label: '♿ Accesibilidad', icon: '♿' },
    { id: 'seo', label: '🔍 SEO', icon: '🔍' },
    { id: 'bundle', label: '📦 Bundle', icon: '📦' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Dashboard de Rendimiento
          </h1>
          <p className="text-gray-600">
            Monitoreo completo de rendimiento, accesibilidad y SEO para DentalERP
          </p>
        </div>

        {/* Core Web Vitals Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Core Web Vitals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricsCard
              title="Largest Contentful Paint"
              value={coreWebVitals.LCP?.value ? `${coreWebVitals.LCP.value.toFixed(0)}ms` : 'N/A'}
              status={coreWebVitals.LCP?.rating}
              icon="🎯"
              description="Tiempo hasta el contenido principal"
            />
            <MetricsCard
              title="First Input Delay"
              value={coreWebVitals.FID?.value ? `${coreWebVitals.FID.value.toFixed(0)}ms` : 'N/A'}
              status={coreWebVitals.FID?.rating}
              icon="⚡"
              description="Demora en primera interacción"
            />
            <MetricsCard
              title="Cumulative Layout Shift"
              value={coreWebVitals.CLS?.value ? coreWebVitals.CLS.value.toFixed(3) : 'N/A'}
              status={coreWebVitals.CLS?.rating}
              icon="📐"
              description="Estabilidad visual del layout"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Resumen General</h2>
              <p className="text-gray-600">
                Vista general de todas las métricas de rendimiento. Utiliza las pestañas 
                superiores para explorar cada área en detalle.
              </p>
            </div>
          )}
          
          {activeTab === 'realtime' && <RealTimeMonitor />}
          {activeTab === 'accessibility' && <AccessibilityPanel />}
          {activeTab === 'seo' && <SEOPanel />}
          {activeTab === 'bundle' && <BundleAnalysisPanel />}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
