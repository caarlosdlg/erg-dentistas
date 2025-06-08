import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveFlex,
  H1, H2, H3, Body,
  Button,
  Card,
  Badge
} from '../components/ui';
import { 
  runResponsiveTests, 
  getCurrentBreakpointInfo, 
  DEVICE_VIEWPORTS 
} from '../utils/responsiveTests';
import MobileOptimizations from '../components/MobileOptimizations';

/**
 * Responsive Testing Dashboard
 * Comprehensive testing interface for responsive design validation
 */
const ResponsiveTestPage = () => {
  const [testResults, setTestResults] = useState(null);
  const [breakpointInfo, setBreakpointInfo] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Update breakpoint info and run tests
  const updateTests = () => {
    const results = runResponsiveTests();
    setTestResults(results);
    setBreakpointInfo(results.breakpointInfo);
  };

  useEffect(() => {
    updateTests();
    
    if (autoRefresh) {
      const interval = setInterval(updateTests, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (autoRefresh) {
        setTimeout(updateTests, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [autoRefresh]);

  return (
    <ResponsiveContainer className="py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <H1 className="mb-4">📱 Responsive Design Testing</H1>
          <Body className="text-neutral-600 mb-6">
            Real-time testing and validation of responsive design components
          </Body>
          
          <ResponsiveFlex className="justify-center gap-4">
            <Button 
              onClick={updateTests}
              variant="primary"
              mobileOptimized
            >
              🔄 Run Tests
            </Button>
            <Button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "success" : "secondary"}
              mobileOptimized
            >
              {autoRefresh ? "🟢 Auto-refresh ON" : "🔴 Auto-refresh OFF"}
            </Button>
          </ResponsiveFlex>
        </div>

        {/* Current Breakpoint Info */}
        {breakpointInfo && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <H3 className="text-blue-600 mb-2">Current Breakpoint</H3>
                <Badge 
                  variant="primary" 
                  className="text-lg font-bold px-4 py-2"
                >
                  {breakpointInfo.breakpoint.toUpperCase()}
                </Badge>
                <Body className="text-sm text-neutral-600 mt-2">
                  {breakpointInfo.description}
                </Body>
              </div>
              
              <div className="text-center">
                <H3 className="text-green-600 mb-2">Viewport Size</H3>
                <Body className="font-mono text-lg">
                  {breakpointInfo.width} × {breakpointInfo.height}
                </Body>
                <Body className="text-sm text-neutral-600">
                  Ratio: {breakpointInfo.aspectRatio}
                </Body>
              </div>
              
              <div className="text-center">
                <H3 className="text-purple-600 mb-2">Device Type</H3>
                <Body className="font-semibold">
                  {breakpointInfo.isMobile ? "📱 Mobile" : 
                   breakpointInfo.isTablet ? "📓 Tablet" : 
                   "🖥️ Desktop"}
                </Body>
              </div>
              
              <div className="text-center">
                <H3 className="text-orange-600 mb-2">Touch Mode</H3>
                <Body className="font-semibold">
                  {breakpointInfo.isMobile || breakpointInfo.isTablet ? 
                    "👆 Touch Enabled" : "🖱️ Mouse/Keyboard"}
                </Body>
              </div>
            </div>
          </Card>
        )}

        {/* Test Results */}
        {testResults && (
          <Card>
            <H2 className="mb-6">🧪 Test Results</H2>
            
            {/* Summary */}
            <div className="mb-6 p-4 rounded-lg bg-neutral-50">
              <ResponsiveFlex className="items-center gap-4">
                <div className="flex-1">
                  <H3>Overall Score</H3>
                  <Body className="text-neutral-600">
                    {testResults.summary.passed} / {testResults.summary.total} tests passed
                  </Body>
                </div>
                <Badge 
                  variant={testResults.summary.percentage >= 80 ? "success" : 
                          testResults.summary.percentage >= 60 ? "warning" : "danger"}
                  className="text-2xl px-6 py-3"
                >
                  {testResults.summary.percentage}%
                </Badge>
              </ResponsiveFlex>
            </div>

            {/* Individual Tests */}
            <ResponsiveGrid cols="1 md:2" gap="4">
              {testResults.tests.map((test, index) => (
                <Card 
                  key={index}
                  className={`border-l-4 ${
                    test.passed 
                      ? 'border-l-green-500 bg-green-50' 
                      : 'border-l-red-500 bg-red-50'
                  }`}
                >
                  <ResponsiveFlex className="items-start gap-3">
                    <div className="flex-shrink-0 text-2xl">
                      {test.passed ? '✅' : '❌'}
                    </div>
                    <div className="flex-1">
                      <H3 className={test.passed ? 'text-green-700' : 'text-red-700'}>
                        {test.name}
                      </H3>
                      <Body className="text-neutral-600 mt-1">
                        {test.details}
                      </Body>
                    </div>
                  </ResponsiveFlex>
                </Card>
              ))}
            </ResponsiveGrid>
          </Card>
        )}

        {/* Device Viewport Examples */}
        <Card>
          <H2 className="mb-6">📱 Common Device Viewports</H2>
          <Body className="text-neutral-600 mb-6">
            Resize your browser window to test these common device sizes:
          </Body>
          
          <ResponsiveGrid cols="1 sm:2 lg:3" gap="4">
            {Object.entries(DEVICE_VIEWPORTS).map(([key, device]) => (
              <Card 
                key={key}
                className="border hover:shadow-md transition-shadow"
              >
                <H3 className="mb-2">{device.name}</H3>
                <Body className="font-mono text-sm text-neutral-600 mb-3">
                  {device.width} × {device.height}
                </Body>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    // For demo purposes - in real testing, you'd use browser dev tools
                    alert(`Test with ${device.name} viewport: ${device.width}×${device.height}px\n\nUse browser dev tools to simulate this device size.`);
                  }}
                >
                  Test Size
                </Button>
              </Card>
            ))}
          </ResponsiveGrid>
        </Card>

        {/* Component Showcase Grid */}
        <Card>
          <H2 className="mb-6">🎯 Component Responsiveness</H2>
          <Body className="text-neutral-600 mb-6">
            Test how components adapt across different screen sizes:
          </Body>
          
          <div className="space-y-6">
            {/* Button Responsiveness */}
            <div>
              <H3 className="mb-4">Buttons</H3>
              <ResponsiveFlex className="gap-3 flex-wrap">
                <Button variant="primary" mobileOptimized>Primary</Button>
                <Button variant="secondary" mobileOptimized>Secondary</Button>
                <Button variant="outline" mobileOptimized>Outline</Button>
                <Button variant="ghost" mobileOptimized>Ghost</Button>
              </ResponsiveFlex>
            </div>

            {/* Responsive Grid Example */}
            <div>
              <H3 className="mb-4">Responsive Grid</H3>
              <ResponsiveGrid cols="1 sm:2 md:3 lg:4" gap="4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <Card key={num} className="text-center">
                    <Body className="font-bold">Item {num}</Body>
                  </Card>
                ))}
              </ResponsiveGrid>
            </div>

            {/* Responsive Typography */}
            <div>
              <H3 className="mb-4">Typography Scaling</H3>
              <div className="space-y-3">
                <H1>Responsive H1 Title</H1>
                <H2>Responsive H2 Subtitle</H2>
                <H3>Responsive H3 Section</H3>
                <Body>Responsive body text that adapts to screen size.</Body>
              </div>
            </div>
          </div>
        </Card>

        {/* Mobile Optimizations */}
        <MobileOptimizations />

        {/* Testing Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <H2 className="text-blue-800 mb-4">📋 Testing Instructions</H2>
          <div className="space-y-3 text-blue-700">
            <Body>
              <strong>1. Resize Browser:</strong> Drag the browser window to test different widths
            </Body>
            <Body>
              <strong>2. Use Dev Tools:</strong> Press F12 and use device simulation mode
            </Body>
            <Body>
              <strong>3. Test Touch:</strong> Verify all interactive elements are at least 44px
            </Body>
            <Body>
              <strong>4. Check Breakpoints:</strong> Watch how layouts change at 640px, 768px, 1024px, etc.
            </Body>
            <Body>
              <strong>5. Verify Navigation:</strong> Test mobile menu functionality
            </Body>
          </div>
        </Card>
      </div>
    </ResponsiveContainer>
  );
};

export default ResponsiveTestPage;
