import React, { useState, useEffect } from 'react';
import { Search, Image as ImageIcon, Wifi, Settings } from 'lucide-react';
import {
  SearchInput,
  SearchResults,
  OptimizedImage,
  ImageGallery,
  NetworkAwareImage
} from '../components';
import QuickHelpModal from '../components/QuickHelpModal';
import LoginTest from '../components/LoginTest';
import searchService from '../services/searchService';
import networkImageService from '../services/networkImageService';

const SearchAndImageDemo = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [networkInfo, setNetworkInfo] = useState(null);

  // Mock images for gallery demo - Using placeholder service
  const mockImages = [
    {
      id: 1,
      url: 'https://picsum.photos/800/600?random=1',
      caption: 'Consultorio dental moderno',
      alt: 'Consultorio dental con equipos modernos'
    },
    {
      id: 2,
      url: 'https://picsum.photos/800/600?random=2',
      caption: 'Equipos de diagnóstico',
      alt: 'Equipos de rayos X y diagnóstico dental'
    },
    {
      id: 3,
      url: 'https://picsum.photos/800/600?random=3',
      caption: 'Sala de espera',
      alt: 'Cómoda sala de espera para pacientes'
    },
    {
      id: 4,
      url: 'https://picsum.photos/800/600?random=4',
      caption: 'Instrumental dental',
      alt: 'Instrumental especializado para tratamientos'
    },
    {
      id: 5,
      url: 'https://picsum.photos/800/600?random=5',
      caption: 'Área de esterilización',
      alt: 'Área de esterilización y limpieza'
        },
    {
      id: 6,
      url: 'https://picsum.photos/800/600?random=6',
      caption: 'Recepción',
      alt: 'Área de recepción y administración'
    },
    {
      id: 7,
      url: 'https://picsum.photos/800/600?random=7',
      caption: 'Laboratorio dental',
      alt: 'Laboratorio para prótesis y moldes'
    },
    {
      id: 8,
      url: 'https://picsum.photos/800/600?random=8',
      caption: 'Área de cirugía',
      alt: 'Quirófano especializado en cirugía oral'
    }
  ];

  // Get network info
  useEffect(() => {
    setNetworkInfo(networkImageService.getNetworkInfo());

    const handleNetworkChange = (event) => {
      setNetworkInfo(event.detail);
    };

    window.addEventListener('networkchange', handleNetworkChange);
    return () => window.removeEventListener('networkchange', handleNetworkChange);
  }, []);

  // Mock search data
  const mockSearchData = {
    total_results: 8,
    results: {
      categories: [
        {
          id: 1,
          name: "Ortodoncia",
          description: "Tratamientos de corrección dental",
          is_active: true
        },
        {
          id: 2,
          name: "Prevención",
          description: "Cuidados preventivos dentales",
          is_active: true
        }
      ],
      tratamientos: [
        {
          id: 1,
          name: "Limpieza Dental",
          description: "Profilaxis dental completa",
          price: "150.00",
          category: "Prevención"
        },
        {
          id: 2,
          name: "Brackets Metálicos",
          description: "Ortodoncia con brackets tradicionales",
          price: "3500.00",
          category: "Ortodoncia"
        }
      ]
    }
  };

  // Handle search with mock data
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    setSearchLoading(true);
    setSearchQuery(query);
    
    // Simulate API delay
    setTimeout(() => {
      // Filter mock data based on query
      const queryLower = query.toLowerCase();
      const filteredResults = {
        ...mockSearchData,
        results: {
          categories: mockSearchData.results.categories.filter(cat => 
            cat.name.toLowerCase().includes(queryLower) || 
            cat.description.toLowerCase().includes(queryLower)
          ),
          tratamientos: mockSearchData.results.tratamientos.filter(treat => 
            treat.name.toLowerCase().includes(queryLower) || 
            treat.description.toLowerCase().includes(queryLower) ||
            treat.category.toLowerCase().includes(queryLower)
          )
        }
      };

      // Update total results
      filteredResults.total_results = 
        filteredResults.results.categories.length + 
        filteredResults.results.tratamientos.length;

      setSearchResults(filteredResults);
      setSearchLoading(false);
    }, 600);
  };

  const tabs = [
    { id: 'search', label: 'Búsqueda', icon: Search },
    { id: 'images', label: 'Imágenes', icon: ImageIcon },
    { id: 'network', label: 'Red', icon: Wifi }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demo: Búsqueda e Imágenes Optimizadas
          </h1>
          <p className="text-gray-600">
            Demonstración de funcionalidades de búsqueda y optimización de imágenes
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          
          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Búsqueda Inteligente</h2>
                <p className="text-gray-600 mb-6">
                  Busca categorías y tratamientos con autocompletado inteligente y filtros avanzados.
                </p>
                
                <SearchInput
                  onSearch={handleSearch}
                  placeholder="Buscar categorías, tratamientos..."
                  autoFocus
                  size="lg"
                  className="max-w-2xl"
                />
              </div>

              {/* Search Results */}
              {(searchResults || searchLoading) && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <SearchResults
                    results={searchResults}
                    isLoading={searchLoading}
                    query={searchQuery}
                    onCategoryClick={(category) => console.log('Category:', category)}
                    onTreatmentClick={(treatment) => console.log('Treatment:', treatment)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              
              {/* Image Gallery Demo */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Galería de Imágenes Optimizadas</h2>
                <p className="text-gray-600 mb-6">
                  Galería con carga lazy, lightbox y optimización automática según la conexión.
                </p>
                
                <ImageGallery
                  images={mockImages}
                  columns={{ sm: 1, md: 2, lg: 3 }}
                  aspectRatio="landscape"
                  quality="medium"
                  showLightbox={true}
                />
              </div>

              {/* Network-Aware Images Demo */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Imágenes Adaptativas por Red</h2>
                <p className="text-gray-600 mb-6">
                  Imágenes que se adaptan automáticamente a la calidad de la conexión.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockImages.slice(0, 3).map((image) => (
                    <div key={image.id} className="aspect-video">
                      <NetworkAwareImage
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full rounded-lg object-cover"
                        adaptToNetwork={true}
                        showNetworkIndicator={true}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Standard Optimized Images Demo */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Imágenes Optimizadas Estándar</h2>
                <p className="text-gray-600 mb-6">
                  Imágenes con carga lazy, placeholders y gestión de errores.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mockImages.slice(0, 4).map((image) => (
                    <div key={image.id} className="aspect-square">
                      <OptimizedImage
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full rounded-lg object-cover"
                        lazy={true}
                        quality="high"
                        placeholder="blur"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Network Tab */}
          {activeTab === 'network' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Información de Red</h2>
                <p className="text-gray-600 mb-6">
                  Información sobre la conexión actual y estrategias de optimización.
                </p>
                
                {networkInfo && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Tipo de Conexión</h3>
                        <p className="text-2xl font-bold text-blue-600">
                          {networkInfo.effectiveType?.toUpperCase() || 'Desconocido'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Estado</h3>
                        <p className={`text-2xl font-bold ${
                          networkInfo.isSlowConnection ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {networkInfo.isSlowConnection ? 'Lenta' : 'Rápida'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-900 mb-2">Ahorro de Datos</h3>
                        <p className={`text-2xl font-bold ${
                          networkInfo.dataSaver ? 'text-orange-600' : 'text-gray-600'
                        }`}>
                          {networkInfo.dataSaver ? 'Activo' : 'Inactivo'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">Estrategia de Carga Actual</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700 font-medium">Calidad:</span>
                          <p className="text-blue-600">{networkInfo.strategy?.quality}</p>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Lazy Loading:</span>
                          <p className="text-blue-600">{networkInfo.strategy?.lazy ? 'Sí' : 'No'}</p>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Placeholder:</span>
                          <p className="text-blue-600">{networkInfo.strategy?.placeholder}</p>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Progresivo:</span>
                          <p className="text-blue-600">{networkInfo.strategy?.progressive ? 'Sí' : 'No'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Login Test Component */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <LoginTest />
      </div>
      
      <QuickHelpModal />
    </div>
  );
};

export default SearchAndImageDemo;
