import React, { useState, useEffect } from 'react';


/**
 * Enhanced Responsive Design Showcase
 * Demonstrates comprehensive responsive behavior across all components and layouts
 */
const ResponsiveShowcase = () => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState('unknown');
  const [modalOpen, setModalOpen] = useState(false);

  // Breakpoint detection
  useEffect(() => {
    const getBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) return 'xs (< 640px)';
      if (width < 768) return 'sm (640px - 767px)';
      if (width < 1024) return 'md (768px - 1023px)';
      if (width < 1280) return 'lg (1024px - 1279px)';
      if (width < 1536) return 'xl (1280px - 1535px)';
      return '2xl (≥ 1536px)';
    };

    const updateBreakpoint = () => setCurrentBreakpoint(getBreakpoint());
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Responsive Navigation */}
      <ResponsiveNavbar
        variant="primary"
        position="sticky"
        brand={
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary-600 font-bold text-sm sm:text-base">D</span>
            </div>
            <span className="text-white font-semibold text-lg sm:text-xl">
              DentalERP Responsive
            </span>
          </div>
        }
      >
        <NavLink href="#layout">Layout</NavLink>
        <NavLink href="#typography">Typography</NavLink>
        <NavLink href="#components">Components</NavLink>
        <NavLink href="#forms">Forms</NavLink>
        <NavButton variant="outline" size="sm">
          Login
        </NavButton>
      </ResponsiveNavbar>

      {/* Breakpoint Indicator */}
      <div className="fixed bottom-4 left-4 z-50">
        <Badge variant="info" className="shadow-lg">
          Current: {currentBreakpoint}
        </Badge>
      </div>

      {/* Hero Section */}
      <ResponsiveContainer size="default" padding="lg" className="py-12 sm:py-16 lg:py-20">
        <div className="text-center">
          <H1 color="primary" className="mb-4 sm:mb-6">
            Responsive Design System
          </H1>
          <Lead className="mb-8 sm:mb-12 max-w-3xl mx-auto">
            A comprehensive demonstration of responsive UI components built with Tailwind CSS, 
            optimized for mobile, tablet, and desktop experiences.
          </Lead>
          
          <ResponsiveFlex 
            direction="col-sm-row" 
            justify="center" 
            gap="sm" 
            className="mb-12"
          >
            <Button 
              size="lg"
              mobileOptimized
              responsiveFullWidth={{ default: true, sm: false }}
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              mobileOptimized
              responsiveFullWidth={{ default: true, sm: false }}
              onClick={() => setModalOpen(true)}
            >
              View Demo
            </Button>
          </ResponsiveFlex>
        </div>
      </ResponsiveContainer>

      {/* Layout Demonstration */}
      <section id="layout" className="py-12 sm:py-16 lg:py-20 bg-white">
        <ResponsiveContainer>
          <H2 className="mb-8 sm:mb-12 text-center">Responsive Layouts</H2>
          
          {/* Auto-fit Grid */}
          <div className="mb-12">
            <H3 className="mb-6">Auto-fit Grid Layout</H3>
            <ResponsiveGrid autoFit minItemWidth="280px" gap="lg">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card 
                  key={i} 
                  variant="elevated"
                  responsiveSize={{
                    default: 'sm',
                    sm: 'md',
                    lg: 'lg'
                  }}
                  mobileOptimized
                >
                  <H3 size="lg" className="mb-2">Card {i}</H3>
                  <Body size="sm" color="secondary">
                    This card adapts to available space using CSS Grid auto-fit.
                    Resize your browser to see the responsive behavior.
                  </Body>
                </Card>
              ))}
            </ResponsiveGrid>
          </div>

          {/* Responsive Column Grid */}
          <div className="mb-12">
            <H3 className="mb-6">Responsive Column Grid</H3>
            <ResponsiveGrid 
              cols={{ default: 1, sm: 2, lg: 3, xl: 4 }} 
              gap="default"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Card key={i} variant="outlined" className="h-32 flex items-center justify-center">
                  <Body className="font-semibold">Item {i}</Body>
                </Card>
              ))}
            </ResponsiveGrid>
          </div>

          {/* Responsive Flex Layouts */}
          <div className="mb-12">
            <H3 className="mb-6">Responsive Flex Layouts</H3>
            
            <div className="space-y-8">
              {/* Stack to Row */}
              <div>
                <Body className="mb-4 font-semibold">Stack (mobile) → Row (desktop)</Body>
                <ResponsiveFlex direction="col-lg-row" gap="default" className="p-6 bg-neutral-50 rounded-lg">
                  <Card variant="filled" className="flex-1">
                    <Body>Content A</Body>
                  </Card>
                  <Card variant="filled" className="flex-1">
                    <Body>Content B</Body>
                  </Card>
                  <Card variant="filled" className="flex-1">
                    <Body>Content C</Body>
                  </Card>
                </ResponsiveFlex>
              </div>

              {/* Responsive Stack */}
              <div>
                <Body className="mb-4 font-semibold">Responsive Stack with Spacing</Body>
                <ResponsiveStack 
                  direction="vertical-sm-horizontal" 
                  spacing="lg" 
                  align="center"
                  className="p-6 bg-neutral-50 rounded-lg"
                >
                  <Button variant="primary">Action 1</Button>
                  <Button variant="secondary">Action 2</Button>
                  <Button variant="outline">Action 3</Button>
                </ResponsiveStack>
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Typography Section */}
      <section id="typography" className="py-12 sm:py-16 lg:py-20 bg-neutral-50">
        <ResponsiveContainer>
          <H2 className="mb-8 sm:mb-12 text-center">Responsive Typography</H2>
          
          <div className="space-y-8">
            <div>
              <H1>Heading 1 - Responsive Scale</H1>
              <Body color="secondary" className="mt-2">
                Scales from 2xl on mobile to 5xl on large screens
              </Body>
            </div>
            
            <div>
              <H2>Heading 2 - Adaptive Sizing</H2>
              <Body color="secondary" className="mt-2">
                Scales from xl on mobile to 4xl on large screens
              </Body>
            </div>
            
            <div>
              <H3>Heading 3 - Fluid Typography</H3>
              <Body color="secondary" className="mt-2">
                Scales from lg on mobile to 3xl on large screens
              </Body>
            </div>
            
            <div>
              <Lead>
                This is lead text that provides an engaging introduction to content.
                It scales responsively and maintains optimal readability across devices.
              </Lead>
            </div>
            
            <div>
              <Body>
                This is body text that forms the main content. It uses responsive sizing
                to ensure comfortable reading on any device, from mobile phones to large
                desktop monitors. The line height and spacing adapt accordingly.
              </Body>
            </div>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Components Section */}
      <section id="components" className="py-12 sm:py-16 lg:py-20 bg-white">
        <ResponsiveContainer>
          <H2 className="mb-8 sm:mb-12 text-center">Responsive Components</H2>
          
          {/* Button Examples */}
          <div className="mb-12">
            <H3 className="mb-6">Responsive Buttons</H3>
            <div className="space-y-6">
              <div>
                <Body className="mb-4 font-semibold">Mobile Full-width → Desktop Auto-width</Body>
                <ResponsiveFlex direction="col-sm-row" gap="sm">
                  <Button 
                    variant="primary"
                    responsiveFullWidth={{ default: true, sm: false }}
                    mobileOptimized
                  >
                    Primary Action
                  </Button>
                  <Button 
                    variant="outline"
                    responsiveFullWidth={{ default: true, sm: false }}
                    mobileOptimized
                  >
                    Secondary Action
                  </Button>
                </ResponsiveFlex>
              </div>
              
              <div>
                <Body className="mb-4 font-semibold">Responsive Button Sizes</Body>
                <ResponsiveFlex direction="col-sm-row" gap="sm" align="center">
                  <Button 
                    responsiveSize={{
                      default: 'sm',
                      sm: 'md',
                      lg: 'lg'
                    }}
                    mobileOptimized
                  >
                    Adaptive Size
                  </Button>
                  <Button 
                    variant="secondary"
                    responsiveSize={{
                      default: 'xs',
                      sm: 'sm',
                      lg: 'md'
                    }}
                    mobileOptimized
                  >
                    Scaling Button
                  </Button>
                </ResponsiveFlex>
              </div>
            </div>
          </div>

          {/* Card Examples */}
          <div className="mb-12">
            <H3 className="mb-6">Responsive Cards</H3>
            <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="lg">
              <Card 
                variant="elevated"
                responsiveSize={{
                  default: 'sm',
                  sm: 'md',
                  lg: 'lg'
                }}
                mobileOptimized
                interactive
                header={<H3>Adaptive Card</H3>}
                footer={
                  <Button 
                    size="sm" 
                    fullWidth 
                    mobileOptimized
                  >
                    Action
                  </Button>
                }
              >
                <Body>
                  This card changes padding and border radius based on screen size.
                  Try resizing your browser to see the effect.
                </Body>
              </Card>
              
              <Card 
                variant="outlined"
                responsiveSize={{
                  default: 'sm',
                  sm: 'md',
                  lg: 'lg'
                }}
                mobileOptimized
                interactive
                header={<H3>Mobile Optimized</H3>}
                footer={
                  <Button 
                    variant="outline"
                    size="sm" 
                    fullWidth 
                    mobileOptimized
                  >
                    Learn More
                  </Button>
                }
              >
                <Body>
                  Touch-friendly interactions and optimized spacing for mobile devices.
                </Body>
              </Card>

              <Card 
                variant="gradient"
                responsiveSize={{
                  default: 'sm',
                  sm: 'md',
                  lg: 'lg'
                }}
                mobileOptimized
                interactive
                header={<H3 color="accent">Featured</H3>}
                footer={
                  <Button 
                    variant="primary"
                    size="sm" 
                    fullWidth 
                    mobileOptimized
                  >
                    Get Started
                  </Button>
                }
              >
                <Body>
                  Beautiful gradient background with responsive behavior and animations.
                </Body>
              </Card>
            </ResponsiveGrid>
          </div>
        </ResponsiveContainer>
      </section>

      {/* Forms Section */}
      <section id="forms" className="py-12 sm:py-16 lg:py-20 bg-neutral-50">
        <ResponsiveContainer size="lg">
          <H2 className="mb-8 sm:mb-12 text-center">Responsive Forms</H2>
          
          <Card variant="elevated" className="max-w-2xl mx-auto">
            <H3 className="mb-6">Contact Form</H3>
            
            <form className="space-y-6">
              {/* Responsive Grid Layout */}
              <ResponsiveGrid cols={{ default: 1, sm: 2 }} gap="default">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm sm:text-base"
                    placeholder="Enter first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm sm:text-base"
                    placeholder="Enter last name"
                  />
                </div>
              </ResponsiveGrid>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm sm:text-base"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm sm:text-base resize-none"
                  placeholder="Enter your message"
                ></textarea>
              </div>
              
              <ResponsiveFlex direction="col-sm-row" justify="end" gap="sm">
                <Button 
                  variant="outline"
                  responsiveFullWidth={{ default: true, sm: false }}
                  mobileOptimized
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary"
                  responsiveFullWidth={{ default: true, sm: false }}
                  mobileOptimized
                >
                  Send Message
                </Button>
              </ResponsiveFlex>
            </form>
          </Card>
        </ResponsiveContainer>
      </section>

      {/* Responsive Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Responsive Modal Demo"
        size="lg"
        mobileFullScreen={true}
      >
        <div className="space-y-6">
          <Body>
            This modal demonstrates responsive behavior:
          </Body>
          
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Full-screen on mobile devices</li>
            <li>• Centered with padding on tablets and desktop</li>
            <li>• Touch-optimized close button</li>
            <li>• Responsive padding and typography</li>
            <li>• Adaptive content layout</li>
          </ul>
          
          <ResponsiveGrid cols={{ default: 1, sm: 2 }} gap="sm">
            <Card variant="outlined" size="sm">
              <Body size="sm">
                Mobile-first design ensures optimal experience on all devices.
              </Body>
            </Card>
            <Card variant="outlined" size="sm">
              <Body size="sm">
                Responsive components adapt to available space automatically.
              </Body>
            </Card>
          </ResponsiveGrid>
          
          <ResponsiveFlex direction="col-sm-row" justify="end" gap="sm">
            <Button 
              variant="outline"
              responsiveFullWidth={{ default: true, sm: false }}
              onClick={() => setModalOpen(false)}
              mobileOptimized
            >
              Close
            </Button>
            <Button 
              variant="primary"
              responsiveFullWidth={{ default: true, sm: false }}
              mobileOptimized
            >
              Confirm
            </Button>
          </ResponsiveFlex>
        </div>
      </Modal>
    </div>
  );
};

export default ResponsiveShowcase;
