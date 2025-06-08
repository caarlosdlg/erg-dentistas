# DentalERP Frontend

Professional dental practice management system frontend built with React, Vite, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎨 Design System

This project implements a comprehensive design system with:

- **Tailwind CSS v3.4.17** for utility-first styling
- **Custom dental-themed color palette** (primary blue #0066cc, secondary green #009951)
- **50+ reusable UI components** with consistent branding
- **Professional typography** using Inter and Poppins fonts
- **Responsive mobile-first design**

### View Design System
Visit `http://localhost:5173/` to see the design system demo and test components.

## 📁 Project Structure

```
src/
├── components/ui/          # Reusable UI components
│   ├── Button.jsx         # Button variants and states
│   ├── Card.jsx           # Card layouts
│   ├── Input.jsx          # Form inputs
│   ├── Modal.jsx          # Modal dialogs
│   └── ...               # Additional components
├── pages/                 # Page components
├── styles/                # CSS and styling
└── App.jsx               # Main application
```

## 🧩 Available Components

- **Forms:** Button, Input, Textarea, Select
- **Layout:** Card, Modal, Navigation
- **Display:** Badge, Loading, Table
- **Feedback:** Alerts, Notifications

See [Component Documentation](./src/components/ui/README.md) for detailed usage.

## 🛠 Technologies

- **React 19.1.0** - UI library
- **Vite 6.3.5** - Build tool and dev server
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **ESLint** - Code linting

## 📚 Documentation

- [Design System Status](./DESIGN_SYSTEM_STATUS.md) - Implementation details
- [Component Library](./src/components/ui/README.md) - Component usage guide

## 🔧 Development

### Adding New Components
1. Create component in `src/components/ui/`
2. Export from `src/components/ui/index.js`
3. Add to demo in `src/pages/DesignSystemDemo.jsx`
4. Document usage in component README

### Customizing Design
- Colors: Edit `tailwind.config.js`
- Components: Modify `src/styles/tailwind.css`
- Typography: Update font imports and config

## 🎯 Status

✅ **COMPLETED - Tarea 4: Diseño Gráfico Básico y Coherencia de Marca**

- Complete design system implementation
- All UI components functional
- Tailwind CSS properly configured
- Professional dental branding
- Responsive design system
- Comprehensive documentation
