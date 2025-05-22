import React, { useState, useEffect, forwardRef } from 'react';
import { 
  Beaker, FlaskConical, Calendar, Building, FileText, User, AlertTriangle,
  Edit, Trash2, X, Eye, Activity, CheckCircle, XCircle, MapPin, Phone,
  Clock, Package, TestTube, Thermometer, Microscope, BarChart3
} from 'lucide-react';
import TabPanel from '../common/TabPanel';
import Modal from '../common/Modal';

// Componente para mostrar un campo de datos en la vista de detalle
const DetailField = ({ label, value, icon, type = 'text' }) => {
  const displayValue = () => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400">No especificado</span>;
    }

    if (type === 'boolean') {
      return value === 1 ? 
        <span className="text-green-600 font-medium flex items-center">
          <CheckCircle size={12} className="mr-1" />Sí
        </span> : 
        <span className="text-gray-500">No</span>;
    }

    if (type === 'status') {
      const statusMap = {
        'RECIBIDA': { color: 'blue', icon: <Package size={10} />, text: 'Recibida' },
        'EN_PROCESO': { color: 'yellow', icon: <Clock size={10} />, text: 'En Proceso' },
        'COMPLETADA': { color: 'green', icon: <CheckCircle size={10} />, text: 'Completada' },
        'CANCELADA': { color: 'red', icon: <XCircle size={10} />, text: 'Cancelada' }
      };
      
      const status = statusMap[value] || { color: 'gray', icon: <XCircle size={10} />, text: value };
      
      return (
        <span className={`px-2 py-1 rounded-full text-xs bg-${status.color}-100 text-${status.color}-800 flex items-center w-fit`}>
          {status.icon}
          <span className="ml-1">{status.text}</span>
        </span>
      );
    }

    if (type === 'urgency') {
      return value === 1 ? 
        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 flex items-center w-fit">
          <AlertTriangle size={10} className="mr-1" />
          Urgente
        </span> : 
        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 flex items-center w-fit">
          <CheckCircle size={10} className="mr-1" />
          Normal
        </span>;
    }

    if (type === 'date' && value) {
      const date = new Date(value);
      return <span className="text-gray-900">{date.toLocaleDateString()}</span>;
    }

    return <span className="text-gray-900">{value}</span>;
  };

  return (
    <div className="py-2">
      <div className="flex items-center text-sm text-gray-500 mb-1">
        {icon && React.cloneElement(icon, { size: 14, className: 'mr-2' })}
        {label}
      </div>
      <div className="text-gray-900 text-sm">{displayValue()}</div>
    </div>
  );
};

// Tarjeta de estadísticas para la muestra
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{title}</p>
          <h3 className="text-lg font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`p-2 rounded-full bg-${color}-100`}>
          {React.cloneElement(icon, { size: 18, className: `text-${color}-500` })}
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar resultados de análisis
const AnalysisResult = ({ label, result, unit, status, limits }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
    <div className="flex-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {limits && (
        <span className="text-xs text-gray-500 ml-2">({limits})</span>
      )}
    </div>
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-900">{result} {unit}</span>
      {status && (
        <span className={`px-2 py-1 rounded-full text-xs ${
          status === 'PASS' ? 'bg-green-100 text-green-800' : 
          status === 'FAIL' ? 'bg-red-100 text-red-800' : 
          'bg-yellow-100 text-yellow-800'
        }`}>
          {status}
        </span>
      )}
    </div>
  </div>
);

