/**
 * SEO optimization utilities for DentalERP
 * Optimización SEO con meta tags, structured data y Open Graph
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Manager for handling meta tags and structured data
 */
export class SEOManager {
  constructor() {
    this.defaultConfig = {
      siteName: 'DentalERP',
      siteUrl: 'https://dentalerp.com',
      defaultTitle: 'DentalERP - Sistema de Gestión Dental',
      defaultDescription: 'Sistema integral de gestión para clínicas dentales con funciones de pacientes, citas, tratamientos y más.',
      defaultImage: '/og-image.jpg',
      twitterHandle: '@dentalerp',
      fbAppId: '',
      locale: 'es_ES',
      type: 'website',
    };
  }

  // Generate meta tags
  generateMetaTags(config = {}) {
    const seoConfig = { ...this.defaultConfig, ...config };
    
    return {
      title: seoConfig.title || seoConfig.defaultTitle,
      description: seoConfig.description || seoConfig.defaultDescription,
      canonical: seoConfig.canonical || `${seoConfig.siteUrl}${seoConfig.path || ''}`,
      openGraph: {
        title: seoConfig.title || seoConfig.defaultTitle,
        description: seoConfig.description || seoConfig.defaultDescription,
        url: seoConfig.canonical || `${seoConfig.siteUrl}${seoConfig.path || ''}`,
        siteName: seoConfig.siteName,
        images: [
          {
            url: seoConfig.image || seoConfig.defaultImage,
            width: 1200,
            height: 630,
            alt: seoConfig.title || seoConfig.defaultTitle,
          }
        ],
        locale: seoConfig.locale,
        type: seoConfig.type,
      },
      twitter: {
        handle: seoConfig.twitterHandle,
        site: seoConfig.twitterHandle,
        cardType: 'summary_large_image',
      },
    };
  }

  // Generate structured data (JSON-LD)
  generateStructuredData(type, data) {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type,
    };

    switch (type) {
      case 'Organization':
        return {
          ...baseData,
          name: data.name || this.defaultConfig.siteName,
          url: data.url || this.defaultConfig.siteUrl,
          logo: data.logo || `${this.defaultConfig.siteUrl}/logo.png`,
          description: data.description || this.defaultConfig.defaultDescription,
          address: data.address,
          telephone: data.telephone,
          email: data.email,
          sameAs: data.socialProfiles || [],
        };

      case 'MedicalOrganization':
        return {
          ...baseData,
          '@type': 'DentistOffice',
          name: data.name,
          url: data.url,
          telephone: data.telephone,
          address: {
            '@type': 'PostalAddress',
            streetAddress: data.address?.street,
            addressLocality: data.address?.city,
            addressRegion: data.address?.state,
            postalCode: data.address?.zip,
            addressCountry: data.address?.country || 'ES',
          },
          openingHours: data.openingHours,
          priceRange: data.priceRange,
          acceptsReservations: true,
          paymentAccepted: data.paymentMethods,
        };

      case 'Service':
        return {
          ...baseData,
          '@type': 'MedicalProcedure',
          name: data.name,
          description: data.description,
          category: 'Dental Services',
          procedureType: data.procedureType,
          bodyLocation: 'Mouth',
          preparation: data.preparation,
          followup: data.followup,
          howPerformed: data.howPerformed,
        };

      case 'Article':
        return {
          ...baseData,
          headline: data.title,
          description: data.description,
          image: data.image,
          author: {
            '@type': 'Person',
            name: data.author?.name,
            jobTitle: data.author?.title,
          },
          publisher: {
            '@type': 'Organization',
            name: this.defaultConfig.siteName,
            logo: {
              '@type': 'ImageObject',
              url: `${this.defaultConfig.siteUrl}/logo.png`,
            },
          },
          datePublished: data.publishedDate,
          dateModified: data.modifiedDate || data.publishedDate,
          mainEntityOfPage: data.url,
        };

      case 'BreadcrumbList':
        return {
          ...baseData,
          itemListElement: data.items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        };

      default:
        return baseData;
    }
  }

  // Generate FAQ structured data
  generateFAQStructuredData(faqs) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  }
}

