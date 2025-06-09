import React, { useState } from 'react';
import { HelpCircle, X, Search, Image, Wifi } from 'lucide-react';

const QuickHelpModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const helpSections = [
    {
      title: "🔍 Probar Búsqueda",
      icon: Search,
      items: [
        'Escribe "limpieza" para ver tratamientos',
        'Prueba "ortodoncia" para categorías',
        'Busca "Carlos" para encontrar pacientes',
        'Usa las flechas ↑↓ en sugerencias',
        'Presiona Enter para buscar',
        'Activa/desactiva filtros por tipo'
      ]
    },
    {
      title: "🖼️ Probar Imágenes", 
      icon: Image,
      items: [
        'Scroll para ver carga lazy',
        'Clic en imagen → abre lightbox',
        'Usa flechas ←→ en lightbox',
        'Botón download en cada imagen',
        'Cambia layout de galería',
        'Observa placeholder mientras carga'
      ]
    },
    {
      title: "📡 Probar Red",
      icon: Wifi,
      items: [
        'Ve información de conexión',
        'Calidad se adapta automáticamente',
        'Simula conexión lenta',
        'Modo ahorro de datos',
        'Optimización inteligente',
        'Performance mejorado'
      ]
    }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-50"
        title="Ayuda rápida"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🎯 Cómo Probar las Funcionalidades
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {helpSections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <IconComponent className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-gray-700 flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">💡 Navegación</h3>
            <div className="text-sm text-green-700 space-y-1">
              <div><strong>Botones superiores:</strong> "Search", "Search & Images", "Showcase"</div>
              <div><strong>Pestañas internas:</strong> "Búsqueda", "Imágenes", "Red"</div>
              <div><strong>Datos de prueba:</strong> Todo funciona con datos mock para demostración</div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickHelpModal;
