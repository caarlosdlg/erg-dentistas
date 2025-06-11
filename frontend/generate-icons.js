#!/usr/bin/env node

/**
 * Icon Generator for DentalERP PWA
 * Generates all required icon sizes using SVG to PNG conversion
 */

const fs = require('fs');
const path = require('path');

// Define all required icon sizes from manifest.json
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG template for DentalERP icon
const createIconSVG = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0066cc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#004499;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#grad)" />
  
  <!-- Tooth icon -->
  <g transform="translate(${size * 0.2}, ${size * 0.15}) scale(${size * 0.006})">
    <path d="M50 10 C70 10 85 25 85 45 C85 55 80 65 75 75 C70 85 65 95 50 100 C35 95 30 85 25 75 C20 65 15 55 15 45 C15 25 30 10 50 10 Z" 
          fill="white" 
          stroke="none"/>
    
    <!-- Tooth details -->
    <circle cx="35" cy="35" r="3" fill="#0066cc"/>
    <circle cx="65" cy="35" r="3" fill="#0066cc"/>
    <path d="M30 60 Q50 75 70 60" stroke="#0066cc" stroke-width="2" fill="none"/>
  </g>
  
  <!-- App name -->
  <text x="${size/2}" y="${size * 0.85}" text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.08}" 
        font-weight="bold" 
        fill="white">ERP</text>
</svg>
`.trim();

// Generate all icon sizes
iconSizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const fileName = `public/icons/icon-${size}x${size}.svg`;
  
  fs.writeFileSync(fileName, svgContent);
  console.log(`✅ Generated ${fileName}`);
});

// Create favicon
const faviconSVG = createIconSVG(32);
fs.writeFileSync('public/favicon.svg', faviconSVG);
console.log('✅ Generated public/favicon.svg');

// Create Apple touch icon
const appleTouchSVG = createIconSVG(180);
fs.writeFileSync('public/icons/apple-touch-icon.svg', appleTouchSVG);
console.log('✅ Generated public/icons/apple-touch-icon.svg');

// Create maskable icon (with safe zone)
const createMaskableIconSVG = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="maskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0066cc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#004499;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Safe zone background -->
  <rect x="0" y="0" width="${size}" height="${size}" fill="url(#maskGrad)" />
  
  <!-- Tooth icon (centered with safe zone) -->
  <g transform="translate(${size * 0.3}, ${size * 0.25}) scale(${size * 0.004})">
    <path d="M50 10 C70 10 85 25 85 45 C85 55 80 65 75 75 C70 85 65 95 50 100 C35 95 30 85 25 75 C20 65 15 55 15 45 C15 25 30 10 50 10 Z" 
          fill="white" 
          stroke="none"/>
    
    <!-- Tooth details -->
    <circle cx="35" cy="35" r="3" fill="#0066cc"/>
    <circle cx="65" cy="35" r="3" fill="#0066cc"/>
    <path d="M30 60 Q50 75 70 60" stroke="#0066cc" stroke-width="2" fill="none"/>
  </g>
  
  <!-- App name -->
  <text x="${size/2}" y="${size * 0.75}" text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.06}" 
        font-weight="bold" 
        fill="white">DentalERP</text>
</svg>
`.trim();

const maskableIconSVG = createMaskableIconSVG(512);
fs.writeFileSync('public/icons/maskable-icon-512x512.svg', maskableIconSVG);
console.log('✅ Generated public/icons/maskable-icon-512x512.svg');

console.log('\n🎨 Icon generation complete!');
console.log('\n📝 Note: SVG icons generated. For production, consider converting to PNG using a tool like:');
console.log('   npm install -g svg-to-png');
console.log('   or use online converters for better browser compatibility');
