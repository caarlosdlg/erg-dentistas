import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, H2, H3, Body, Card, Button, Badge } from '../components/ui';

/**
 * Mobile Performance Optimization Component
 * Provides tools and utilities for optimizing responsive design on mobile devices
 */
const MobileOptimizations = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [touchCapabilities, setTouchCapabilities] = useState(null);
  const [viewportInfo, setViewportInfo] = useState(null);

  useEffect(() => {
    // Gather performance metrics
    const gatherMetrics = () => {
      const performance = window.performance;
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      setPerformanceMetrics({
        memory: navigator.deviceMemory || 'Unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
        connection: connection ? {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        } : null,
        loadTime: performance.timing ? 
          (performance.timing.loadEventEnd - performance.timing.navigationStart) : 'Unknown'
      });

      // Touch capabilities
      setTouchCapabilities({
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        maxTouchPoints: navigator.maxTouchPoints || 0,
        pointerEvents: window.PointerEvent !== undefined,
        orientation: screen.orientation ? screen.orientation.type : 'Unknown'
      });

      // Viewport information
      setViewportInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth
      });
    };

    gatherMetrics();
    
    // Update on orientation change
    window.addEventListener('orientationchange', gatherMetrics);
    window.addEventListener('resize', gatherMetrics);
    
    return () => {
      window.removeEventListener('orientationchange', gatherMetrics);
      window.removeEventListener('resize', gatherMetrics);
    };
  }, []);

  return (
    <ResponsiveContainer className="py-8">
      <div className="space-y-6">
        <div className="text-center">
          <H2 className="mb-4">📱 Mobile Performance Optimization</H2>
          <Body className="text-neutral-600">
            Real-time mobile device capabilities and performance metrics
          </Body>
        </div>

        {/* Device Capabilities */}
        {touchCapabilities && (
          <Card>
            <H3 className="mb-4">👆 Touch & Input Capabilities</H3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Body className="font-medium">Touch Support:</Body>
                  <Badge variant={touchCapabilities.touchSupport ? "success" : "secondary"}>
                    {touchCapabilities.touchSupport ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <Body className="font-medium">Max Touch Points:</Body>
                  <Badge variant="info">{touchCapabilities.maxTouchPoints}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Body className="font-medium">Pointer Events:</Body>
                  <Badge variant={touchCapabilities.pointerEvents ? "success" : "secondary"}>
                    {touchCapabilities.pointerEvents ? "Supported" : "Not Supported"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <Body className="font-medium">Orientation:</Body>
                  <Badge variant="info">{touchCapabilities.orientation}</Badge>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Viewport Information */}
        {viewportInfo && (
          <Card>
            <H3 className="mb-4">📺 Viewport & Display</H3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-3">
                <div className="text-center">
                  <Body className="font-medium text-neutral-600">Viewport Size</Body>
                  <div className="font-mono text-lg font-bold">
                    {viewportInfo.width} × {viewportInfo.height}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-center">
                  <Body className="font-medium text-neutral-600">Device Pixel Ratio</Body>
                  <div className="font-mono text-lg font-bold">
                    {viewportInfo.devicePixelRatio}x
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-center">
                  <Body className="font-medium text-neutral-600">Color Depth</Body>
                  <div className="font-mono text-lg font-bold">
                    {viewportInfo.colorDepth}-bit
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Performance Metrics */}
        {performanceMetrics && (
          <Card>
            <H3 className="mb-4">⚡ Performance Metrics</H3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Body className="font-medium">Device Memory:</Body>
                  <Badge variant="info">
                    {performanceMetrics.memory !== 'Unknown' 
                      ? `${performanceMetrics.memory} GB` 
                      : 'Unknown'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <Body className="font-medium">CPU Cores:</Body>
                  <Badge variant="info">{performanceMetrics.hardwareConcurrency}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <Body className="font-medium">Page Load Time:</Body>
                  <Badge variant={performanceMetrics.loadTime < 3000 ? "success" : "warning"}>
                    {typeof performanceMetrics.loadTime === 'number' 
                      ? `${performanceMetrics.loadTime}ms` 
                      : 'Unknown'}
                  </Badge>
                </div>
              </div>
              
              {performanceMetrics.connection && (
                <div className="space-y-4">
                  <H3 className="text-lg">🌐 Network Connection</H3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Body className="font-medium">Connection Type:</Body>
                      <Badge variant="info">{performanceMetrics.connection.effectiveType}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <Body className="font-medium">Downlink:</Body>
                      <Badge variant="info">{performanceMetrics.connection.downlink} Mbps</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <Body className="font-medium">RTT:</Body>
                      <Badge variant="info">{performanceMetrics.connection.rtt}ms</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Mobile Optimization Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <H3 className="text-blue-800 mb-4">💡 Mobile Optimization Tips</H3>
          <div className="space-y-3 text-blue-700">
            <Body>
              <strong>Touch Targets:</strong> Ensure all interactive elements are at least 44px for optimal touch interaction
            </Body>
            <Body>
              <strong>Performance:</strong> Use lazy loading for images and components below the fold
            </Body>
            <Body>
              <strong>Typography:</strong> Use relative units (rem, em) for better text scaling across devices
            </Body>
            <Body>
              <strong>Images:</strong> Implement responsive images with srcset for optimal loading
            </Body>
            <Body>
              <strong>Network:</strong> Consider connection quality and implement progressive enhancement
            </Body>
            <Body>
              <strong>Orientation:</strong> Test and optimize for both portrait and landscape orientations
            </Body>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <H3 className="mb-4">🔧 Quick Actions</H3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 text-left"
              onClick={() => {
                if (navigator.vibrate) {
                  navigator.vibrate(200);
                  alert('Vibration test completed!');
                } else {
                  alert('Vibration not supported on this device');
                }
              }}
            >
              <div>
                <div className="font-semibold">Test Vibration</div>
                <div className="text-sm text-neutral-600">Check haptic feedback</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 text-left"
              onClick={() => {
                if (screen.orientation && screen.orientation.lock) {
                  screen.orientation.lock('portrait').catch(() => {
                    alert('Orientation lock not supported');
                  });
                } else {
                  alert('Orientation API not supported');
                }
              }}
            >
              <div>
                <div className="font-semibold">Lock Portrait</div>
                <div className="text-sm text-neutral-600">Test orientation lock</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 text-left"
              onClick={() => {
                const element = document.documentElement;
                if (element.requestFullscreen) {
                  element.requestFullscreen().catch(() => {
                    alert('Fullscreen not supported');
                  });
                } else {
                  alert('Fullscreen API not supported');
                }
              }}
            >
              <div>
                <div className="font-semibold">Fullscreen Test</div>
                <div className="text-sm text-neutral-600">Test fullscreen mode</div>
              </div>
            </Button>
          </div>
        </Card>
      </div>
    </ResponsiveContainer>
  );
};

export default MobileOptimizations;