// Global SEO manager instance
export const seoManager = new SEOManager();

/**
 * SEO Head Component
 * Componente para gestionar meta tags y structured data
 */
export const SEOHead = React.memo(({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  structuredData,
  noIndex = false,
  noFollow = false,
  canonical,
  children,
}) => {
  const metaTags = seoManager.generateMetaTags({
    title,
    description,
    image,
    path: url,
    type,
    canonical,
  });

  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow',
  ].join(', ');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{metaTags.title}</title>
      <meta name="description" content={metaTags.description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={metaTags.canonical} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={metaTags.openGraph.title} />
      <meta property="og:description" content={metaTags.openGraph.description} />
      <meta property="og:url" content={metaTags.openGraph.url} />
      <meta property="og:site_name" content={metaTags.openGraph.siteName} />
      <meta property="og:type" content={metaTags.openGraph.type} />
      <meta property="og:locale" content={metaTags.openGraph.locale} />
      
      {metaTags.openGraph.images.map((img, index) => (
        <React.Fragment key={index}>
          <meta property="og:image" content={img.url} />
          <meta property="og:image:width" content={img.width} />
          <meta property="og:image:height" content={img.height} />
          <meta property="og:image:alt" content={img.alt} />
        </React.Fragment>
      ))}

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content={metaTags.twitter.cardType} />
      <meta name="twitter:site" content={metaTags.twitter.site} />
      <meta name="twitter:creator" content={metaTags.twitter.handle} />
      <meta name="twitter:title" content={metaTags.title} />
      <meta name="twitter:description" content={metaTags.description} />
      <meta name="twitter:image" content={image || seoManager.defaultConfig.defaultImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#0066cc" />
      <meta name="msapplication-TileColor" content="#0066cc" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="DentalERP" />

      {children}
    </Helmet>
  );
});

SEOHead.displayName = 'SEOHead';

/**
 * Page-specific SEO components
 */

// Homepage SEO
export const HomeSEO = () => {
  const organizationData = seoManager.generateStructuredData('Organization', {
    name: 'DentalERP',
    url: 'https://dentalerp.com',
    description: 'Sistema integral de gestión para clínicas dentales',
    address: {
      street: 'Calle Principal 123',
      city: 'Madrid',
      state: 'Madrid',
      zip: '28001',
      country: 'ES',
    },
    telephone: '+34 900 123 456',
    email: 'info@dentalerp.com',
    socialProfiles: [
      'https://www.facebook.com/dentalerp',
      'https://www.twitter.com/dentalerp',
      'https://www.linkedin.com/company/dentalerp',
    ],
  });

  return (
    <SEOHead
      title="DentalERP - Sistema de Gestión Dental Integral"
      description="Gestiona tu clínica dental de forma eficiente con DentalERP. Control de pacientes, citas, tratamientos, facturación y más en una sola plataforma."
      keywords="software dental, gestión clínica dental, sistema dental, ERP dental, citas dentales"
      structuredData={organizationData}
    />
  );
};

// Patients page SEO
export const PatientsSEO = () => (
  <SEOHead
    title="Gestión de Pacientes - DentalERP"
    description="Administra la información completa de tus pacientes de forma segura y eficiente. Historiales médicos, tratamientos y seguimiento personalizado."
    keywords="gestión pacientes dentales, historial médico dental, software pacientes"
    url="/pacientes"
  />
);

// Appointments page SEO
export const AppointmentsSEO = () => (
  <SEOHead
    title="Sistema de Citas Dentales - DentalERP"
    description="Organiza y gestiona las citas de tu clínica dental. Calendario inteligente, recordatorios automáticos y optimización de horarios."
    keywords="citas dentales, agenda dental, calendario clínica dental"
    url="/citas"
  />
);

