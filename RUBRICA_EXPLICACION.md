# Aplicación de la rúbrica en el proyecto "erg-dentistas"

Este documento detalla cómo cada criterio de la rúbrica académica se aplica en el proyecto fullstack Django "erg-dentistas". Se incluyen evidencias, rutas de archivos y explicaciones para cada funcionalidad implementada.

## 1. **Estructura jerárquica de categorías**
### Evidencia:
- Archivo: `/backend/categorias/models.py`
- Archivo: `/backend/create_hierarchical_structure.py`

### Explicación:
La estructura jerárquica de categorías se implementa utilizando el modelo `Category` en el archivo `/backend/categorias/models.py`. Este modelo permite la creación de categorías anidadas. Además, el script `/backend/create_hierarchical_structure.py` genera automáticamente una jerarquía de categorías para pruebas y configuración inicial.

---

## 2. **Configuración de Docker**
### Evidencia:
- Archivo: `/backend/Dockerfile`
- Archivo: `/backend/docker-compose.yml`

### Explicación:
El proyecto utiliza Docker para la configuración del entorno de desarrollo y producción. El archivo `/backend/Dockerfile` define la imagen base y las dependencias necesarias para ejecutar el backend. Por otro lado, `/backend/docker-compose.yml` configura los servicios de Docker, incluyendo la base de datos y el servidor web.

---

## 3. **Configuración de la base de datos**
### Evidencia:
- Archivo: `/backend/dental_erp/settings.py`
- Archivo: `/backend/.env`

### Explicación:
La configuración de la base de datos se encuentra en el archivo `/backend/dental_erp/settings.py`, donde se especifican los parámetros de conexión. Las credenciales sensibles se almacenan en el archivo `.env` para mayor seguridad.

---

## 4. **Sistema de correos electrónicos**
### Evidencia:
- Archivo: `/backend/emails/views.py`

### Explicación:
El sistema de correos electrónicos permite enviar notificaciones y recordatorios a los usuarios. La lógica para enviar correos se encuentra en el archivo `/backend/emails/views.py`, utilizando bibliotecas como `smtplib` y configuraciones específicas.

---

## 5. **Sistema de reseñas**
### Evidencia:
- Archivo: `/backend/reviews/models.py`

### Explicación:
El modelo `Review` en `/backend/reviews/models.py` permite a los usuarios dejar reseñas sobre los servicios. Este modelo incluye campos como calificación, comentario y fecha.

---

## 6. **Manejo de imágenes**
### Evidencia:
- Archivo: `/backend/imagenes/models.py`

### Explicación:
El manejo de imágenes se realiza mediante el modelo `Image` en `/backend/imagenes/models.py`, que permite subir y almacenar imágenes relacionadas con los servicios y usuarios.

---

## 7. **Uso de UUIDs**
### Evidencia:
- Archivo: `/backend/dental_erp/settings.py`

### Explicación:
Los UUIDs se utilizan como identificadores únicos para los modelos principales, garantizando mayor seguridad y escalabilidad en el sistema.

---

## 8. **Sistema de plantillas**
### Evidencia:
- Archivo: `/backend/dental_erp/settings.py`

### Explicación:
El sistema de plantillas de Django se utiliza para renderizar vistas dinámicas. Las configuraciones de plantillas se encuentran en `/backend/dental_erp/settings.py`.

---

## 9. **Autenticación**
### Evidencia:
- Archivo: `/frontend/src/components/auth/GitHubLoginButton.jsx`

### Explicación:
El proyecto incluye autenticación mediante GitHub, implementada en el componente React `/frontend/src/components/auth/GitHubLoginButton.jsx`.

---

## 10. **Sistema de diseño**
### Evidencia:
- Archivo: `/frontend/src/pages/DesignSystemDemo.jsx`
- Archivo: `/frontend/tailwind.config.js`

### Explicación:
El sistema de diseño utiliza Tailwind CSS para estilos consistentes y modernos. `/frontend/src/pages/DesignSystemDemo.jsx` demuestra los componentes del sistema de diseño, mientras que `/frontend/tailwind.config.js` configura los estilos globales.

---

## 11. **Funcionalidad de búsqueda**
### Evidencia:
- Archivo: `/backend/categorias/models.py`

### Explicación:
La funcionalidad de búsqueda permite a los usuarios encontrar categorías y servicios rápidamente. Esto se implementa mediante consultas en el modelo `Category`.

---

## 12. **Experiencia de usuario (UX)**
### Evidencia:
- Archivo: `/frontend/RESPONSIVE_DESIGN_GUIDE.md`

### Explicación:
El proyecto prioriza la experiencia de usuario mediante un diseño responsivo y accesible, documentado en `/frontend/RESPONSIVE_DESIGN_GUIDE.md`.

---

## 13. **Despliegue en servidor (OCI)**
### Evidencia:
- Archivo: `/backend/Dockerfile`

### Explicación:
Aunque el despliegue en un servidor OCI no está completamente configurado, el proyecto incluye un Dockerfile que facilita la implementación en entornos de producción.

---

## 14. **Configuración de DNS**
### Evidencia:
- Archivo: `/backend/.env`

### Explicación:
La configuración de DNS no está completamente implementada, pero el archivo `.env` incluye variables que pueden ser utilizadas para configurar dominios personalizados.

---

## 15. **Pruebas automatizadas**
### Evidencia:
- Archivo: `/backend/test_complete_system.py`
- Archivo: `/backend/test_sistema_completo.py`

### Explicación:
El proyecto incluye pruebas automatizadas para verificar la funcionalidad del sistema. Estas pruebas se encuentran en los archivos mencionados y cubren casos de uso clave.

---

## 16. **Optimización de rendimiento**
### Evidencia:
- Archivo: `/backend/optimize_static.sh`

### Explicación:
El script `/backend/optimize_static.sh` optimiza los archivos estáticos para mejorar el rendimiento del sistema.

---

## 17. **Documentación**
### Evidencia:
- Archivo: `/README.md`

### Explicación:
El proyecto incluye documentación detallada en el archivo `/README.md`, que describe cómo configurar y utilizar el sistema.

---

Este documento proporciona una visión completa de cómo cada criterio de la rúbrica se aplica en el proyecto "erg-dentistas".
