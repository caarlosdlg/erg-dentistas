import React from 'react';
import { MapPin, Clock, DollarSign, Users, Archive } from 'lucide-react';
import clsx from 'clsx';
import Loading from '../ui/Loading';

const SearchResults = ({
  results,
  isLoading,
  query,
  onCategoryClick,
  onTreatmentClick,
  onPatientClick,
  className
}) => {
  if (isLoading) {
    return (
      <div className={clsx('flex flex-col items-center justify-center py-12', className)}>
        <Loading size="lg" />
        <p className="mt-4 text-gray-500">Buscando resultados...</p>
      </div>
    );
  }

  if (!results || results.total_results === 0) {
    return (
      <div className={clsx('text-center py-12', className)}>
        <Archive className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron resultados</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron resultados para "{query}". Intenta con otros términos de búsqueda.
        </p>
      </div>
    );
  }

  const CategoryResult = ({ category }) => (
    <div
      onClick={() => onCategoryClick?.(category)}
      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
          {category.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{category.description}</p>
          )}
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            {category.meta_title && (
              <span className="inline-flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {category.meta_title}
              </span>
            )}
            {category.treatments_count && (
              <span className="inline-flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {category.treatments_count} tratamientos
              </span>
            )}
          </div>
        </div>
        <div className="ml-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Categoría
          </span>
        </div>
      </div>
    </div>
  );

  const TreatmentResult = ({ treatment }) => (
    <div
      onClick={() => onTreatmentClick?.(treatment)}
      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{treatment.nombre}</h3>
          {treatment.descripcion && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{treatment.descripcion}</p>
          )}
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            {treatment.codigo && (
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                {treatment.codigo}
              </span>
            )}
            {treatment.categoria && (
              <span className="inline-flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {treatment.categoria.nombre}
              </span>
            )}
            {treatment.duracion_estimada && (
              <span className="inline-flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {treatment.duracion_estimada} min
              </span>
            )}
            {treatment.precio_base && (
              <span className="inline-flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                ${treatment.precio_base}
              </span>
            )}
          </div>
        </div>
        <div className="ml-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Tratamiento
          </span>
        </div>
      </div>
    </div>
  );

  const PatientResult = ({ patient }) => (
    <div
      onClick={() => onPatientClick?.(patient)}
      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{patient.nombre_completo}</h3>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            {patient.numero_expediente && (
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                Exp: {patient.numero_expediente}
              </span>
            )}
            {patient.email && (
              <span>{patient.email}</span>
            )}
            {patient.telefono && (
              <span>{patient.telefono}</span>
            )}
          </div>
        </div>
        <div className="ml-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Paciente
          </span>
        </div>
      </div>
    </div>
  );

  const ResultSection = ({ title, results: sectionResults, type, icon: Icon }) => {
    if (!sectionResults || sectionResults.length === 0) return null;

    return (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Icon className="w-5 h-5 text-gray-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            {title} ({sectionResults.length})
          </h2>
        </div>
        <div className="space-y-4">
          {sectionResults.map((item, index) => {
            switch (type) {
              case 'category':
                return <CategoryResult key={item.id || index} category={item} />;
              case 'treatment':
                return <TreatmentResult key={item.id || index} treatment={item} />;
              case 'patient':
                return <PatientResult key={item.id || index} patient={item} />;
              default:
                return null;
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Search summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          Se encontraron <span className="font-semibold">{results.total_results}</span> resultados para "
          <span className="font-semibold">{query}</span>"
        </p>
      </div>

      {/* Results sections */}
      {results.results?.categories && (
        <ResultSection
          title="Categorías"
          results={results.results.categories.results}
          type="category"
          icon={Archive}
        />
      )}

      {results.results?.tratamientos && (
        <ResultSection
          title="Tratamientos"
          results={results.results.tratamientos.results}
          type="treatment"
          icon={Users}
        />
      )}

      {results.results?.pacientes && (
        <ResultSection
          title="Pacientes"
          results={results.results.pacientes.results}
          type="patient"
          icon={Users}
        />
      )}
    </div>
  );
};

export default SearchResults;