// Treatments page SEO
export const TreatmentsSEO = () => {
  const serviceData = seoManager.generateStructuredData('Service', {
    name: 'Tratamientos Dentales',
    description: 'Amplia gama de tratamientos dentales profesionales',
    procedureType: 'Dental Care',
    preparation: 'Evaluación previa y planificación personalizada',
    followup: 'Seguimiento post-tratamiento incluido',
  });

  return (
    <SEOHead
      title="Tratamientos Dentales - DentalERP"
      description="Gestiona todos los tratamientos dentales de tu clínica. Planes de tratamiento, seguimiento y resultados en una plataforma integrada."
      keywords="tratamientos dentales, odontología, planes tratamiento dental"
      url="/tratamientos"
      structuredData={serviceData}
    />
  );
};

/**
 * Breadcrumb SEO Component
 */
export const BreadcrumbSEO = React.memo(({ items }) => {
  const breadcrumbData = seoManager.generateStructuredData('BreadcrumbList', { items });

  return (
    <script type="application/ld+json">
      {JSON.stringify(breadcrumbData)}
    </script>
  );
});

BreadcrumbSEO.displayName = 'BreadcrumbSEO';

/**
 * FAQ SEO Component
 */
export const FAQSEO = React.memo(({ faqs }) => {
  const faqData = seoManager.generateFAQStructuredData(faqs);

  return (
    <script type="application/ld+json">
      {JSON.stringify(faqData)}
    </script>
  );
});

FAQSEO.displayName = 'FAQSEO';

/**
 * SEO utilities
 */

// Generate sitemap data
export const generateSitemapData = (routes) => {
  return routes.map(route => ({
    url: `${seoManager.defaultConfig.siteUrl}${route.path}`,
    lastModified: route.lastModified || new Date().toISOString(),
    changeFrequency: route.changeFrequency || 'weekly',
    priority: route.priority || 0.7,
  }));
};

// Optimize images for SEO
export const optimizeImageForSEO = (src, alt) => ({
  src,
  alt,
  title: alt,
  loading: 'lazy',
  decoding: 'async',
});

// Generate rich snippets
export const generateRichSnippet = (type, data) => {
  return seoManager.generateStructuredData(type, data);
};

// SEO audit utilities
export const auditSEO = () => {
  const issues = [];
  
  // Check title
  const title = document.title;
  if (!title) issues.push('Missing title tag');
  else if (title.length > 60) issues.push('Title too long (>60 characters)');
  else if (title.length < 30) issues.push('Title too short (<30 characters)');
  
  // Check meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) issues.push('Missing meta description');
  else {
    const content = metaDescription.getAttribute('content');
    if (content.length > 160) issues.push('Meta description too long (>160 characters)');
    else if (content.length < 120) issues.push('Meta description too short (<120 characters)');
  }
  
  // Check headings
  const h1s = document.querySelectorAll('h1');
  if (h1s.length === 0) issues.push('Missing H1 tag');
  else if (h1s.length > 1) issues.push('Multiple H1 tags found');
  
  // Check images without alt text
  const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
  if (imagesWithoutAlt.length > 0) {
    issues.push(`${imagesWithoutAlt.length} images missing alt text`);
  }
  
  // Check internal links
  const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
  const externalLinks = document.querySelectorAll('a[href^="http"]:not([rel*="noopener"])');
  if (externalLinks.length > 0) {
    issues.push(`${externalLinks.length} external links missing rel="noopener"`);
  }
  
  return {
    score: Math.max(0, 100 - (issues.length * 10)),
    issues,
    suggestions: generateSEOSuggestions(issues),
  };
};

// Generate SEO suggestions
const generateSEOSuggestions = (issues) => {
  const suggestions = [];
  
  issues.forEach(issue => {
    if (issue.includes('title')) {
      suggestions.push('Optimize title length to 50-60 characters with primary keywords');
    }
    if (issue.includes('description')) {
      suggestions.push('Write compelling meta description with call-to-action (120-160 chars)');
    }
    if (issue.includes('H1')) {
      suggestions.push('Use exactly one H1 tag per page with main keyword');
    }
    if (issue.includes('alt text')) {
      suggestions.push('Add descriptive alt text to all images for accessibility and SEO');
    }
    if (issue.includes('external links')) {
      suggestions.push('Add rel="noopener noreferrer" to external links for security');
    }
  });
  
  return [...new Set(suggestions)]; // Remove duplicates
};
