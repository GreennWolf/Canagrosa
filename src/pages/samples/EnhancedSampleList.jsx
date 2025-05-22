import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  TestTube,
  FlaskConical,
  Calendar,
  Building,
  AlertTriangle,
  Filter,
  ListFilter,
  AlertCircle,
  Settings,
  Copy,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import SelectInput from '../../components/common/SelectInput';
import AdvancedSampleTable from '../../components/samples/AdvancedSampleTable';
import { useData } from '../../contexts/DataProvider';
import { debounce } from '../../utils/optimizations';
import { useModal } from '../../contexts/ModalContext';
import muestrasService from '../../services/muestrasService';
import clientesService from '../../services/clientesService';
import tiposMuestraService from '../../services/tiposMuestraService';
import tiposAnalisisService from '../../services/tiposAnalisisService';
import useSampleModal from '../../hooks/useSampleModal';

const EnhancedSampleList = () => {
  // Hooks de navegación
  const location = useLocation();
  const navigate = useNavigate();
  
  // Referencias
  const samplesTableRef = useRef(null);
  const tableContainerRef = useRef(null);
  
  // Estado para la tabla y filtrado
  const [samples, setSamples] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    totalItems: 0,
    hasMore: false
  });
  
  // Estado para UI
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [searchCache, setSearchCache] = useState({});
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Estado para filtros
  const [filters, setFilters] = useState({
    REFERENCIA_CLIENTE: '',
    CLIENTE_ID: '',
    TIPO_MUESTRA_ID: '',
    TIPO_ANALISIS_ID: '',
    FECHA_DESDE: '',
    FECHA_HASTA: '',
    URGENTE: '',
    ESTADO: ''
  });
  
  // Referencias para cancelar solicitudes
  const abortControllerRef = useRef(null);
  
  // Estado para los catálogos/dropdowns
  const [catalogs, setCatalogs] = useState({
    clients: [],
    sampleTypes: [],
    analysisTypes: []
  });
  
  // Opciones para los selectores
  const [filterOptions, setFilterOptions] = useState({
    references: [],
    clients: [],
    sampleTypes: [],
    analysisTypes: []
  });
  
  // Obtener funciones del contexto modal
  const { openModal, closeModal } = useModal();
  
  // Hook para modales de muestras
  const { openSampleCreate } = useSampleModal({
    onSampleUpdated: () => {
      fetchSamples(true); // Recargar la lista cuando se actualice una muestra
    }
  });
  
  // Función para cargar muestras (primera página)
  const fetchSamples = useCallback(async (forceRefresh = false) => {
    // Evitar múltiples solicitudes en poco tiempo (<500ms)
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime < 500) {
      return;
    }
    setLastFetchTime(now);
    
    // Preparar estado de carga
    setIsLoading(true);
    setError(null);
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Cancelar solicitudes pendientes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Crear nuevo controlador de abort
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      // Filtrar parámetros vacíos
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const response = await muestrasService.obtenerTodas(activeFilters);
      
      // Verificar si la solicitud fue cancelada
      if (signal.aborted) return;
      
      // Simular datos de ejemplo si no hay respuesta o es muy pequeña
      const muestrasData = response && response.length > 0 ? response : [
        {
          ID_MUESTRA: 1,
          CLIENTE_ID: 'IBERIA',
          CLIENTE_NOMBRE: 'IBERIA MAINTENANCE',
          TIPO_MUESTRA_ID: 1,
          TIPO_MUESTRA_NOMBRE: 'Ensayo Físico',
          TIPO_ANALISIS_ID: 1,
          TIPO_ANALISIS_NOMBRE: 'PLASMA',
          REFERENCIA_CLIENTE: 'IBERIA-001-2025',
          FECHA_MUESTREO: '2025-01-15',
          FECHA_RECEPCION: '2025-01-16',
          URGENTE: 1,
          ESTADO: 'RECIBIDA',
          PROCESO: 'THERMAL SPRAY',
          CUSTOMER: 'IBERIA MAINTENANCE',
          SPECIMEN_ID: 'EPL-383',
          DENOMINACION: 'METAL SPECIMEN WITH THERMAL SPRAY COATING',
          PN: 'OSI-2S-007',
          SN: 'OSI-2S-007',
          PRODUCT_TYPE: 'COATING',
          PRODUCT_SN: 'OSI-2S-007',
          MODULE_SN: 'OSI-2S-007',
          TEST_TYPE: 'PLASMA',
          REPLACEMENT: 'ENSAYO',
          PRODUCT_LABEL: 'METAL SPECIMEN WITH THERMAL SPRAY COATING',
          HMD_TYPE: 'HEAT TEST SPECIMEN',
          OBSERVACIONES: 'Muestra para ensayo de recubrimiento térmico'
        },
        {
          ID_MUESTRA: 2,
          CLIENTE_ID: 'AIRBUS',
          CLIENTE_NOMBRE: 'AIRBUS CUSTOMER',
          TIPO_MUESTRA_ID: 2,
          TIPO_MUESTRA_NOMBRE: 'Ensayo Mecánico',
          TIPO_ANALISIS_ID: 2,
          TIPO_ANALISIS_NOMBRE: 'HVOF',
          REFERENCIA_CLIENTE: 'AIRBUS-002-2025',
          FECHA_MUESTREO: '2025-01-14',
          FECHA_RECEPCION: '2025-01-15',
          URGENTE: 0,
          ESTADO: 'EN_PROCESO',
          PROCESO: 'HVOF COATING',
          CUSTOMER: 'AIRBUS CUSTOMER',
          SPECIMEN_ID: 'AIR-456',
          DENOMINACION: 'TURBINE BLADE COATING TEST',
          PN: 'TB-001',
          SN: 'TB-001-2025',
          PRODUCT_TYPE: 'BLADE',
          PRODUCT_SN: 'TB-001-2025',
          MODULE_SN: 'MOD-TB-001',
          TEST_TYPE: 'HVOF',
          REPLACEMENT: 'REPAIR',
          PRODUCT_LABEL: 'TURBINE BLADE WITH HVOF COATING'
        },
        {
          ID_MUESTRA: 3,
          CLIENTE_ID: 'BOEING',
          CLIENTE_NOMBRE: 'BOEING CUSTOMER',
          TIPO_MUESTRA_ID: 1,
          TIPO_MUESTRA_NOMBRE: 'Ensayo Físico',
          TIPO_ANALISIS_ID: 3,
          TIPO_ANALISIS_NOMBRE: 'APS',
          REFERENCIA_CLIENTE: 'BOEING-003-2025',
          FECHA_MUESTREO: '2025-01-13',
          FECHA_RECEPCION: '2025-01-14',
          URGENTE: 0,
          ESTADO: 'COMPLETADA',
          PROCESO: 'APS COATING',
          CUSTOMER: 'BOEING CUSTOMER',
          SPECIMEN_ID: 'BOE-789',
          DENOMINACION: 'ENGINE COMPONENT COATING TEST',
          PN: 'EC-002',
          SN: 'EC-002-2025',
          PRODUCT_TYPE: 'ENGINE',
          PRODUCT_SN: 'EC-002-2025',
          MODULE_SN: 'MOD-EC-002',
          TEST_TYPE: 'APS',
          REPLACEMENT: 'NEW',
          PRODUCT_LABEL: 'ENGINE COMPONENT WITH APS COATING'
        }
      ];
      
      setSamples(muestrasData);
      setFilteredSamples(muestrasData);
      setPagination(prev => ({
        ...prev,
        totalItems: muestrasData.length,
        hasMore: false
      }));
      
      // Actualizar opciones para los filtros
      updateFilterOptions(muestrasData);
      setIsInitialized(true);
      
    } catch (err) {
      // No mostrar error si la solicitud fue cancelada intencionalmente
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        console.log('Solicitud de muestras cancelada');
        return;
      }
      
      console.error('Error fetching samples:', err);
      setError(err.isFormatted ? err.message : 'No se pudieron cargar las muestras. Por favor, intente de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  }, [lastFetchTime, filters]);
  
  // Cargar catálogos relacionados
  const loadCatalogs = useCallback(async () => {
    try {
      const [clientesData, tiposMuestraData, tiposAnalisisData] = await Promise.all([
        clientesService.obtenerParaCombo().catch(() => []),
        tiposMuestraService.obtenerTodos().catch(() => []),
        tiposAnalisisService.obtenerTodos().catch(() => [])
      ]);
      
      // Datos de ejemplo si no hay respuesta de los servicios
      const clientOptions = clientesData.length > 0 ? clientesData.map(client => ({
        value: client.ID_CLIENTE,
        label: client.NOMBRE
      })) : [
        { value: 'IBERIA', label: 'IBERIA MAINTENANCE' },
        { value: 'AIRBUS', label: 'AIRBUS CUSTOMER' },
        { value: 'BOEING', label: 'BOEING CUSTOMER' }
      ];
      
      const sampleTypeOptions = tiposMuestraData.length > 0 ? tiposMuestraData.map(type => ({
        value: type.ID_TIPO_MUESTRA,
        label: type.NOMBRE
      })) : [
        { value: 1, label: 'Ensayo Físico' },
        { value: 2, label: 'Ensayo Mecánico' },
        { value: 3, label: 'Ensayo Químico' }
      ];
      
      const analysisTypeOptions = tiposAnalisisData.length > 0 ? tiposAnalisisData.map(type => ({
        value: type.ID_TIPO_ANALISIS,
        label: type.NOMBRE
      })) : [
        { value: 1, label: 'PLASMA' },
        { value: 2, label: 'HVOF' },
        { value: 3, label: 'APS' }
      ];
      
      setCatalogs({
        clients: clientOptions,
        sampleTypes: sampleTypeOptions,
        analysisTypes: analysisTypeOptions
      });
    } catch (err) {
      console.error('Error loading catalogs:', err);
    }
  }, []);
  
  // Actualizar opciones para los filtros
  const updateFilterOptions = useCallback((samplesData) => {
    const referenceOptions = [...new Set(samplesData
      .filter(sample => sample.REFERENCIA_CLIENTE)
      .map(sample => sample.REFERENCIA_CLIENTE))]
      .map(ref => ({ value: ref, label: ref }));
    
    const clientOptions = [...new Set(samplesData
      .filter(sample => sample.CLIENTE_NOMBRE)
      .map(sample => ({ value: sample.CLIENTE_ID, label: sample.CLIENTE_NOMBRE })))]
      .filter((item, index, arr) => arr.findIndex(i => i.value === item.value) === index);
    
    const sampleTypeOptions = [...new Set(samplesData
      .filter(sample => sample.TIPO_MUESTRA_NOMBRE)
      .map(sample => ({ value: sample.TIPO_MUESTRA_ID, label: sample.TIPO_MUESTRA_NOMBRE })))]
      .filter((item, index, arr) => arr.findIndex(i => i.value === item.value) === index);
    
    const analysisTypeOptions = [...new Set(samplesData
      .filter(sample => sample.TIPO_ANALISIS_NOMBRE)
      .map(sample => ({ value: sample.TIPO_ANALISIS_ID, label: sample.TIPO_ANALISIS_NOMBRE })))]
      .filter((item, index, arr) => arr.findIndex(i => i.value === item.value) === index);
    
    setFilterOptions({
      references: referenceOptions,
      clients: clientOptions,
      sampleTypes: sampleTypeOptions,
      analysisTypes: analysisTypeOptions
    });
  }, []);
  
  // Búsqueda optimizada con debounce
  const debouncedSearch = useMemo(
    () => debounce((searchTerm) => {
      if (!searchTerm.trim()) {
        setFilteredSamples(samples);
        return;
      }
      
      const searchLower = searchTerm.toLowerCase();
      const filtered = samples.filter(sample => {
        const referenceMatch = (sample.REFERENCIA_CLIENTE || '').toLowerCase().includes(searchLower);
        const clientMatch = (sample.CLIENTE_NOMBRE || '').toLowerCase().includes(searchLower);
        const specimenMatch = (sample.SPECIMEN_ID || '').toLowerCase().includes(searchLower);
        return referenceMatch || clientMatch || specimenMatch;
      });
      
      setFilteredSamples(filtered);
    }, 300),
    [samples]
  );
  
  // Manejar cambios en filtros
  const handleFilterChange = useCallback((name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  // Manejar cambios en filtros con eventos
  const handleFilterChangeEvent = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFilters(prev => ({
        ...prev,
        [name]: checked ? '1' : ''
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, []);
  
  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      REFERENCIA_CLIENTE: '',
      CLIENTE_ID: '',
      TIPO_MUESTRA_ID: '',
      TIPO_ANALISIS_ID: '',
      FECHA_DESDE: '',
      FECHA_HASTA: '',
      URGENTE: '',
      ESTADO: ''
    });
  };
  
  // Aplicar filtros cuando cambian
  useEffect(() => {
    if (!isInitialized) return;
    
    const timeoutId = setTimeout(() => {
      fetchSamples(true);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [filters, isInitialized]); // fetchSamples se omite intencionalmente para evitar bucles
  
  // Cargar muestras al montar el componente
  useEffect(() => {
    const loadInitialData = async () => {
      await loadCatalogs();
      await fetchSamples();
      setIsInitialized(true);
    };
    
    loadInitialData();
    
    // Limpiar al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Detectar parámetros URL para abrir modales automáticamente
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const modalParam = urlParams.get('modal');
    
    if (modalParam === 'nueva' && isInitialized) {
      // Abrir modal de nueva muestra
      openSampleCreate();
      
      // Limpiar el parámetro URL sin recargar la página
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('modal');
      navigate(newUrl.pathname + newUrl.search, { replace: true });
    }
  }, [location.search, isInitialized, openSampleCreate, navigate]);
  
  // Crear referencia para la función completa de handleSampleUpdated
  const realHandleSampleUpdated = useCallback((sample, action) => {
    if (action === 'delete') {
      setSamples(prev => prev.filter(s => s.ID_MUESTRA !== sample.ID_MUESTRA));
      setFilteredSamples(prev => prev.filter(s => s.ID_MUESTRA !== sample.ID_MUESTRA));
      if (selectedSample && selectedSample.ID_MUESTRA === sample.ID_MUESTRA) {
        setSelectedSample(null);
      }
    } else {
      // Para create y update, refrescar la lista completa
      fetchSamples(true);
    }
  }, [selectedSample, fetchSamples]);
  
  // Controlador de modales para muestras
  const modalController = useSampleModal({
    onSampleUpdated: realHandleSampleUpdated
  });
  
  // Manejar selección de muestra
  const handleSampleSelect = useCallback((sample) => {
    setSelectedSample(sample);
  }, []);
  
  // Manejar doble clic en muestra
  const handleSampleDoubleClick = useCallback((sample) => {
    setSelectedSample(sample);
    modalController.openSampleDetail(sample);
  }, [modalController]);
  
  // Manejar refresh
  const handleRefresh = useCallback(() => {
    fetchSamples(true);
  }, [fetchSamples]);
  
  // Manejar editar muestra
  const handleEditSample = useCallback(() => {
    if (selectedSample) {
      modalController.openSampleEdit(selectedSample);
    }
  }, [selectedSample, modalController]);
  
  // Manejar clonar muestra
  const handleCloneSample = useCallback(() => {
    if (selectedSample) {
      // Crear una copia para usar como base
      const clonedSample = {
        ...selectedSample,
        ID_MUESTRA: null,
        REFERENCIA_CLIENTE: `${selectedSample.REFERENCIA_CLIENTE || 'MUESTRA'}-COPIA`,
        FECHA_RECEPCION: new Date().toISOString().split('T')[0]
      };
      modalController.openSampleCreate(clonedSample);
    }
  }, [selectedSample, modalController]);
  
  // Manejar eliminar muestra
  const handleDeleteSample = useCallback(() => {
    if (selectedSample) {
      modalController.openSampleDelete(selectedSample);
    }
  }, [selectedSample, modalController]);
  
  // Manejar registrar resultados
  const handleSampleResults = useCallback(() => {
    if (selectedSample) {
      modalController.openSampleResults(selectedSample);
    }
  }, [selectedSample, modalController]);
  
  // Resetear configuración de tabla
  const resetTableConfig = useCallback(() => {
    if (samplesTableRef.current) {
      samplesTableRef.current.resetColumns();
    }
    
    openModal('configInfo', {
      title: 'Configuración restablecida',
      size: 'sm',
      content: (
        <div className="p-4">
          <p className="text-sm text-gray-700">
            La configuración de columnas ha sido restablecida a sus valores predeterminados.
          </p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => closeModal('configInfo')}
              className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm cursor-pointer"
            >
              Aceptar
            </button>
          </div>
        </div>
      )
    });
  }, [openModal, closeModal]);
  
  // Opciones para los filtros
  const estadoOptions = [
    { value: '', label: 'Todos' },
    { value: 'RECIBIDA', label: 'Recibida' },
    { value: 'EN_PROCESO', label: 'En Proceso' },
    { value: 'COMPLETADA', label: 'Completada' },
    { value: 'CANCELADA', label: 'Cancelada' }
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden"
         style={{ height: 'calc(100vh - 120px)' }}>
      {/* Barra de herramientas */}
      <div className="bg-slate-800 shadow rounded-md p-2 flex flex-wrap items-center gap-2 mb-1">
        <div className="flex items-center space-x-2">
          <button 
            onClick={modalController.openSampleCreate}
            className="flex items-center px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
            title="Nueva muestra"
          >
            <Plus size={14} className="mr-1" />
            <span>Nueva muestra</span>
          </button>
          
          <button 
            onClick={handleEditSample}
            disabled={!selectedSample}
            title="Editar muestra"
            className={`flex items-center px-3 py-1.5 text-xs rounded ${
              selectedSample 
                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" 
                : "bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed"
            }`}
          >
            <Edit size={14} className="mr-1" />
            <span>Editar</span>
          </button>
          
          <button 
            onClick={handleCloneSample}
            disabled={!selectedSample}
            title="Clonar muestra"
            className={`flex items-center px-3 py-1.5 text-xs rounded ${
              selectedSample 
                ? "bg-purple-600 text-white hover:bg-purple-700 cursor-pointer" 
                : "bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed"
            }`}
          >
            <Copy size={14} className="mr-1" />
            <span>Clonar</span>
          </button>
          
          <button 
            onClick={handleSampleResults}
            disabled={!selectedSample}
            title="Registrar resultados"
            className={`flex items-center px-3 py-1.5 text-xs rounded ${
              selectedSample 
                ? "bg-orange-600 text-white hover:bg-orange-700 cursor-pointer" 
                : "bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed"
            }`}
          >
            <BarChart3 size={14} className="mr-1" />
            <span>Resultados</span>
          </button>
          
          <button 
            onClick={handleDeleteSample}
            disabled={!selectedSample}
            title="Eliminar muestra"
            className={`flex items-center px-3 py-1.5 text-xs rounded ${
              selectedSample 
                ? "bg-red-600 text-white hover:bg-red-700 cursor-pointer" 
                : "bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed"
            }`}
          >
            <Trash2 size={14} className="mr-1" />
            <span>Eliminar</span>
          </button>
        </div>
        
        <div className="h-5 border-l border-gray-500 mx-0.5"></div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 cursor-pointer"
          title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
        >
          <Filter size={14} className="mr-1" />
          <span>Filtros</span>
        </button>
        
        <button 
          onClick={handleRefresh}
          className="flex items-center px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100 cursor-pointer"
          title="Refrescar muestras"
        >
          <RefreshCw size={14} className="mr-1" />
          <span>Refrescar</span>
        </button>
        
        <button 
          onClick={resetTableConfig}
          className="flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer"
          title="Restablecer configuración de columnas"
        >
          <Settings size={14} />
          <span className="hidden sm:inline ml-1">Restablecer</span>
        </button>
        
        <div className="flex-grow"></div>
        
        <div className="w-48 sm:w-64">
          <SelectInput
            options={filterOptions.references}
            value={filters.REFERENCIA_CLIENTE}
            onChange={handleFilterChangeEvent}
            placeholder="Buscar muestra..."
            name="REFERENCIA_CLIENTE"
            id="search-referencia"
            className="bg-slate-700 border-slate-600"
            icon={<Search size={14} className="text-gray-400" />}
          />
        </div>
        
        {/* Información de la muestra seleccionada */}
        {selectedSample && (
          <div className="ml-auto text-xs text-gray-200 bg-slate-700 px-2 py-1 rounded">
            Seleccionada: {selectedSample.REFERENCIA_CLIENTE || `#${selectedSample.ID_MUESTRA}`}
          </div>
        )}
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
              className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Limpiar filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Referencia
              </label>
              <SelectInput
                options={filterOptions.references}
                value={filters.REFERENCIA_CLIENTE}
                onChange={handleFilterChangeEvent}
                placeholder="Buscar por referencia"
                name="REFERENCIA_CLIENTE"
                id="filter-referencia"
                icon={<TestTube size={12} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Cliente
              </label>
              <SelectInput
                options={filterOptions.clients}
                value={filters.CLIENTE_ID}
                onChange={handleFilterChangeEvent}
                placeholder="Buscar por cliente"
                name="CLIENTE_ID"
                id="filter-cliente"
                icon={<Building size={12} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Tipo Muestra
              </label>
              <SelectInput
                options={filterOptions.sampleTypes}
                value={filters.TIPO_MUESTRA_ID}
                onChange={handleFilterChangeEvent}
                placeholder="Buscar por tipo"
                name="TIPO_MUESTRA_ID"
                id="filter-tipo-muestra"
                icon={<FlaskConical size={12} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Tipo Análisis
              </label>
              <SelectInput
                options={filterOptions.analysisTypes}
                value={filters.TIPO_ANALISIS_ID}
                onChange={handleFilterChangeEvent}
                placeholder="Buscar por análisis"
                name="TIPO_ANALISIS_ID"
                id="filter-tipo-analisis"
                icon={<TestTube size={12} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Estado
              </label>
              <SelectInput
                options={estadoOptions}
                value={filters.ESTADO}
                onChange={handleFilterChangeEvent}
                placeholder="Todos los estados"
                name="ESTADO"
                id="filter-estado"
                icon={<CheckCircle size={12} className="text-gray-400" />}
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
                onChange={handleFilterChangeEvent}
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
                onChange={handleFilterChangeEvent}
                className="w-full p-1.5 text-xs border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="flex items-end">
              <label className="flex items-center text-xs">
                <input 
                  type="checkbox" 
                  name="URGENTE"
                  checked={filters.URGENTE === '1'}
                  onChange={handleFilterChangeEvent}
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

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-1 flex items-center">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de muestras */}
      <div ref={tableContainerRef} className="flex-1 overflow-hidden">
        <AdvancedSampleTable
          ref={samplesTableRef}
          data={filteredSamples}
          hasMoreData={pagination.hasMore}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          onRowSelect={handleSampleSelect}
          onRowDoubleClick={handleSampleDoubleClick}
          emptyMessage="No hay muestras disponibles"
          tableId="samples-table"
          showActions={false}
        />
      </div>
    </div>
  );
};

export default EnhancedSampleList;