const SampleDetail = forwardRef(({ sample, onEdit, onDelete, onClose }, ref) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (loading) {
    return (
      <>
        <Modal.Header>Detalle de Muestra</Modal.Header>
        
        <Modal.Body>
          <div className="flex justify-center items-center p-8">
            <div className="flex flex-col items-center">
              <Activity className="animate-spin h-8 w-8 text-blue-600 mb-2" />
              <p className="text-gray-500 text-sm">Cargando información de la muestra...</p>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <button
            onClick={onClose}
            className="flex items-center px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            <X size={14} className="mr-1" />
            Cerrar
          </button>
        </Modal.Footer>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Modal.Header>Error</Modal.Header>
        
        <Modal.Body>
          <div className="bg-red-50 p-4 rounded-md border border-red-200 m-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <button
            onClick={onClose}
            className="flex items-center px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            <X size={14} className="mr-1" />
            Cerrar
          </button>
        </Modal.Footer>
      </>
    );
  }

  if (!sample) {
    return (
      <>
        <Modal.Header>Muestra no encontrada</Modal.Header>
        
        <Modal.Body>
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 m-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-yellow-700">No se encontraron datos de la muestra.</span>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <button
            onClick={onClose}
            className="flex items-center px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            <X size={14} className="mr-1" />
            Cerrar
          </button>
        </Modal.Footer>
      </>
    );
  }

  // Calcular días desde recepción
  const daysSinceReception = sample.FECHA_RECEPCION ? 
    Math.floor((new Date() - new Date(sample.FECHA_RECEPCION)) / (1000 * 60 * 60 * 24)) : 0;

  // Configuración de pestañas
  const tabs = [
    { id: 'general', label: 'Datos Generales', icon: <Beaker size={14} /> },
    { id: 'specimen', label: 'Specimen ID', icon: <TestTube size={14} /> },
    { id: 'analysis', label: 'Análisis', icon: <Microscope size={14} /> },
    { id: 'results', label: 'Resultados', icon: <BarChart3 size={14} /> },
    { id: 'history', label: 'Historial', icon: <Clock size={14} /> }
  ];

  return (
    <>
      <Modal.Header>
        <div className="flex items-center">
          <Beaker size={18} className="mr-2" />
          <span>{sample.REFERENCIA_CLIENTE || `Muestra #${sample.ID_MUESTRA}`}</span>
          {sample.ID_MUESTRA && <span className="text-sm ml-2 opacity-75">(#{sample.ID_MUESTRA})</span>}
          {sample.URGENTE === 1 && (
            <span className="ml-2 px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 flex items-center">
              <AlertTriangle size={10} className="mr-1" />
              URGENTE
            </span>
          )}
        </div>
      </Modal.Header>
      
      <Modal.Body>
        {/* Estadísticas de la muestra */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard 
            title="Estado" 
            value={sample.ESTADO || 'Recibida'} 
            icon={<CheckCircle />} 
            color="blue"
          />
          <StatCard 
            title="Días en Lab" 
            value={daysSinceReception} 
            icon={<Clock />} 
            color="yellow"
          />
          <StatCard 
            title="Prioridad" 
            value={sample.URGENTE === 1 ? 'Urgente' : 'Normal'} 
            icon={<AlertTriangle />} 
            color={sample.URGENTE === 1 ? 'red' : 'green'}
          />
          <StatCard 
            title="Análisis" 
            value={sample.TIPO_ANALISIS_ID ? 'Asignado' : 'Pendiente'} 
            icon={<Microscope />} 
            color={sample.TIPO_ANALISIS_ID ? 'green' : 'gray'}
          />
        </div>
        
        <TabPanel tabs={tabs}>
          {/* Pestaña Datos Generales */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Columna izquierda - Sample Data */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-medium text-sm text-gray-700">SAMPLE DATA</h2>
                  </div>
                  <div className="px-4 py-2 space-y-1 divide-y divide-gray-100">
                    <DetailField 
                      label="Cliente" 
                      value={sample.CLIENTE_NOMBRE || sample.CLIENTE_ID} 
                      icon={<Building />} 
                    />
                    <DetailField 
                      label="Pedido" 
                      value={sample.PEDIDO_ID || 'No asignado'} 
                      icon={<FileText />} 
                    />
                    <DetailField 
                      label="F. Recepción" 
                      value={sample.FECHA_RECEPCION} 
                      type="date"
                      icon={<Calendar />} 
                    />
                    <DetailField 
                      label="Hora" 
                      value={sample.HORA_RECEPCION || new Date().toLocaleTimeString()} 
                      icon={<Clock />} 
                    />
                    <DetailField 
                      label="F. Muestreo" 
                      value={sample.FECHA_MUESTREO} 
                      type="date"
                      icon={<Calendar />} 
                    />
                    <DetailField 
                      label="Entregada por" 
                      value={sample.ENTREGADA_POR || 'Cliente'} 
                      icon={<User />} 
                    />
                    <DetailField 
                      label="Tomada por" 
                      value={sample.TOMADA_POR || 'Cliente'} 
                      icon={<User />} 
                    />
                    <DetailField 
                      label="Centro" 
                      value={sample.CENTRO_NOMBRE || sample.CENTRO_ID} 
                      icon={<Building />} 
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-medium text-sm text-gray-700">SPECIMEN ID AND DESCRIPTION</h2>
                  </div>
                  <div className="px-4 py-2 space-y-1 divide-y divide-gray-100">
                    <DetailField 
                      label="Process" 
                      value={sample.PROCESO || 'No especificado'} 
                      icon={<TestTube />} 
                    />
                    <DetailField 
                      label="Customer" 
                      value={sample.CUSTOMER || sample.CLIENTE_NOMBRE} 
                      icon={<Building />} 
                    />
                    <DetailField 
                      label="Specimen ID" 
                      value={sample.SPECIMEN_ID || sample.REFERENCIA_CLIENTE} 
                      icon={<FileText />} 
                    />
                    <DetailField 
                      label="Denominación" 
                      value={sample.DENOMINACION} 
                      icon={<FileText />} 
                    />
                  </div>
                </div>
              </div>

              {/* Columna derecha - Test and Replacement */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-medium text-sm text-gray-700">TEST AND REPLACEMENT</h2>
                  </div>
                  <div className="px-4 py-2 space-y-1 divide-y divide-gray-100">
                    <DetailField 
                      label="Test" 
                      value={sample.TEST_TYPE || 'PLASMA'} 
                      icon={<TestTube />} 
                    />
                    <DetailField 
                      label="Replacement" 
                      value={sample.REPLACEMENT || 'ENSAYO'} 
                      icon={<FlaskConical />} 
                    />
                    <DetailField 
                      label="Product Libel" 
                      value={sample.PRODUCT_LABEL || 'METAL SPECIMEN WITH THERMAL SPRAY COATING'} 
                      icon={<Package />} 
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-medium text-sm text-gray-700">INFORMACIÓN ADICIONAL</h2>
                  </div>
                  <div className="px-4 py-2 space-y-1 divide-y divide-gray-100">
                    <DetailField 
                      label="P/N" 
                      value={sample.PART_NUMBER || sample.PN} 
                      icon={<FileText />} 
                    />
                    <DetailField 
                      label="S/N" 
                      value={sample.SERIAL_NUMBER || sample.SN} 
                      icon={<FileText />} 
                    />
                    <DetailField 
                      label="Product Type" 
                      value={sample.PRODUCT_TYPE || 'COATING'} 
                      icon={<Package />} 
                    />
                    <DetailField 
                      label="Product S/N" 
                      value={sample.PRODUCT_SN} 
                      icon={<FileText />} 
                    />
                    <DetailField 
                      label="Module S/N" 
                      value={sample.MODULE_SN} 
                      icon={<FileText />} 
                    />
                    <DetailField 
                      label="Urgente" 
                      value={sample.URGENTE} 
                      type="urgency"
                      icon={<AlertTriangle />} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones si existen */}
            {sample.OBSERVACIONES && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-medium text-sm text-gray-700">Observaciones</h2>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm text-gray-700">{sample.OBSERVACIONES}</p>
                </div>
              </div>
            )}
          </div>

          {/* Pestaña Specimen ID */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                <h2 className="font-medium text-sm text-gray-700">Specimen Identification Details</h2>
              </div>
              <div className="px-4 py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <DetailField 
                      label="HM&D Type" 
                      value={sample.HMD_TYPE || 'HEAT TEST SPECIMEN'} 
                      icon={<Thermometer />} 
                    />
                    <DetailField 
                      label="Part Number" 
                      value={sample.PART_NUMBER || sample.PN} 
                      icon={<FileText />} 
                    />
                    <DetailField 
                      label="Serial Number" 
                      value={sample.SERIAL_NUMBER || sample.SN} 
                      icon={<FileText />} 
                    />
                  </div>
                  <div className="space-y-3">
                    <DetailField 
                      label="Product Type" 
                      value={sample.PRODUCT_TYPE || 'COATING'} 
                      icon={<Package />} 
                    />
                    <DetailField 
                      label="Product S/N" 
                      value={sample.PRODUCT_SN || 'OSI-2S-007'} 
                      icon={<FileText />} 
                    />
                    <DetailField 
                      label="Module S/N" 
                      value={sample.MODULE_SN || 'OSI-2S-007'} 
                      icon={<FileText />} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pestaña Análisis */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                <h2 className="font-medium text-sm text-gray-700">Configuración de Análisis</h2>
              </div>
              <div className="px-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <DetailField 
                    label="Tipo de Análisis" 
                    value={sample.TIPO_ANALISIS_NOMBRE || sample.TIPO_ANALISIS_ID} 
                    icon={<Microscope />} 
                  />
                  <DetailField 
                    label="Método" 
                    value={sample.METODO || 'Método estándar'} 
                    icon={<FileText />} 
                  />
                  <DetailField 
                    label="Temperatura de Ensayo" 
                    value={sample.TEMPERATURA_ENSAYO || 'Ambiente'} 
                    icon={<Thermometer />} 
                  />
                  <DetailField 
                    label="Técnico Responsable" 
                    value={sample.TECNICO_RESPONSABLE || 'Por asignar'} 
                    icon={<User />} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pestaña Resultados */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                <h2 className="font-medium text-sm text-gray-700">Resultados de Análisis</h2>
              </div>
              <div className="px-4 py-4">
                {sample.resultados && sample.resultados.length > 0 ? (
                  <div className="space-y-4">
                    {sample.resultados.map((resultado, index) => (
                      <AnalysisResult
                        key={index}
                        label={resultado.parametro}
                        result={resultado.valor}
                        unit={resultado.unidad}
                        status={resultado.status}
                        limits={resultado.limites}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="mx-auto text-gray-400 mb-2" size={48} />
                    <p className="text-gray-500">No hay resultados disponibles</p>
                    <p className="text-gray-400 text-sm mt-1">Los resultados aparecerán cuando se complete el análisis</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pestaña Historial */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                <h2 className="font-medium text-sm text-gray-700">Historial de Estados</h2>
              </div>
              <div className="px-4 py-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium">Muestra Recibida</p>
                        <p className="text-xs text-gray-500">{sample.FECHA_RECEPCION || 'Fecha no disponible'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">Completado</span>
                  </div>
                  
                  {sample.FECHA_INICIO_ANALISIS && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium">Análisis Iniciado</p>
                          <p className="text-xs text-gray-500">{sample.FECHA_INICIO_ANALISIS}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">Completado</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium">Resultados Listos</p>
                        <p className="text-xs text-gray-500">Pendiente</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">Pendiente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex w-full justify-between">
          <div className="flex space-x-2">
            <button className="flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-200 hover:bg-blue-200">
              <FileText size={14} className="mr-1" />
              Informe
            </button>
            
            <button className="flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-300">
              <Activity size={14} className="mr-1" />
              Seguimiento
            </button>
          </div>
          
          <div className="flex space-x-2">
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Trash2 size={14} className="mr-1" />
                Eliminar
              </button>
            )}
            
            {onEdit && (
              <button
                onClick={() => onEdit(sample)}
                className="flex items-center px-3 py-1 text-xs bg-slate-800 cursor-pointer text-white rounded hover:bg-blue-700"
              >
                <Edit size={14} className="mr-1" />
                Editar
              </button>
            )}
            
            <button
              onClick={onClose}
              className="flex items-center px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <X size={14} className="mr-1" />
              Cerrar
            </button>
          </div>
        </div>
      </Modal.Footer>
    </>
  );
});

SampleDetail.displayName = 'SampleDetail';

export default SampleDetail;