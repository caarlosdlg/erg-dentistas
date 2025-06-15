# DentalERP - Frontend Only

Sistema de gestión dental desarrollado con **React + Vite** y **Tailwind CSS**.

## 🚀 Tecnologías

- **React 18** - Framework de interfaz de usuario
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **React Router** - Navegación entre páginas
- **Axios** - Cliente HTTP para APIs

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── auth/         # Componentes de autenticación
│   │   ├── categories/   # Gestión de categorías
│   │   ├── pacientes/    # Gestión de pacientes
│   │   ├── reviews/      # Sistema de reseñas
│   │   └── ui/          # Componentes de UI
│   ├── pages/            # Páginas principales
│   ├── contexts/         # Context API para estado global
│   ├── hooks/           # Custom hooks
│   ├── services/        # Servicios API
│   └── styles/          # Estilos CSS
├── public/              # Archivos estáticos
└── package.json         # Dependencias y scripts
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio:**
```bash
git clone -b frontend-only https://github.com/caarlosdlg/erg-dentistas.git
cd erg-dentistas
```

2. **Instalar dependencias:**
```bash
cd frontend
npm install
```

3. **Configurar variables de entorno:**
```bash
# Crear archivo .env en /frontend/
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

4. **Iniciar servidor de desarrollo:**
```bash
npm run dev
```

## 🌐 Configuración de API

El frontend está configurado para conectarse a diferentes backends:

### Desarrollo Local
```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    secure: false,
  },
}
```

### Producción
```javascript
// Configurar en .env
VITE_API_BASE_URL=https://tu-backend.com/api
```

## 📱 Características Principales

### ✅ Sistema de Autenticación
- Login con usuarios demo
- Autenticación OAuth (GitHub)
- Login por email
- Registro de dentistas

### 🏥 Gestión Dental
- **Pacientes**: CRUD completo con expedientes
- **Citas**: Sistema de agendamiento
- **Tratamientos**: Catálogo jerárquico
- **Inventario**: Control de suministros
- **Reseñas**: Sistema de evaluaciones

### 🎨 Interfaz de Usuario
- **Diseño responsivo** - Mobile-first
- **Sistema de diseño** consistente
- **Navegación intuitiva**
- **Componentes reutilizables**

### 🔍 Funcionalidades Avanzadas
- **Búsqueda en tiempo real**
- **Filtros dinámicos**
- **Categorías jerárquicas**
- **Optimización de imágenes**
- **Gestión de estados**

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor desarrollo en puerto 5173

# Construcción
npm run build        # Build para producción
npm run preview      # Preview del build

# Testing
npm run test         # Ejecutar tests (si están configurados)

# Linting
npm run lint         # Verificar código con ESLint
```

## 📂 Componentes Principales

### Páginas
- `LoginPage.jsx` - Página de inicio de sesión
- `Dashboard.jsx` - Panel principal
- `Pacientes.jsx` - Gestión de pacientes
- `Citas.jsx` - Sistema de citas
- `Tratamientos.jsx` - Catálogo de tratamientos
- `Inventario.jsx` - Control de inventario

### Componentes
- `Navigation.jsx` - Barra de navegación
- `AuthHeader.jsx` - Header con autenticación
- `RegistroDentista.jsx` - Registro de nuevos dentistas
- `CategoryTree.jsx` - Árbol de categorías
- `OptimizedImage.jsx` - Componente de imágenes optimizadas

## 🎯 Configuración de Desarrollo

### Hot Reload
El servidor de desarrollo incluye hot reload automático:
```javascript
// vite.config.js
server: {
  host: true,
  port: 5173,
  hmr: true
}
```

### Variables de Entorno
```bash
# .env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GITHUB_CLIENT_ID=Ov23liJNJLbSggKfbHCe
VITE_APP_NAME=DentalERP
```

## 🌐 Deploy

### Build para Producción
```bash
npm run build
```
Genera archivos optimizados en `/dist`

### Deploy en Vercel/Netlify
1. Conectar repositorio
2. Configurar build command: `npm run build`
3. Configurar output directory: `dist`
4. Configurar variables de entorno

## 🔧 Personalización

### Tailwind CSS
Configuración en `tailwind.config.js`:
```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
      }
    }
  }
}
```

### Rutas
Configuración en `src/router/AppRouter.jsx`:
```javascript
<Routes>
  <Route path="/" element={<LoginPage />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/pacientes" element={<Pacientes />} />
</Routes>
```

## 📝 Documentación Adicional

- [Guía de Diseño Responsivo](frontend/RESPONSIVE_DESIGN_GUIDE.md)
- [Sistema de Diseño](frontend/DESIGN_SYSTEM_STATUS.md)
- [Tareas Frontend](frontend/TAREAS_FRONTEND_COMPLETADAS.md)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles.

---

**Desarrollado con ❤️ para la gestión dental moderna**
