# Frontend - Sistema Dental ERP

Este es el frontend del sistema de gestión dental ERP, construido con React y Vite.

## 🚀 Configuración del Proyecto

### Tecnologías utilizadas

- **React 19** - Biblioteca de JavaScript para interfaces de usuario
- **Vite** - Herramienta de construcción rápida para desarrollo moderno
- **ESLint** - Herramienta de análisis de código estático
- **Prettier** - Formateador de código automático

### Instalación

1. Clona el repositorio
2. Navega al directorio frontend:
   ```bash
   cd frontend
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```

### Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la construcción de producción
- `npm run lint` - Ejecuta ESLint para encontrar problemas
- `npm run lint:fix` - Ejecuta ESLint y corrige automáticamente los problemas
- `npm run format` - Formatea el código con Prettier
- `npm run format:check` - Verifica si el código está formateado correctamente

## 📁 Estructura del Proyecto

```
frontend/
├── public/              # Archivos estáticos públicos
├── src/                 # Código fuente
│   ├── components/      # Componentes reutilizables
│   ├── pages/          # Páginas de la aplicación
│   ├── hooks/          # Hooks personalizados
│   ├── services/       # Servicios API
│   ├── utils/          # Utilidades
│   ├── styles/         # Estilos globales
│   └── main.jsx        # Punto de entrada
├── .vscode/            # Configuración de VS Code
├── .prettierrc         # Configuración de Prettier
├── .prettierignore     # Archivos ignorados por Prettier
├── eslint.config.js    # Configuración de ESLint
└── vite.config.js      # Configuración de Vite
```

## 🛠️ Configuración de Desarrollo

### VS Code

Se incluyen configuraciones recomendadas para VS Code:

- Formateo automático al guardar
- Corrección automática de ESLint
- Extensiones recomendadas

### Reglas de Código

- **Prettier**: Formateo automático consistente
- **ESLint**: Detección de errores y mejores prácticas
- **React Hooks**: Reglas específicas para hooks de React

## 🌐 Desarrollo

El servidor de desarrollo se ejecuta en `http://localhost:5173/` por defecto.

```bash
npm run dev
```

## 📝 Contribución

1. Asegúrate de que el código pase las verificaciones de ESLint
2. Formatea el código con Prettier antes de hacer commit
3. Sigue las convenciones de naming establecidas

## 🔧 Configuración del Editor

Para una mejor experiencia de desarrollo, instala las siguientes extensiones de VS Code:

- Prettier - Code formatter
- ESLint
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Path Intellisense
