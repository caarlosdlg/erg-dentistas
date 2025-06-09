import React, { useState } from 'react';

/**
 * Tratamientos Component - Treatment Management
 * Comprehensive treatment catalog and management system
 */
const Tratamientos = () => {
  const [treatments, setTreatments] = useState([
    {
      id: 1,
      name: 'Limpieza Dental Profunda',
      category: 'preventivo',
      duration: 60,
      price: 150000,
      description: 'Limpieza profesional con ultrasonido y pulido',
      materials: ['Ultrasonido', 'Pasta profiláctica', 'Fluoruro'],
      frequency: 'Cada 6 meses',
      isActive: true
    },
    {
      id: 2,
      name: 'Consulta General',
      category: 'diagnostico',
      duration: 30,
      price: 80000,
      description: 'Evaluación general del estado dental y oral',
      materials: ['Espejo dental', 'Sonda exploradora'],
      frequency: 'Según necesidad',
      isActive: true
    },
    {
      id: 3,
      name: 'Resina Compuesta',
      category: 'restaurativo',
      duration: 45,
      price: 120000,
      description: 'Restauración con resina del color del diente',
      materials: ['Resina compuesta', 'Adhesivo dental', 'Ácido grabador'],
      frequency: 'Según necesidad',
      isActive: true
    },
    {
      id: 4,
      name: 'Endodoncia (Conducto)',
      category: 'endodoncia',
      duration: 90,
      price: 400000,
      description: 'Tratamiento de conducto radicular',
      materials: ['Limas endodónticas', 'Irrigadores', 'Gutapercha'],
      frequency: 'Una vez',
      isActive: true
    },
    {
      id: 5,
      name: 'Extracción Simple',
      category: 'cirugia',
      duration: 30,
      price: 100000,
      description: 'Extracción dental sin complicaciones',
      materials: ['Anestesia local', 'Fórceps', 'Gasas'],
      frequency: 'Según necesidad',
      isActive: true
    },
    {
      id: 6,
      name: 'Blanqueamiento Dental',
      category: 'estetico',
      duration: 60,
      price: 300000,
      description: 'Blanqueamiento profesional en consulta',
      materials: ['Gel blanqueador', 'Cubetas', 'Activador LED'],
      frequency: 'Cada 1-2 años',
      isActive: true
    },
    {
      id: 7,
      name: 'Brackets Metálicos',
      category: 'ortodoncia',
      duration: 120,
      price: 2500000,
      description: 'Tratamiento de ortodoncia con brackets convencionales',
      materials: ['Brackets metálicos', 'Arcos', 'Ligaduras'],
      frequency: 'Tratamiento de 18-24 meses',
      isActive: true
    },
    {
      id: 8,
      name: 'Implante Dental',
      category: 'implantologia',
      duration: 90,
      price: 1200000,
      description: 'Colocación de implante dental de titanio',
      materials: ['Implante de titanio', 'Pilar', 'Corona'],
      frequency: 'Una vez',
      isActive: true
    }
  ]);

  const [newTreatment, setNewTreatment] = useState({
    name: '',
    category: '',
    duration: '',
    price: '',
    description: '',
    materials: '',
    frequency: ''
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [showInactive, setShowInactive] = useState(false);

  const categories = [
    { id: 'preventivo', name: 'Preventivo', icon: '🦷', color: 'bg-green-100 text-green-800' },
    { id: 'diagnostico', name: 'Diagnóstico', icon: '🔍', color: 'bg-blue-100 text-blue-800' },
    { id: 'restaurativo', name: 'Restaurativo', icon: '🔧', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'endodoncia', name: 'Endodoncia', icon: '⚕️', color: 'bg-red-100 text-red-800' },
    { id: 'cirugia', name: 'Cirugía', icon: '✂️', color: 'bg-purple-100 text-purple-800' },
    { id: 'estetico', name: 'Estético', icon: '✨', color: 'bg-pink-100 text-pink-800' },
    { id: 'ortodoncia', name: 'Ortodoncia', icon: '📏', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'implantologia', name: 'Implantología', icon: '🔩', color: 'bg-gray-100 text-gray-800' }
  ];

  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || { name: categoryId, icon: '🦷', color: 'bg-gray-100 text-gray-800' };
  };

  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'todas' || treatment.category === categoryFilter;
    const matchesActive = showInactive || treatment.isActive;
    
    return matchesSearch && matchesCategory && matchesActive;
  });

  const handleAddTreatment = () => {
    if (newTreatment.name && newTreatment.category && newTreatment.duration && newTreatment.price) {
      const treatment = {
        id: treatments.length + 1,
        ...newTreatment,
        duration: parseInt(newTreatment.duration),
        price: parseInt(newTreatment.price),
        materials: newTreatment.materials.split(',').map(m => m.trim()).filter(m => m),
        isActive: true
      };
      setTreatments([...treatments, treatment]);
      setNewTreatment({
        name: '',
        category: '',
        duration: '',
        price: '',
        description: '',
        materials: '',
        frequency: ''
      });
      setShowAddForm(false);
    }
  };

  const toggleTreatmentStatus = (id) => {
    setTreatments(treatments.map(treatment => 
      treatment.id === id ? { ...treatment, isActive: !treatment.isActive } : treatment
    ));
  };

  const deleteTreatment = (id) => {
    setTreatments(treatments.filter(treatment => treatment.id !== id));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryStats = () => {
    const stats = {};
    categories.forEach(cat => {
      stats[cat.id] = treatments.filter(t => t.category === cat.id && t.isActive).length;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();
  const averagePrice = treatments.reduce((sum, t) => sum + t.price, 0) / treatments.length;
  const totalTreatments = treatments.filter(t => t.isActive).length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🦷 Catálogo de Tratamientos</h1>
        <p className="text-gray-600">Gestión completa de servicios y tratamientos dentales</p>
      </div>

      {/* Quick Stats */}
      <Grid cols={4} gap={4} className="mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalTreatments}</div>
          <div className="text-sm text-gray-600">Tratamientos Activos</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{categories.length}</div>
          <div className="text-sm text-gray-600">Categorías</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-lg font-bold text-purple-600">{formatCurrency(averagePrice)}</div>
          <div className="text-sm text-gray-600">Precio Promedio</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(treatments.reduce((sum, t) => sum + t.duration, 0) / treatments.length)}min
          </div>
          <div className="text-sm text-gray-600">Duración Promedio</div>
        </Card>
      </Grid>

      {/* Search and Filters */}
      <Card className="p-4 mb-6">
        <Grid cols={1} gap={4} className="md:grid-cols-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Buscar tratamientos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="todas">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </Select>
          <div className="flex space-x-2">
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
            >
              ➕ Nuevo
            </Button>
            <Button
              onClick={() => setShowInactive(!showInactive)}
              variant="secondary"
              className={showInactive ? 'bg-gray-200' : ''}
            >
              👁️
            </Button>
          </div>
        </Grid>

        {/* Add Treatment Form */}
        {showAddForm && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Nuevo Tratamiento</h3>
            <Grid cols={1} gap={4} className="md:grid-cols-2">
              <Input
                label="Nombre del Tratamiento"
                value={newTreatment.name}
                onChange={(e) => setNewTreatment({...newTreatment, name: e.target.value})}
                placeholder="Ej: Limpieza dental"
              />
              <Select
                label="Categoría"
                value={newTreatment.category}
                onChange={(e) => setNewTreatment({...newTreatment, category: e.target.value})}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </Select>
              <Input
                type="number"
                label="Duración (minutos)"
                value={newTreatment.duration}
                onChange={(e) => setNewTreatment({...newTreatment, duration: e.target.value})}
                placeholder="60"
              />
              <Input
                type="number"
                label="Precio (COP)"
                value={newTreatment.price}
                onChange={(e) => setNewTreatment({...newTreatment, price: e.target.value})}
                placeholder="150000"
              />
              <div className="md:col-span-2">
                <Input
                  label="Descripción"
                  value={newTreatment.description}
                  onChange={(e) => setNewTreatment({...newTreatment, description: e.target.value})}
                  placeholder="Descripción detallada del tratamiento"
                />
              </div>
              <Input
                label="Materiales (separados por comas)"
                value={newTreatment.materials}
                onChange={(e) => setNewTreatment({...newTreatment, materials: e.target.value})}
                placeholder="Material 1, Material 2, Material 3"
              />
              <Input
                label="Frecuencia Recomendada"
                value={newTreatment.frequency}
                onChange={(e) => setNewTreatment({...newTreatment, frequency: e.target.value})}
                placeholder="Cada 6 meses"
              />
            </Grid>
            <Flex justify="end" className="mt-4 space-x-2">
              <Button 
                onClick={() => setShowAddForm(false)}
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAddTreatment}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Guardar Tratamiento
              </Button>
            </Flex>
          </div>
        )}
      </Card>

      {/* Category Stats */}
      <Card className="p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Tratamientos por Categoría</h3>
        <Grid cols={2} gap={2} className="md:grid-cols-4">
          {categories.map(category => (
            <div 
              key={category.id} 
              className={`p-3 rounded-lg ${category.color} text-center cursor-pointer hover:shadow-md transition-shadow`}
              onClick={() => setCategoryFilter(category.id)}
            >
              <div className="text-2xl mb-1">{category.icon}</div>
              <div className="font-semibold text-sm">{category.name}</div>
              <div className="text-xs opacity-75">{categoryStats[category.id]} tratamientos</div>
            </div>
          ))}
        </Grid>
      </Card>

      {/* Treatments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTreatments.map(treatment => {
          const categoryInfo = getCategoryInfo(treatment.category);
          return (
            <Card key={treatment.id} className={`p-6 ${!treatment.isActive ? 'opacity-60 bg-gray-50' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{categoryInfo.icon}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                    {categoryInfo.name}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    onClick={() => toggleTreatmentStatus(treatment.id)}
                    className={`text-xs ${treatment.isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                  >
                    {treatment.isActive ? '⏸️' : '▶️'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => deleteTreatment(treatment.id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs"
                  >
                    🗑️
                  </Button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{treatment.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{treatment.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">💰 Precio:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(treatment.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">⏱️ Duración:</span>
                  <span className="font-semibold">{treatment.duration} min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">🔄 Frecuencia:</span>
                  <span className="font-semibold">{treatment.frequency}</span>
                </div>
              </div>

              {treatment.materials && treatment.materials.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">🛠️ Materiales:</p>
                  <div className="flex flex-wrap gap-1">
                    {treatment.materials.slice(0, 3).map((material, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {material}
                      </span>
                    ))}
                    {treatment.materials.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{treatment.materials.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1 text-xs"
                >
                  📝 Editar
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="flex-1 text-xs"
                >
                  📅 Agendar
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredTreatments.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron tratamientos</h3>
          <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
        </Card>
      )}

      {/* Quick Actions Footer */}
      <Card className="p-4 mt-6 bg-blue-50 border-blue-200">
        <Flex justify="between" align="center">
          <div>
            <h3 className="font-semibold text-blue-900">💡 Gestión Avanzada</h3>
            <p className="text-sm text-blue-700">Optimiza tu catálogo de servicios</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="secondary"
              className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              📊 Reportes de Precios
            </Button>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              📤 Exportar Catálogo
            </Button>
          </div>
        </Flex>
      </Card>
    </div>
  );
};

export default Tratamientos;
