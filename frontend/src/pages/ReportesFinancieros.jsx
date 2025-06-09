import React, { useState, useEffect } from 'react';

/**
 * Reportes Financieros page component
 * Real financial reporting and analytics for dental clinic
 */
const ReportesFinancieros = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const [financialData, setFinancialData] = useState({
    ingresos: [],
    gastos: [],
    tratamientos: [],
    pacientes: []
  });

  // Mock financial data
  const mockData = {
    ingresos: [
      { fecha: '2024-06-01', concepto: 'Limpieza Dental - María González', monto: 800, tipo: 'tratamiento', paciente: 'María González' },
      { fecha: '2024-06-02', concepto: 'Endodoncia - Carlos Martínez', monto: 3500, tipo: 'tratamiento', paciente: 'Carlos Martínez' },
      { fecha: '2024-06-03', concepto: 'Consulta - Ana Rodríguez', monto: 500, tipo: 'consulta', paciente: 'Ana Rodríguez' },
      { fecha: '2024-06-04', concepto: 'Empaste - José López', monto: 1200, tipo: 'tratamiento', paciente: 'José López' },
      { fecha: '2024-06-05', concepto: 'Ortodoncia - Laura Pérez', monto: 2500, tipo: 'tratamiento', paciente: 'Laura Pérez' },
      { fecha: '2024-06-06', concepto: 'Limpieza Dental - Roberto Silva', monto: 800, tipo: 'tratamiento', paciente: 'Roberto Silva' },
      { fecha: '2024-06-07', concepto: 'Extracción - Carmen Díaz', monto: 1000, tipo: 'tratamiento', paciente: 'Carmen Díaz' },
      { fecha: '2024-06-08', concepto: 'Corona - Miguel Torres', monto: 4000, tipo: 'tratamiento', paciente: 'Miguel Torres' }
    ],
    gastos: [
      { fecha: '2024-06-01', concepto: 'Compra de materiales dentales', monto: 2500, categoria: 'Suministros', proveedor: 'Dental Supply Co.' },
      { fecha: '2024-06-02', concepto: 'Mantenimiento equipos', monto: 800, categoria: 'Mantenimiento', proveedor: 'TechDental' },
      { fecha: '2024-06-03', concepto: 'Servicios públicos', monto: 1200, categoria: 'Servicios', proveedor: 'CFE' },
      { fecha: '2024-06-04', concepto: 'Salarios personal', monto: 15000, categoria: 'Nómina', proveedor: 'Interno' },
      { fecha: '2024-06-05', concepto: 'Alquiler consultorio', monto: 8000, categoria: 'Instalaciones', proveedor: 'Inmobiliaria ABC' },
      { fecha: '2024-06-06', concepto: 'Seguros médicos', monto: 2000, categoria: 'Seguros', proveedor: 'Seguros XYZ' }
    ],
    tratamientos: [
      { nombre: 'Limpieza Dental', cantidad: 15, ingresos: 12000, promedio: 800 },
      { nombre: 'Endodoncia', cantidad: 3, ingresos: 10500, promedio: 3500 },
      { nombre: 'Empaste', cantidad: 8, ingresos: 9600, promedio: 1200 },
      { nombre: 'Ortodoncia', cantidad: 2, ingresos: 5000, promedio: 2500 },
      { nombre: 'Corona Dental', cantidad: 1, ingresos: 4000, promedio: 4000 },
      { nombre: 'Extracción', cantidad: 4, ingresos: 4000, promedio: 1000 },
      { nombre: 'Consulta General', cantidad: 12, ingresos: 6000, promedio: 500 }
    ]
  };

  useEffect(() => {
    setFinancialData(mockData);
  }, []);

  const calculatePeriodStats = () => {
    const totalIngresos = financialData.ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);
    const totalGastos = financialData.gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
    const utilidadBruta = totalIngresos - totalGastos;
    const margenUtilidad = totalIngresos > 0 ? (utilidadBruta / totalIngresos) * 100 : 0;
    
    const totalPacientes = new Set(financialData.ingresos.map(i => i.paciente)).size;
    const ingresoPromedioPorPaciente = totalPacientes > 0 ? totalIngresos / totalPacientes : 0;
    
    const totalTratamientos = financialData.ingresos.filter(i => i.tipo === 'tratamiento').length;
    const ingresoPromedioPorTratamiento = totalTratamientos > 0 
      ? financialData.ingresos.filter(i => i.tipo === 'tratamiento').reduce((sum, i) => sum + i.monto, 0) / totalTratamientos 
      : 0;

    return {
      totalIngresos,
      totalGastos,
      utilidadBruta,
      margenUtilidad,
      totalPacientes,
      totalTratamientos,
      ingresoPromedioPorPaciente,
      ingresoPromedioPorTratamiento
    };
  };

  const getTopTreatments = () => {
    return financialData.tratamientos
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 5);
  };

  const getExpensesByCategory = () => {
    const categories = {};
    financialData.gastos.forEach(gasto => {
      if (!categories[gasto.categoria]) {
        categories[gasto.categoria] = 0;
      }
      categories[gasto.categoria] += gasto.monto;
    });
    
    return Object.entries(categories)
      .map(([categoria, monto]) => ({ categoria, monto }))
      .sort((a, b) => b.monto - a.monto);
  };

  const getDailyIncome = () => {
    const dailyIncome = {};
    financialData.ingresos.forEach(ingreso => {
      const fecha = ingreso.fecha;
      if (!dailyIncome[fecha]) {
        dailyIncome[fecha] = 0;
      }
      dailyIncome[fecha] += ingreso.monto;
    });
    
    return Object.entries(dailyIncome)
      .map(([fecha, monto]) => ({ fecha, monto }))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  };

  const stats = calculatePeriodStats();
  const topTreatments = getTopTreatments();
  const expensesByCategory = getExpensesByCategory();
  const dailyIncome = getDailyIncome();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Container maxWidth="xl">
      <Flex direction="column" gap={6}>
        {/* Page Header */}
        <Flex justify="space-between" align="center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reportes Financieros</h1>
            <p className="text-gray-600">Análisis financiero y contable del consultorio</p>
          </div>
          <Flex gap={3}>
            <Button variant="outline">Exportar PDF</Button>
            <Button variant="outline">Exportar Excel</Button>
            <Button variant="primary">Configurar Reportes</Button>
          </Flex>
        </Flex>

        {/* Period Selector */}
        <Card>
          <Card.Content className="p-6">
            <Flex gap={4} align="center" className="flex-wrap">
              <div className="flex gap-2">
                {['day', 'week', 'month', 'year', 'custom'].map(period => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period === 'day' ? 'Día' : 
                     period === 'week' ? 'Semana' : 
                     period === 'month' ? 'Mes' : 
                     period === 'year' ? 'Año' : 'Personalizado'}
                  </Button>
                ))}
              </div>
              
              {selectedPeriod === 'month' && (
                <Flex gap={2}>
                  <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleDateString('es-ES', { month: 'long' })}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    min="2020"
                    max="2030"
                  />
                </Flex>
              )}
              
              {selectedPeriod === 'custom' && (
                <Flex gap={2}>
                  <Input
                    type="date"
                    label="Desde"
                    value={selectedDateRange.from}
                    onChange={(e) => setSelectedDateRange(prev => ({ ...prev, from: e.target.value }))}
                  />
                  <Input
                    type="date"
                    label="Hasta"
                    value={selectedDateRange.to}
                    onChange={(e) => setSelectedDateRange(prev => ({ ...prev, to: e.target.value }))}
                  />
                </Flex>
              )}
            </Flex>
          </Card.Content>
        </Card>

        {/* Financial Overview */}
        <Grid cols={4} gap={4} responsive>
          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold text-gray-700">Ingresos Totales</h3>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(stats.totalIngresos)}
                </div>
                <p className="text-sm text-gray-500">
                  {stats.totalTratamientos} tratamientos
                </p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold text-gray-700">Gastos Totales</h3>
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrency(stats.totalGastos)}
                </div>
                <p className="text-sm text-gray-500">
                  {financialData.gastos.length} movimientos
                </p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold text-gray-700">Utilidad Bruta</h3>
                <div className={`text-3xl font-bold ${stats.utilidadBruta >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.utilidadBruta)}
                </div>
                <p className="text-sm text-gray-500">
                  Margen: {formatPercentage(stats.margenUtilidad)}
                </p>
              </Flex>
            </Card.Content>
          </Card>

          <Card variant="elevated">
            <Card.Content className="p-6">
              <Flex direction="column" gap={2}>
                <h3 className="text-lg font-semibold text-gray-700">Pacientes Atendidos</h3>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.totalPacientes}
                </div>
                <p className="text-sm text-gray-500">
                  Promedio: {formatCurrency(stats.ingresoPromedioPorPaciente)}
                </p>
              </Flex>
            </Card.Content>
          </Card>
        </Grid>

        {/* Charts and Analysis */}
        <Grid cols={2} gap={6}>
          {/* Top Treatments */}
          <Card>
            <Card.Header>
              <Card.Title>Tratamientos Más Rentables</Card.Title>
            </Card.Header>
            <Card.Content className="p-6">
              <Flex direction="column" gap={4}>
                {topTreatments.map((treatment, index) => (
                  <div key={treatment.nombre} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{treatment.nombre}</h4>
                          <p className="text-sm text-gray-600">
                            {treatment.cantidad} tratamientos • Promedio: {formatCurrency(treatment.promedio)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(treatment.ingresos)}
                      </div>
                    </div>
                  </div>
                ))}
              </Flex>
            </Card.Content>
          </Card>

          {/* Expense Breakdown */}
          <Card>
            <Card.Header>
              <Card.Title>Gastos por Categoría</Card.Title>
            </Card.Header>
            <Card.Content className="p-6">
              <Flex direction="column" gap={4}>
                {expensesByCategory.map((category, index) => {
                  const percentage = (category.monto / stats.totalGastos) * 100;
                  return (
                    <div key={category.categoria} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{category.categoria}</span>
                        <span className="text-lg font-bold text-red-600">
                          {formatCurrency(category.monto)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatPercentage(percentage)} del total
                      </div>
                    </div>
                  );
                })}
              </Flex>
            </Card.Content>
          </Card>
        </Grid>

        {/* Daily Income Chart */}
        <Card>
          <Card.Header>
            <Card.Title>Ingresos Diarios</Card.Title>
          </Card.Header>
          <Card.Content className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dailyIncome.map((day) => (
                  <div key={day.fecha} className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">
                      {new Date(day.fecha).toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(day.monto)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Recent Transactions */}
        <Grid cols={2} gap={6}>
          {/* Recent Income */}
          <Card>
            <Card.Header>
              <Card.Title>Ingresos Recientes</Card.Title>
            </Card.Header>
            <Card.Content className="p-6">
              <Flex direction="column" gap={3} className="max-h-96 overflow-y-auto">
                {financialData.ingresos.slice(0, 10).map((ingreso, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{ingreso.concepto}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(ingreso.fecha).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(ingreso.monto)}
                    </div>
                  </div>
                ))}
              </Flex>
            </Card.Content>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <Card.Header>
              <Card.Title>Gastos Recientes</Card.Title>
            </Card.Header>
            <Card.Content className="p-6">
              <Flex direction="column" gap={3} className="max-h-96 overflow-y-auto">
                {financialData.gastos.slice(0, 10).map((gasto, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{gasto.concepto}</div>
                      <div className="text-sm text-gray-600">
                        {gasto.categoria} • {new Date(gasto.fecha).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-red-600">
                      {formatCurrency(gasto.monto)}
                    </div>
                  </div>
                ))}
              </Flex>
            </Card.Content>
          </Card>
        </Grid>

        {/* Key Metrics */}
        <Card>
          <Card.Header>
            <Card.Title>Métricas Clave de Rendimiento</Card.Title>
          </Card.Header>
          <Card.Content className="p-6">
            <Grid cols={3} gap={6}>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {formatCurrency(stats.ingresoPromedioPorTratamiento)}
                </div>
                <div className="text-sm text-gray-600">Ingreso Promedio por Tratamiento</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrency(stats.ingresoPromedioPorPaciente)}
                </div>
                <div className="text-sm text-gray-600">Ingreso Promedio por Paciente</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {formatPercentage(stats.margenUtilidad)}
                </div>
                <div className="text-sm text-gray-600">Margen de Utilidad</div>
              </div>
            </Grid>
          </Card.Content>
        </Card>
      </Flex>
    </Container>
  );
};

export default ReportesFinancieros;
