import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/apiClient';
import { 
  Search, 
  Plus, 
  RefreshCw,
  Download,
  AlertCircle,
  Calendar,
  Briefcase,
  Beaker,
  AlertTriangle,
  Filter,
  FlaskConical,
  Building,
  FileText
} from 'lucide-react';
import CustomizableTable from '../../components/common/CustomizableTable';
import SelectInput from '../../components/common/SelectInput';

const SampleList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [samples, setSamples] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  
  // Estado para los catálogos/dropdowns
  const [clients, setClients] = useState([]);
  const [sampleTypes, setSampleTypes] = useState([]);
  const [analysisTypes, setAnalysisTypes] = useState([]);
  
  // Estado para filtros
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    TIPO_MUESTRA_ID: '',
    TIPO_ANALISIS_ID: '',
    CLIENTE_ID: location.state?.clientId || '',
    FECHA_DESDE: '',
    FECHA_HASTA: '',
    REFERENCIA_CLIENTE: '',
    URGENTE: ''
  });
  
  // Estado para datos filtrados
  const [filteredSamples, setFilteredSamples] = useState([]);
  
  // Definición de columnas disponibles
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
        const client = clients.find(c => c.value === row.CLIENTE_ID);
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
        const type = sampleTypes.find(t => t.value === row.TIPO_MUESTRA_ID);
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
        const type = analysisTypes.find(t => t.value === row.TIPO_ANALISIS_ID);
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
    }
  ];
  
  // Columnas visibles por defecto
  const defaultVisibleColumns = [
    'ID_MUESTRA', 'CLIENTE_ID', 'TIPO_MUESTRA_ID', 'REFERENCIA_CLIENTE', 
    'FECHA_MUESTREO', 'FECHA_RECEPCION', 'URGENTE'
  ];
  
  // Cargar catálogos al montar el componente
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        // Cargar clientes para el dropdown
        const clientsResponse = await api.clients.getForCombo();
        setClients(
          clientsResponse.data.map((client) => ({
            value: client.ID_CLIENTE,
            label: client.NOMBRE
          }))
        );
        
        // Cargar tipos de muestra
        const typesResponse = await api.catalogs.getSampleTypes();
        setSampleTypes(
          typesResponse.data.map((type) => ({
            value: type.ID_TIPO_MUESTRA,
            label: type.NOMBRE
          }))
        );
        
        // Cargar tipos de análisis
        const analysisResponse = await api.catalogs.getAnalysisTypes();
        setAnalysisTypes(
          analysisResponse.data.map((analysis) => ({
            value: analysis.ID_TIPO_ANALISIS,
            label: analysis.NOMBRE
          }))
        );
      } catch (err) {
        console.error('Error loading catalogs:', err);
      }
    };
    
    fetchCatalogs();
  }, []);

  // Función para cargar muestras
  const fetchSamples = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Filtrar parámetros vacíos
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const response = await api.samples.getAll(activeFilters);
      setSamples(response.data || []);
      setFilteredSamples(response.data || []);
    } catch (err) {
      console.error('Error fetching samples:', err);
      setError('No se pudieron cargar las muestras. Por favor, intente de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Cargar muestras al montar el componente y cuando cambian los filtros
  useEffect(() => {
    fetchSamples();
  }, [fetchSamples]);
  
  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value
    }));
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
  };
  
  // Crear nueva muestra
  const handleCreateSample = () => {
    navigate('/muestras/nueva');
  };
  
  // Ver detalles de muestra (si tuviéramos una vista detallada)
  const handleViewSample = (sample) => {
    // navigate(`/muestras/${sample.ID_MUESTRA}`);
    console.log('Ver muestra:', sample);
  };

  // Extraer referencias únicas para el dropdown
  const referenceOptions = filteredSamples
    .filter(sample => sample.REFERENCIA_CLIENTE)
    .map(sample => ({
      value: sample.REFERENCIA_CLIENTE,
      label: sample.REFERENCIA_CLIENTE
    }))
    .filter((ref, index, self) => 
      index === self.findIndex(t => t.value === ref.value)
    );

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Barra de herramientas superior */}
      <div className="bg-white shadow rounded-md p-2 flex flex-wrap gap-2 items-center">
        <button 
          onClick={handleCreateSample}
          className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Plus size={16} className="mr-1" />
          Nueva Muestra
        </button>
        
        <div className="h-6 border-l border-gray-300 mx-1"></div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
        >
          <Filter size={16} className="mr-1" />
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
        
        <button
          onClick={fetchSamples}
          className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          title="Actualizar"
        >
          <RefreshCw size={16} className="mr-1" />
          Actualizar
        </button>
        
        <button
          className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          title="Exportar"
        >
          <Download size={16} className="mr-1" />
          Exportar
        </button>
        
        <div className="flex-grow"></div>
        
        <div className="relative w-64">
          <SelectInput
            options={referenceOptions}
            value={filters.REFERENCIA_CLIENTE}
            onChange={handleFilterChange}
            placeholder="Buscar muestra..."
            name="REFERENCIA_CLIENTE"
            id="search-reference"
            icon={<Search size={16} className="text-gray-400" />}
          />
        </div>
      </div>
      
      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-gray-50 border rounded-md p-3">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Filtros de búsqueda</h3>
            <button 
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Cliente
              </label>
              <SelectInput
                options={clients}
                value={filters.CLIENTE_ID}
                onChange={handleFilterChange}
                placeholder="Seleccionar cliente"
                name="CLIENTE_ID"
                id="filter-cliente"
                icon={<Building size={16} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Tipo de Muestra
              </label>
              <SelectInput
                options={sampleTypes}
                value={filters.TIPO_MUESTRA_ID}
                onChange={handleFilterChange}
                placeholder="Seleccionar tipo"
                name="TIPO_MUESTRA_ID"
                id="filter-tipo-muestra"
                icon={<FlaskConical size={16} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Tipo de Análisis
              </label>
              <SelectInput
                options={analysisTypes}
                value={filters.TIPO_ANALISIS_ID}
                onChange={handleFilterChange}
                placeholder="Seleccionar análisis"
                name="TIPO_ANALISIS_ID"
                id="filter-tipo-analisis"
                icon={<Beaker size={16} className="text-gray-400" />}
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
                className="w-full p-2 text-sm border border-gray-300 rounded-md"
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
                className="w-full p-2 text-sm border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Referencia Cliente
              </label>
              <SelectInput
                options={referenceOptions}
                value={filters.REFERENCIA_CLIENTE}
                onChange={handleFilterChange}
                placeholder="Buscar por referencia"
                name="REFERENCIA_CLIENTE"
                id="filter-referencia"
                icon={<FileText size={16} className="text-gray-400" />}
              />
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center text-sm">
                <input 
                  type="checkbox" 
                  name="URGENTE"
                  checked={filters.URGENTE === '1'}
                  onChange={handleFilterChange}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Solo urgentes
              </label>
            </div>
          </div>
        </div>
      )}
      
      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}
      
      {/* Tabla personalizable */}
      <div className="flex-grow bg-white rounded-md shadow">
        <CustomizableTable
          data={filteredSamples}
          columns={columns}
          isLoading={isLoading}
          onRowClick={setSelectedSample}
          onView={handleViewSample}
          initialVisibleColumns={defaultVisibleColumns}
          tableId="samples-table"
        />
      </div>
      
      {/* Barra de estado inferior */}
      <div className="bg-gray-50 border rounded-md p-2 flex justify-between items-center text-xs text-gray-500">
        <div>Total: {filteredSamples.length} muestras</div>
        
        {selectedSample && (
          <div className="font-medium">
            Muestra seleccionada: {selectedSample.REFERENCIA_CLIENTE || selectedSample.ID_MUESTRA}
          </div>
        )}
      </div>
    </div>
  );
};

export default SampleList;