import React, { useState, useEffect } from 'react';

/**
 * Inventario page component - Dental clinic inventory management
 * Real functionality for managing dental supplies and equipment
 */
const Inventario = () => {
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    categoria_id: '',
    descripcion: '',
    unidad_medida: '',
    precio_compra: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: '',
    stock_maximo: '',
    proveedor_id: '',
    ubicacion: '',
    fecha_vencimiento: '',
    lote: ''
  });

  const [transactionData, setTransactionData] = useState({
    tipo: 'entrada', // entrada, salida, ajuste
    cantidad: '',
    motivo: '',
    costo_unitario: '',
    proveedor_id: '',
    numero_factura: ''
  });

  // Mock data
  const mockCategories = [
    { id: '1', nombre: 'Instrumentos' },
    { id: '2', nombre: 'Materiales de Restauración' },
    { id: '3', nombre: 'Anestésicos' },
    { id: '4', nombre: 'Equipamiento' },
    { id: '5', nombre: 'Esterilización' },
    { id: '6', nombre: 'Profilaxis' }
  ];

  const mockSuppliers = [
    { id: '1', nombre: 'Dental Supply Co.', contacto: 'ventas@dentalsupply.com' },
    { id: '2', nombre: 'MediDent Distribuidora', contacto: 'pedidos@medident.com' },
    { id: '3', nombre: 'Instrumental Dental SA', contacto: 'info@instrumental.com' }
  ];

  const mockInventory = [
    {
      id: '1',
      codigo: 'INST-001',
      nombre: 'Espejo dental #5',
      categoria: { nombre: 'Instrumentos' },
      descripcion: 'Espejo dental con mango largo',
      unidad_medida: 'pieza',
      precio_compra: 45.00,
      precio_venta: 80.00,
      stock_actual: 25,
      stock_minimo: 10,
      stock_maximo: 50,
      proveedor: { nombre: 'Dental Supply Co.' },
      ubicacion: 'Gaveta A-1',
      fecha_vencimiento: null,
      lote: null,
      activo: true,
      valor_total: 1125.00
    },
    {
      id: '2',
      codigo: 'MAT-001',
      nombre: 'Resina compuesta A2',
      categoria: { nombre: 'Materiales de Restauración' },
      descripcion: 'Resina fotopolimerizable color A2',
      unidad_medida: 'jeringa',
      precio_compra: 150.00,
      precio_venta: 300.00,
      stock_actual: 8,
      stock_minimo: 15,
      stock_maximo: 40,
      proveedor: { nombre: 'MediDent Distribuidora' },
      ubicacion: 'Refrigerador R-1',
      fecha_vencimiento: '2025-12-31',
      lote: 'LOT2024-001',
      activo: true,
      valor_total: 1200.00
    },
    {
      id: '3',
      codigo: 'ANES-001',
      nombre: 'Lidocaína 2% con epinefrina',
      categoria: { nombre: 'Anestésicos' },
      descripcion: 'Anestésico local en cartuchos de 1.8ml',
      unidad_medida: 'cartucho',
      precio_compra: 12.00,
      precio_venta: 25.00,
      stock_actual: 5,
      stock_minimo: 20,
      stock_maximo: 100,
      proveedor: { nombre: 'MediDent Distribuidora' },
      ubicacion: 'Refrigerador R-2',
      fecha_vencimiento: '2025-06-30',
      lote: 'LOT2024-LIDO',
      activo: true,
      valor_total: 60.00
    },
    {
      id: '4',
      codigo: 'EQUIP-001',
      nombre: 'Lámpara de fotocurado LED',
      categoria: { nombre: 'Equipamiento' },
      descripcion: 'Lámpara LED para polimerización 1200mW/cm²',
      unidad_medida: 'pieza',
      precio_compra: 2500.00,
      precio_venta: 4000.00,
      stock_actual: 2,
      stock_minimo: 1,
      stock_maximo: 3,
      proveedor: { nombre: 'Instrumental Dental SA' },
      ubicacion: 'Consultorio 1',
      fecha_vencimiento: null,
      lote: null,
      activo: true,
      valor_total: 5000.00
    },
    {
      id: '5',
      codigo: 'ESTER-001',
      nombre: 'Bolsas de esterilización',
      categoria: { nombre: 'Esterilización' },
      descripcion: 'Bolsas autosellables para autoclave',
      unidad_medida: 'paquete',
      precio_compra: 85.00,
      precio_venta: 150.00,
      stock_actual: 12,
      stock_minimo: 8,
      stock_maximo: 30,
      proveedor: { nombre: 'Dental Supply Co.' },
      ubicacion: 'Almacén A-3',
      fecha_vencimiento: null,
      lote: null,
      activo: true,
      valor_total: 1020.00
    }
  ];

  useEffect(() => {
    setInventory(mockInventory);
    setCategories(mockCategories);
    setSuppliers(mockSuppliers);
  }, []);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todos' || item.categoria.nombre === selectedCategory;
    
    const matchesStock = !lowStockOnly || item.stock_actual <= item.stock_minimo;
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const getStockStatus = (item) => {
    if (item.stock_actual <= item.stock_minimo * 0.5) {
      return { status: 'critical', color: 'bg-red-100 text-red-800', label: 'Crítico' };
    } else if (item.stock_actual <= item.stock_minimo) {
      return { status: 'low', color: 'bg-yellow-100 text-yellow-800', label: 'Bajo' };
    } else if (item.stock_actual >= item.stock_maximo * 0.9) {
      return { status: 'high', color: 'bg-blue-100 text-blue-800', label: 'Alto' };
    } else {
      return { status: 'normal', color: 'bg-green-100 text-green-800', label: 'Normal' };
    }
  };

  const getInventoryStats = () => {
    const totalValue = inventory.reduce((sum, item) => sum + item.valor_total, 0);
    const lowStockItems = inventory.filter(item => item.stock_actual <= item.stock_minimo);
    const criticalItems = inventory.filter(item => item.stock_actual <= item.stock_minimo * 0.5);
    const expiringItems = inventory.filter(item => {
      if (!item.fecha_vencimiento) return false;
      const expDate = new Date(item.fecha_vencimiento);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      return expDate <= threeMonthsFromNow;
    });

    return {
      totalItems: inventory.length,
      totalValue,
      lowStockCount: lowStockItems.length,
      criticalCount: criticalItems.length,
      expiringCount: expiringItems.length
    };
  };

  const stats = getInventoryStats();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTransactionChange = (field, value) => {
    setTransactionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const category = categories.find(c => c.id === formData.categoria_id);
    const supplier = suppliers.find(s => s.id === formData.proveedor_id);
    
    const newItem = {
      id: Date.now().toString(),
      codigo: formData.codigo,
      nombre: formData.nombre,
      categoria: { nombre: category?.nombre || '' },
      descripcion: formData.descripcion,
      unidad_medida: formData.unidad_medida,
      precio_compra: parseFloat(formData.precio_compra),
      precio_venta: parseFloat(formData.precio_venta),
      stock_actual: parseInt(formData.stock_actual),
      stock_minimo: parseInt(formData.stock_minimo),
      stock_maximo: parseInt(formData.stock_maximo),
      proveedor: { nombre: supplier?.nombre || '' },
      ubicacion: formData.ubicacion,
      fecha_vencimiento: formData.fecha_vencimiento || null,
      lote: formData.lote || null,
      activo: true,
      valor_total: parseFloat(formData.precio_compra) * parseInt(formData.stock_actual)
    };
    
    setInventory(prev => [...prev, newItem]);
    setIsCreateModalOpen(false);
    resetForm();
    alert('Artículo registrado exitosamente');
  };

  const handleTransaction = (e) => {
    e.preventDefault();
    
    if (!selectedItem) return;
    
    const cantidad = parseInt(transactionData.cantidad);
    let newStock = selectedItem.stock_actual;
    
    switch (transactionData.tipo) {
      case 'entrada':
        newStock += cantidad;
        break;
      case 'salida':
        newStock = Math.max(0, newStock - cantidad);
        break;
      case 'ajuste':
        newStock = cantidad;
        break;
    }
    
    setInventory(prev => 
      prev.map(item => 
        item.id === selectedItem.id 
          ? { 
              ...item, 
              stock_actual: newStock,
              valor_total: item.precio_compra * newStock
            }
          : item
      )
    );
    
    setIsTransactionModalOpen(false);
    setSelectedItem(null);
    resetTransactionForm();
    alert('Movimiento de inventario registrado exitosamente');
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      codigo: '',
      categoria_id: '',
      descripcion: '',
      unidad_medida: '',
      precio_compra: '',
      precio_venta: '',
      stock_actual: '',
      stock_minimo: '',
      stock_maximo: '',
      proveedor_id: '',
      ubicacion: '',
      fecha_vencimiento: '',
      lote: ''
    });
  };

  const resetTransactionForm = () => {
    setTransactionData({
      tipo: 'entrada',
      cantidad: '',
      motivo: '',
      costo_unitario: '',
      proveedor_id: '',
      numero_factura: ''
    });
  };

  const categoryOptions = ['Todos', ...categories.map(cat => cat.nombre)];

  return (
    <Container maxWidth="xl">
      <Flex direction="column" gap={6}>
        {/* Page Header */}
        <Flex justify="space-between" align="center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
            <p className="text-gray-600">Gestión de suministros y equipamiento dental</p>
          </div>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Nuevo Artículo
          </Button>
        </Flex>

        {/* Inventory Stats */}
        <Grid cols={5} gap={4} responsive>
          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold">Total Artículos</h3>
                <div className="text-3xl font-bold text-blue-600">{stats.totalItems}</div>
                <p className="text-sm text-gray-500">En inventario</p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold">Valor Total</h3>
                <div className="text-3xl font-bold text-green-600">
                  ${stats.totalValue.toLocaleString()}
                </div>
                <p className="text-sm text-gray-500">Inventario valorizado</p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold">Stock Bajo</h3>
                <div className="text-3xl font-bold text-yellow-600">{stats.lowStockCount}</div>
                <p className="text-sm text-gray-500">Requieren reorden</p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold">Stock Crítico</h3>
                <div className="text-3xl font-bold text-red-600">{stats.criticalCount}</div>
                <p className="text-sm text-gray-500">Atención urgente</p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold">Por Vencer</h3>
                <div className="text-3xl font-bold text-purple-600">{stats.expiringCount}</div>
                <p className="text-sm text-gray-500">Próximos 3 meses</p>
              </Flex>
            </Card.Content>
          </Card>
        </Grid>

        {/* Filters */}
        <Card>
          <Card.Content className="p-6">
            <Flex gap={4} align="center" className="flex-wrap">
              <Input
                placeholder="Buscar por nombre, código o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-[300px]"
              />
              
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categoryOptions.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="lowStockOnly"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="lowStockOnly" className="text-sm text-gray-700">
                  Solo stock bajo
                </label>
              </div>

              <Button variant="outline">Reportes</Button>
              <Button variant="outline">Exportar</Button>
            </Flex>
          </Card.Content>
        </Card>

        {/* Inventory List */}
        <Grid cols={1} gap={4}>
          {filteredInventory.map((item) => {
            const stockStatus = getStockStatus(item);
            
            return (
              <Card key={item.id} variant="outlined" className="hover:shadow-lg transition-shadow">
                <Card.Content className="p-6">
                  <Flex justify="space-between" align="start">
                    <Flex direction="column" gap={3} className="flex-1">
                      <Flex align="center" gap={4} className="flex-wrap">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {item.nombre}
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {item.codigo}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}>
                          Stock {stockStatus.label}
                        </span>
                        {item.fecha_vencimiento && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            Vence: {new Date(item.fecha_vencimiento).toLocaleDateString()}
                          </span>
                        )}
                      </Flex>
                      
                      <p className="text-gray-600">{item.descripcion}</p>
                      
                      <Grid cols={4} gap={4} className="mt-3">
                        <div>
                          <p className="text-sm text-gray-500">Categoría</p>
                          <p className="font-medium">{item.categoria.nombre}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Stock Actual</p>
                          <p className="font-medium">
                            {item.stock_actual} {item.unidad_medida}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Stock Mín/Máx</p>
                          <p className="font-medium">
                            {item.stock_minimo} / {item.stock_maximo}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Precio Venta</p>
                          <p className="font-medium">${item.precio_venta.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Proveedor</p>
                          <p className="font-medium">{item.proveedor.nombre}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ubicación</p>
                          <p className="font-medium">{item.ubicacion}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Valor Total</p>
                          <p className="font-medium">${item.valor_total.toLocaleString()}</p>
                        </div>
                        {item.lote && (
                          <div>
                            <p className="text-sm text-gray-500">Lote</p>
                            <p className="font-medium">{item.lote}</p>
                          </div>
                        )}
                      </Grid>
                    </Flex>

                    <Flex direction="column" gap={2}>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsTransactionModalOpen(true);
                        }}
                      >
                        Movimiento
                      </Button>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        Historial
                      </Button>
                    </Flex>
                  </Flex>
                </Card.Content>
              </Card>
            );
          })}
        </Grid>

        {/* Create Item Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Registrar Nuevo Artículo"
          size="large"
        >
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap={6}>
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
                <Grid cols={3} gap={4}>
                  <Input
                    label="Código"
                    value={formData.codigo}
                    onChange={(e) => handleInputChange('codigo', e.target.value)}
                    placeholder="Ej: INST-001"
                    required
                  />
                  <Input
                    label="Nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    required
                  />
                  <Select
                    label="Categoría"
                    value={formData.categoria_id}
                    onChange={(e) => handleInputChange('categoria_id', e.target.value)}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.nombre}
                      </option>
                    ))}
                  </Select>
                </Grid>
                
                <Textarea
                  label="Descripción"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  rows={3}
                  className="mt-4"
                  required
                />
              </div>

              {/* Stock and Pricing */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Stock y Precios</h3>
                <Grid cols={3} gap={4}>
                  <Input
                    label="Unidad de Medida"
                    value={formData.unidad_medida}
                    onChange={(e) => handleInputChange('unidad_medida', e.target.value)}
                    placeholder="Ej: pieza, ml, kg"
                    required
                  />
                  <Input
                    type="number"
                    label="Stock Actual"
                    value={formData.stock_actual}
                    onChange={(e) => handleInputChange('stock_actual', e.target.value)}
                    min="0"
                    required
                  />
                  <Input
                    type="number"
                    label="Stock Mínimo"
                    value={formData.stock_minimo}
                    onChange={(e) => handleInputChange('stock_minimo', e.target.value)}
                    min="0"
                    required
                  />
                  <Input
                    type="number"
                    label="Stock Máximo"
                    value={formData.stock_maximo}
                    onChange={(e) => handleInputChange('stock_maximo', e.target.value)}
                    min="0"
                    required
                  />
                  <Input
                    type="number"
                    step="0.01"
                    label="Precio de Compra"
                    value={formData.precio_compra}
                    onChange={(e) => handleInputChange('precio_compra', e.target.value)}
                    min="0"
                    required
                  />
                  <Input
                    type="number"
                    step="0.01"
                    label="Precio de Venta"
                    value={formData.precio_venta}
                    onChange={(e) => handleInputChange('precio_venta', e.target.value)}
                    min="0"
                    required
                  />
                </Grid>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Información Adicional</h3>
                <Grid cols={2} gap={4}>
                  <Select
                    label="Proveedor"
                    value={formData.proveedor_id}
                    onChange={(e) => handleInputChange('proveedor_id', e.target.value)}
                    required
                  >
                    <option value="">Seleccionar proveedor</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.nombre}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label="Ubicación"
                    value={formData.ubicacion}
                    onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                    placeholder="Ej: Gaveta A-1, Consultorio 2"
                    required
                  />
                  <Input
                    type="date"
                    label="Fecha de Vencimiento"
                    value={formData.fecha_vencimiento}
                    onChange={(e) => handleInputChange('fecha_vencimiento', e.target.value)}
                  />
                  <Input
                    label="Lote"
                    value={formData.lote}
                    onChange={(e) => handleInputChange('lote', e.target.value)}
                    placeholder="Número de lote"
                  />
                </Grid>
              </div>

              {/* Form Actions */}
              <Flex justify="end" gap={3} className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Registrar Artículo
                </Button>
              </Flex>
            </Flex>
          </form>
        </Modal>

        {/* Transaction Modal */}
        {selectedItem && (
          <Modal
            isOpen={isTransactionModalOpen}
            onClose={() => setIsTransactionModalOpen(false)}
            title={`Movimiento de Inventario - ${selectedItem.nombre}`}
            size="medium"
          >
            <form onSubmit={handleTransaction}>
              <Flex direction="column" gap={6}>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Stock Actual</h4>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-900">
                      {selectedItem.stock_actual} {selectedItem.unidad_medida}
                    </p>
                  </div>
                </div>

                <Grid cols={2} gap={4}>
                  <Select
                    label="Tipo de Movimiento"
                    value={transactionData.tipo}
                    onChange={(e) => handleTransactionChange('tipo', e.target.value)}
                    required
                  >
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                    <option value="ajuste">Ajuste de Inventario</option>
                  </Select>

                  <Input
                    type="number"
                    label={transactionData.tipo === 'ajuste' ? 'Nuevo Stock' : 'Cantidad'}
                    value={transactionData.cantidad}
                    onChange={(e) => handleTransactionChange('cantidad', e.target.value)}
                    min="0"
                    required
                  />
                </Grid>

                <Textarea
                  label="Motivo"
                  value={transactionData.motivo}
                  onChange={(e) => handleTransactionChange('motivo', e.target.value)}
                  placeholder="Descripción del motivo del movimiento..."
                  rows={3}
                  required
                />

                {transactionData.tipo === 'entrada' && (
                  <Grid cols={2} gap={4}>
                    <Input
                      type="number"
                      step="0.01"
                      label="Costo Unitario"
                      value={transactionData.costo_unitario}
                      onChange={(e) => handleTransactionChange('costo_unitario', e.target.value)}
                      min="0"
                    />
                    <Input
                      label="Número de Factura"
                      value={transactionData.numero_factura}
                      onChange={(e) => handleTransactionChange('numero_factura', e.target.value)}
                      placeholder="Factura del proveedor"
                    />
                  </Grid>
                )}

                <Flex justify="end" gap={3} className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => setIsTransactionModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit">
                    Registrar Movimiento
                  </Button>
                </Flex>
              </Flex>
            </form>
          </Modal>
        )}
      </Flex>
    </Container>
  );
};

export default Inventario;
