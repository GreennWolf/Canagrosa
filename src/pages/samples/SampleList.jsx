import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  RefreshCw,
  AlertCircle,
  Calendar,
  Briefcase,
  Beaker,
  AlertTriangle,
  Filter,
  FlaskConical,
  Building,
  FileText,
  Eye,
  ListFilter,
  CheckCircle
} from 'lucide-react';
import CustomizableTable from '../../components/common/CustomizableTable';
import SelectInput from '../../components/common/SelectInput';
import { useModal } from '../../contexts/ModalContext';
import sampleService from '../../services/sampleService';
import ThemeConstants from '../../constants/ThemeConstants';

const SampleList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const samplesTableRef = useRef(null);
  
  // Estado para la lista y filtrado de muestras
  const [samples, setSamples] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Estado para los catálogos/dropdowns
  const [catalogs, setCatalogs] = useState({
    clients: [],
    sampleTypes: [],
    analysisTypes: []
  });
  
  // Estado para filtros
  const [filters, setFilters] = useState({
    TIPO_MUESTRA_ID: '',
    TIPO_ANALISIS_ID: '',
    CLIENTE_ID: location.state?.clientId || '',
    FECHA_DESDE: '',
    FECHA_HASTA: '',
    REFERENCIA_CLIENTE: '',
    URGENTE: ''
  });
  
  // Opciones para los filtros
  const [filterOptions, setFilterOptions] = useState({
    references: []
  });
  
  // Obtener funciones del contexto de modales
  const { openModal, closeModal } = useModal();
  
  // Función para cargar muestras (primera página)
  const fetchSamples = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    setPage(1); // Resetear a la primera página
    
    try {
      // Filtrar parámetros vacíos
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const response = await sampleService.getAll(activeFilters, 1, 50, forceRefresh);
      setSamples(response.data || []);
      setFilteredSamples(response.data || []);
      setHasMore(response.hasMore || false);
      setTotalCount(response.totalCount || response.data.length);
      
      // Actualizar opciones para los filtros solo si no hay filtros activos
      if (Object.keys(activeFilters).length === 0) {
        updateFilterOptions(response.data);
      }
    } catch (err) {
      console.error('Error fetching samples:', err);
      setError('No se pudieron cargar las muestras. Por favor, intente de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);
  
  // Función para cargar más muestras (paginado)
  const loadMoreSamples = useCallback(async () => {
    // Si no hay más datos o ya está cargando, no hacemos nada
    if (!hasMore || isLoadingMore) return false;
    
    setIsLoadingMore(true);
    
    try {
      // Filtrar parámetros vacíos
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const nextPage = page + 1;
      const response = await sampleService.getAll(activeFilters, nextPage, 50);
      
      // Actualizar estados
      setPage(nextPage);
      setSamples(prevSamples => [...prevSamples, ...response.data]);
      setFilteredSamples(prevSamples => [...prevSamples, ...response.data]);
      setHasMore(response.hasMore);
      
      return true; // Indicar éxito
    } catch (err) {
      console.error('Error loading more samples:', err);
      return false; // Indicar fallo
    } finally {
      setIsLoadingMore(false);
    }
  }, [filters, page, hasMore, isLoadingMore]);
  
  // Cargar catálogos relacionados
  const loadCatalogs = useCallback(async () => {
    try {
      const catalogsData = await sampleService.getRelatedCatalogs();
      
      // Transformar datos para los dropdowns
      const clientOptions = catalogsData.clients.map(client => ({
        value: client.ID_CLIENTE,
        label: client.NOMBRE
      }));
      
      const sampleTypeOptions = catalogsData.sampleTypes.map(type => ({
        value: type.ID_TIPO_MUESTRA,
        label: type.NOMBRE
      }));
      
      const analysisTypeOptions = catalogsData.analysisTypes.map(type => ({
        value: type.ID_TIPO_ANALISIS,
        label: type.NOMBRE
      }));
      
      setCatalogs({
        clients: clientOptions,
        sampleTypes: sampleTypeOptions,
        analysisTypes: analysisTypeOptions
      });
    } catch (err) {
      console.error('Error loading catalogs:', err);
      setError('Error al cargar los catálogos. Algunas opciones de filtrado pueden no estar disponibles.');
    }
  }, []);
  
  // Actualizar opciones para los filtros
  const updateFilterOptions = useCallback((samplesData) => {
    const referenceOptions = [...new Set(samplesData
      .filter(sample => sample.REFERENCIA_CLIENTE)
      .map(sample => sample.REFERENCIA_CLIENTE))]
      .map(ref => ({ value: ref, label: ref }));
    
    setFilterOptions({
      references: referenceOptions
    });
  }, []);
  
  // Cargar muestras y catálogos al montar el componente
  useEffect(() => {
    fetchSamples();
    loadCatalogs();
  }, [fetchSamples, loadCatalogs]);
  
  // Búsqueda local para filtrar muestras sin llamar a la API
  const handleLocalSearch = useCallback((searchText) => {
    if (!searchText.trim()) {
      setFilteredSamples(samples);
      return;
    }
    
    const searchLower = searchText.toLowerCase();
    const filtered = samples.filter(sample => {
      const referenceMatch = (sample.REFERENCIA_CLIENTE || '').toLowerCase().includes(searchLower);
      return referenceMatch;
    });
    
    setFilteredSamples(filtered);
  }, [samples]);
  
  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? '1' : '') : value
    }));
    
    // Si cambia el filtro de referencia, hacer una búsqueda local
    if (name === 'REFERENCIA_CLIENTE') {
      handleLocalSearch(value);
    }
  };
  
  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      TIPO_MUESTRA_ID: '',
      TIPO_ANALISIS_ID: '',
      CLIENTE_ID: location.state?.clientId || '',
      FECHA_DESDE: '',
      FECHA_HASTA: '',
      REFERENCIA_CLIENTE: '',
      URGENTE: ''
    });
    setFilteredSamples(samples);
  };
  
  // Crear nueva muestra
  const handleCreateSample = () => {
    navigate('/muestras/nueva', { 
      state: { clientId: filters.CLIENTE_ID } 
    });
  };
  
  // Ver detalles de muestra (si tuviéramos una vista detallada)
  const handleViewSample = (sample) => {
    if (!sample) return;
    
    // Mostrar detalles de la muestra en un modal
    openModal('viewSample', {
      title: `Muestra #${sample.ID_MUESTRA}`,
      size: 'md',
      content: (
        <div className="p-4">
          <div className="mb-4 pb-3 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">{sample.REFERENCIA_CLIENTE || `Muestra #${sample.ID_MUESTRA}`}</h2>
              {sample.URGENTE === 1 && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center">
                  <AlertTriangle size={12} className="mr-1" />
                  Urgente
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Información General</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <span className="w-32 text-gray-500">Cliente:</span>
                  <span className="font-medium">
                    {catalogs.clients.find(c => c.value === sample.CLIENTE_ID)?.label || sample.CLIENTE_ID}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="w-32 text-gray-500">Tipo Muestra:</span>
                  <span className="font-medium">
                    {catalogs.sampleTypes.find(t => t.value === sample.TIPO_MUESTRA_ID)?.label || sample.TIPO_MUESTRA_ID}
                  </span>
                </div>
                {sample.TIPO_ANALISIS_ID && (
                  <div className="flex items-start">
                    <span className="w-32 text-gray-500">Tipo Análisis:</span>
                    <span className="font-medium">
                      {catalogs.analysisTypes.find(t => t.value === sample.TIPO_ANALISIS_ID)?.label || sample.TIPO_ANALISIS_ID}
                    </span>
                  </div>
                )}
                <div className="flex items-start">
                  <span className="w-32 text-gray-500">Baño:</span>
                  <span className="font-medium">{sample.BANO_ID || '-'}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-32 text-gray-500">Referencia:</span>
                  <span className="font-medium">{sample.REFERENCIA_CLIENTE || '-'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Fechas</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <span className="w-32 text-gray-500">Muestreo:</span>
                  <span className="font-medium">{sample.FECHA_MUESTREO || '-'}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-32 text-gray-500">Recepción:</span>
                  <span className="font-medium">{sample.FECHA_RECEPCION || '-'}</span>
                </div>
                {sample.OBSERVACIONES && (
                  <div className="flex items-start mt-2">
                    <span className="w-32 text-gray-500">Observaciones:</span>
                    <span className="font-medium">{sample.OBSERVACIONES}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={() => closeModal('viewSample')}
              className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      )
    });
  };

  // Definición de columnas para la tabla
  const columns = [
    {
      accessor: 'ID_MUESTRA',
      header: 'ID',
      width: 'w-16'
    },
    {
      accessor: 'CLIENTE_ID',
      header: 'Cliente',
      render: (row) => {
        const client = catalogs.clients.find(c => c.value === row.CLIENTE_ID);
        return (
          <div className="flex items-center">
            <Building size={14} className="mr-1 text-gray-400" />
            <span className="truncate max-w-xs">{client ? client.label : `Cliente ${row.CLIENTE_ID}`}</span>
          </div>
        );
      }
    },
    {
      accessor: 'TIPO_MUESTRA_ID',
      header: 'Tipo Muestra',
      render: (row) => {
        const type = catalogs.sampleTypes.find(t => t.value === row.TIPO_MUESTRA_ID);
        return (
          <div className="flex items-center">
            <FlaskConical size={14} className="mr-1 text-gray-400" />
            <span>{type ? type.label : `Tipo ${row.TIPO_MUESTRA_ID}`}</span>
          </div>
        );
      }
    },
    {
      accessor: 'TIPO_ANALISIS_ID',
      header: 'Tipo Análisis',
      render: (row) => {
        const type = catalogs.analysisTypes.find(t => t.value === row.TIPO_ANALISIS_ID);
        return row.TIPO_ANALISIS_ID ? (
          <div className="flex items-center">
            <Beaker size={14} className="mr-1 text-gray-400" />
            <span>{type ? type.label : `Análisis ${row.TIPO_ANALISIS_ID}`}</span>
          </div>
        ) : '-';
      }
    },
    {
      accessor: 'REFERENCIA_CLIENTE',
      header: 'Referencia',
      render: (row) => (
        <div className="flex items-center">
          <FileText size={14} className="mr-1 text-gray-400" />
          <span className="truncate max-w-xs">{row.REFERENCIA_CLIENTE || '-'}</span>
        </div>
      )
    },
    {
      accessor: 'FECHA_MUESTREO',
      header: 'Fecha Muestreo',
      render: (row) => (
        <div className="flex items-center">
          <Calendar size={14} className="mr-1 text-gray-400" />
          <span>{row.FECHA_MUESTREO || '-'}</span>
        </div>
      ),
      width: 'w-36'
    },
    {
      accessor: 'FECHA_RECEPCION',
      header: 'Fecha Recepción',
      render: (row) => (
        <div className="flex items-center">
          <Calendar size={14} className="mr-1 text-gray-400" />
          <span>{row.FECHA_RECEPCION || '-'}</span>
        </div>
      ),
      width: 'w-36'
    },
    {
      accessor: 'URGENTE',
      header: 'Urgente',
      render: (row) => (
        row.URGENTE === 1 ? 
          <div className="flex items-center text-red-600">
            <AlertTriangle size={14} className="mr-1" />
            <span>Sí</span>
          </div> : 
          <span className="text-gray-500">No</span>
      ),
      width: 'w-24'
    },
    {
      accessor: 'BANO_ID',
      header: 'Baño',
      width: 'w-20'
    },
    {
      accessor: 'CENTRO_ID',
      header: 'Centro',
      width: 'w-20'
    },
    {
      accessor: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center justify-end">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleViewSample(row);
            }}
            className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
            title="Ver detalle"
          >
            <Eye size={14} />
          </button>
        </div>
      ),
      width: 'w-20'
    }
  ];
  
  // Columnas visibles por defecto
  const defaultVisibleColumns = [
    'ID_MUESTRA', 'CLIENTE_ID', 'TIPO_MUESTRA_ID', 'REFERENCIA_CLIENTE', 
    'FECHA_MUESTREO', 'FECHA_RECEPCION', 'URGENTE', 'actions'
  ];

  return (
    <div className="h-full flex flex-col overflow-y-hidden">
      {/* Barra de herramientas compacta */}
      <div className="bg-white shadow rounded-md p-1 flex flex-wrap items-center gap-1 mb-1">
        <div className="flex items-center space-x-1">
          <button 
            onClick={handleCreateSample}
            className="flex items-center px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            title="Nueva muestra"
          >
            <Plus size={14} className="mr-1" />
            <span className="hidden sm:inline">Nueva</span>
          </button>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
            title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          >
            <Filter size={14} />
            <span className="hidden sm:inline ml-1">{showFilters ? 'Ocultar filtros' : 'Filtros'}</span>
          </button>
          
          <button
            onClick={() => fetchSamples(true)}
            className="flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            title="Actualizar datos"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline ml-1">Actualizar</span>
          </button>
        </div>
        
        <div className="flex-grow"></div>
        
        <div className="relative w-48 sm:w-64">
          <SelectInput
            options={filterOptions.references}
            value={filters.REFERENCIA_CLIENTE}
            onChange={handleFilterChange}
            placeholder="Buscar muestra..."
            name="REFERENCIA_CLIENTE"
            id="search-reference"
            icon={<Search size={14} className="text-gray-400" />}
          />
        </div>
      </div>
      
      {/* Panel de filtros colapsable */}
      {showFilters && (
        <div className="bg-gray-50 border rounded-md p-2 mb-1 text-xs">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center text-xs font-medium text-gray-800">
              <ListFilter size={14} className="mr-1" />
              Filtros de búsqueda
            </div>
            <button 
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Cliente
              </label>
              <SelectInput
                options={catalogs.clients}
                value={filters.CLIENTE_ID}
                onChange={handleFilterChange}
                placeholder="Seleccionar cliente"
                name="CLIENTE_ID"
                id="filter-cliente"
                icon={<Building size={12} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Tipo de Muestra
              </label>
              <SelectInput
                options={catalogs.sampleTypes}
                value={filters.TIPO_MUESTRA_ID}
                onChange={handleFilterChange}
                placeholder="Seleccionar tipo"
                name="TIPO_MUESTRA_ID"
                id="filter-tipo-muestra"
                icon={<FlaskConical size={12} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Tipo de Análisis
              </label>
              <SelectInput
                options={catalogs.analysisTypes}
                value={filters.TIPO_ANALISIS_ID}
                onChange={handleFilterChange}
                placeholder="Seleccionar análisis"
                name="TIPO_ANALISIS_ID"
                id="filter-tipo-analisis"
                icon={<Beaker size={12} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Referencia Cliente
              </label>
              <SelectInput
                options={filterOptions.references}
                value={filters.REFERENCIA_CLIENTE}
                onChange={handleFilterChange}
                placeholder="Buscar por referencia"
                name="REFERENCIA_CLIENTE"
                id="filter-referencia"
                icon={<FileText size={12} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                name="FECHA_DESDE"
                value={filters.FECHA_DESDE}
                onChange={handleFilterChange}
                className="w-full p-1.5 text-xs border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                name="FECHA_HASTA"
                value={filters.FECHA_HASTA}
                onChange={handleFilterChange}
                className="w-full p-1.5 text-xs border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="flex items-end">
              <label className="flex items-center text-xs">
                <input 
                  type="checkbox" 
                  name="URGENTE"
                  checked={filters.URGENTE === '1'}
                  onChange={handleFilterChange}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="flex items-center">
                  <AlertTriangle size={12} className="mr-1 text-red-500" />
                  Solo urgentes
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
      
      {/* Mensaje de error (si existe) */}
      {error && (
        <div className="bg-red-50 p-3 mb-1 rounded-md border border-red-200 text-sm text-red-700 flex items-start">
          <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}
      
      {/* Tabla de muestras */}
      <div className="flex-grow">
        <CustomizableTable
          ref={samplesTableRef}
          data={filteredSamples}
          columns={columns}
          isLoading={isLoading && filteredSamples.length === 0}
          isLoadingMore={isLoadingMore}
          onRowClick={(sample) => {
            setSelectedSample(sample);
            handleViewSample(sample);
          }}
          initialVisibleColumns={defaultVisibleColumns}
          tableId="samples-table"
          loadMoreData={loadMoreSamples}
          hasMoreData={hasMore}
          emptyMessage={
            filters.TIPO_MUESTRA_ID || filters.TIPO_ANALISIS_ID || filters.CLIENTE_ID || 
            filters.FECHA_DESDE || filters.FECHA_HASTA || filters.REFERENCIA_CLIENTE || filters.URGENTE
              ? "No hay muestras que coincidan con los filtros" 
              : "No hay muestras disponibles"
          }
        />
      </div>
      
      {/* Barra de estado inferior con contador */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-1 text-xs text-gray-500">
        {filteredSamples.length} {filteredSamples.length === 1 ? "muestra" : "muestras"} {
          totalCount > filteredSamples.length 
            ? `(mostrando ${filteredSamples.length} de ${totalCount} totales)` 
            : ""
        }
      </div>
    </div>
  );
};

export default SampleList;