import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clientService from '../../services/clientService';
import { useModal } from '../../contexts/ModalContext';
import { 
  Phone,
  Mail, 
  MapPin, 
  Building, 
  Users,
  FileText,
  DollarSign,
  AlertCircle,
  Edit,
  Trash2,
  Beaker,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader,
  Home,
  AtSign,
  Hash,
  User,
  Paperclip,
  Globe,
  CreditCard
} from 'lucide-react';
import AdjuntosModal from './AdjuntosModal';

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
      return value === 1 ? 
        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 flex items-center w-fit">
          <AlertCircle size={10} className="mr-1" />
          Anulado
        </span> : 
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 flex items-center w-fit">
          <CheckCircle size={10} className="mr-1" />
          Activo
        </span>;
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

// Tarjeta de estadísticas para el cliente
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{title}</p>
          <h3 className="text-lg font-bold">{value}</h3>
        </div>
        <div className={`p-2 rounded-full bg-${color}-100`}>
          {React.cloneElement(icon, { size: 18, className: `text-${color}-500` })}
        </div>
      </div>
    </div>
  );
};

const ClientDetail = ({ clientId, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  
  // Estadísticas simuladas del cliente (en una app real, vendrían del backend)
  const [stats, setStats] = useState({
    totalSamples: 0,
    pendingSamples: 0,
    urgentSamples: 0,
    completedSamples: 0
  });
  
  // Datos simulados para indicadores
  const indicadores = [
    { año: '2024', muestras: 2, importe: '247,00 €' },
    { año: '2023', muestras: 4, importe: '300,00 €' },
    { año: '2022', muestras: 3, importe: '180,00 €' }
  ];

  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Si no hay ID, no cargar nada
        if (!clientId) {
          setError("No se especificó un ID de cliente");
          setLoading(false);
          return;
        }
        
        const response = await clientService.getById(clientId);
        
        // Validar que la respuesta tenga datos y sea un array
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setClient(response.data[0]);
          
          // Simular carga de estadísticas (en una app real, sería otra llamada API)
          setStats({
            totalSamples: Math.floor(Math.random() * 100) + 5,
            pendingSamples: Math.floor(Math.random() * 20),
            urgentSamples: Math.floor(Math.random() * 5),
            completedSamples: Math.floor(Math.random() * 80)
          });
        } else if (response.data && !Array.isArray(response.data)) {
          // Si la respuesta no es un array, intentar usarla directamente
          setClient(response.data);
          
          setStats({
            totalSamples: Math.floor(Math.random() * 100) + 5,
            pendingSamples: Math.floor(Math.random() * 20),
            urgentSamples: Math.floor(Math.random() * 5),
            completedSamples: Math.floor(Math.random() * 80)
          });
        } else {
          setError("No se encontró el cliente solicitado");
        }
      } catch (err) {
        console.error('Error fetching client:', err);
        setError(
          err.response?.data?.msg || 
          'Error al cargar la información del cliente. Por favor, intente nuevamente.'
        );
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientData();
  }, [clientId]);
  
  // Abrir modal de adjuntos
  const handleOpenAdjuntosModal = () => {
    openModal('adjuntosModal', {
      title: '',
      size: '2xl',
      headerClassName: 'hidden',
      content: (
        <AdjuntosModal 
          clientId={clientId} 
          onClose={() => closeModal('adjuntosModal')}
        />
      )
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center">
          <Loader className="animate-spin h-8 w-8 text-blue-600 mb-2" />
          <p className="text-gray-500 text-sm">Cargando información del cliente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 m-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 m-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
          <span className="text-yellow-700">No se encontraron datos del cliente.</span>
        </div>
      </div>
    );
  }

  // Función de utilidad para acceder de forma segura a propiedades anidadas
  const getSafeValue = (obj, path, defaultValue = '') => {
    if (!obj) return defaultValue;
    
    const keys = path.split('.');
    return keys.reduce((o, key) => (o?.[key] !== undefined ? o[key] : defaultValue), obj);
  };

  return (
    <div className="bg-gray-100 rounded-lg shadow overflow-hidden">
      {/* Cabecera */}
      <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
        <h2 className="font-medium">
          {client.NOMBRE} {client.ID_CLIENTE && `(#${client.ID_CLIENTE})`}
        </h2>
      </div>
      
      {/* Pestañas */}
      <div className="flex border-b bg-gray-200">
        <button 
          className={`px-4 py-1 text-sm border-r ${
            activeTab === 'general' 
              ? 'bg-white text-gray-800 font-medium border-b-0' 
              : 'bg-gray-200 text-gray-600'
          }`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button 
          className={`px-4 py-1 text-sm border-r ${
            activeTab === 'direcciones' 
              ? 'bg-white text-gray-800 font-medium border-b-0' 
              : 'bg-gray-200 text-gray-600'
          }`}
          onClick={() => setActiveTab('direcciones')}
        >
          Direcciones
        </button>
        <button 
          className={`px-4 py-1 text-sm ${
            activeTab === 'emails' 
              ? 'bg-white text-gray-800 font-medium border-b-0' 
              : 'bg-gray-200 text-gray-600'
          }`}
          onClick={() => setActiveTab('emails')}
        >
          Correos
        </button>
      </div>
      
      {/* Contenido principal */}
      <div className="p-4 bg-white">
        {/* Estadísticas del cliente */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard 
            title="Muestras Totales" 
            value={stats.totalSamples} 
            icon={<Beaker />} 
            color="blue"
          />
          <StatCard 
            title="Pendientes" 
            value={stats.pendingSamples} 
            icon={<Clock />} 
            color="yellow"
          />
          <StatCard 
            title="Urgentes" 
            value={stats.urgentSamples} 
            icon={<AlertTriangle />} 
            color="red"
          />
          <StatCard 
            title="Completadas" 
            value={stats.completedSamples} 
            icon={<CheckCircle />} 
            color="green"
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Columna izquierda */}
          <div className="md:w-3/5">
            {activeTab === 'general' && (
              <div className="space-y-4">
                {/* Información básica */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-medium text-sm">Información Básica</h2>
                  </div>
                  <div className="px-4 py-2 space-y-1 divide-y divide-gray-100">
                    <DetailField 
                      label="Nombre" 
                      value={client.NOMBRE} 
                      icon={<Building />} 
                    />
                    <DetailField 
                      label="CIF/NIF" 
                      value={client.CIF} 
                      icon={<FileText />} 
                    />
                    <DetailField 
                      label="Responsable" 
                      value={client.RESPONSABLE} 
                      icon={<Users />} 
                    />
                    <DetailField 
                      label="Teléfono" 
                      value={client.TELEFONO} 
                      icon={<Phone />} 
                    />
                    <DetailField 
                      label="Fax" 
                      value={client.FAX} 
                      icon={<Phone />} 
                    />
                    <DetailField 
                      label="Estado" 
                      value={client.ANULADO} 
                      type="status" 
                      icon={<AlertCircle />} 
                    />
                  </div>
                </div>
                
                {/* Otros datos */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-medium text-sm">Otros Datos</h2>
                  </div>
                  <div className="px-4 py-2 space-y-1 divide-y divide-gray-100">
                    <DetailField 
                      label="Email Principal" 
                      value={client.EMAIL} 
                      icon={<Mail />} 
                    />
                    <DetailField 
                      label="Centro" 
                      value={client.CENTRO} 
                      icon={<Building />} 
                    />
                    <DetailField 
                      label="Cargo" 
                      value={client.CARGO} 
                      icon={<Users />} 
                    />
                    <DetailField 
                      label="Idioma" 
                      value={client.IDIOMA_FACTURA === 1 ? 'Español' : client.IDIOMA_FACTURA === 2 ? 'Inglés' : client.IDIOMA_FACTURA === 3 ? 'Francés' : '-'} 
                      icon={<Globe />} 
                    />
                    <DetailField 
                      label="Facturación determinaciones" 
                      value={client.FACTURA_DETERMINACIONES} 
                      type="boolean" 
                      icon={<FileText />} 
                    />
                  </div>
                </div>
                
                {/* Información comercial */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-medium text-sm">Información Comercial</h2>
                  </div>
                  <div className="px-4 py-2 space-y-1 divide-y divide-gray-100">
                    <DetailField 
                      label="Forma de Pago" 
                      value={getSafeValue(client, 'formaPago.NOMBRE')} 
                      icon={<CreditCard />} 
                    />
                    <DetailField 
                      label="Tarifa" 
                      value={getSafeValue(client, 'tarifa.NOMBRE')} 
                      icon={<DollarSign />} 
                    />
                    <DetailField 
                      label="Banco" 
                      value={client.BANCO} 
                      icon={<DollarSign />} 
                    />
                    <DetailField 
                      label="Cuenta" 
                      value={client.CUENTA} 
                      icon={<CreditCard />} 
                    />
                    <DetailField 
                      label="Factura Electrónica" 
                      value={client.FACTURA_ELECTRONICA} 
                      type="boolean" 
                      icon={<FileText />} 
                    />
                    <div className="py-2">
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <Building size={14} className="mr-2" />
                        Sector
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {client.EADS === 1 && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">EADS</span>
                        )}
                        {client.AIRBUS === 1 && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">AIRBUS</span>
                        )}
                        {client.IBERIA === 1 && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">IBERIA</span>
                        )}
                        {client.AGROALIMENTARIO === 1 && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">AGROALIMENTARIO</span>
                        )}
                        {client.EXTRANJERO === 1 && (
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">EXTRANJERO</span>
                        )}
                        {client.INTRA === 1 && (
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">INTRACOMUNITARIO</span>
                        )}
                        {client.EADS !== 1 && client.AIRBUS !== 1 && client.IBERIA !== 1 && 
                         client.AGROALIMENTARIO !== 1 && client.EXTRANJERO !== 1 && client.INTRA !== 1 && (
                          <span className="text-gray-500">No especificado</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Observaciones */}
                {client.OBSERVACIONES && (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                      <h2 className="font-medium text-sm">Observaciones</h2>
                    </div>
                    <div className="px-4 py-2">
                      <p className="text-gray-700 whitespace-pre-line text-sm">{client.OBSERVACIONES}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'direcciones' && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h2 className="font-medium text-sm">Direcciones</h2>
                </div>
                <div className="px-4 py-2 space-y-1 divide-y divide-gray-100">
                  <DetailField 
                    label="Dirección" 
                    value={client.DIRECCION} 
                    icon={<MapPin />} 
                  />
                  <DetailField 
                    label="Código Postal" 
                    value={client.COD_POSTAL} 
                    icon={<MapPin />} 
                  />
                  <DetailField 
                    label="País" 
                    value={getSafeValue(client, 'pais.NOMBRE')} 
                    icon={<Globe />} 
                  />
                  <DetailField 
                    label="Provincia" 
                    value={getSafeValue(client, 'provincia.NOMBRE')} 
                    icon={<MapPin />} 
                  />
                  <DetailField 
                    label="Municipio" 
                    value={getSafeValue(client, 'municipio.NOMBRE')} 
                    icon={<Home />} 
                  />
                </div>
              </div>
            )}
            
            {activeTab === 'emails' && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <h2 className="font-medium text-sm">Emails</h2>
                </div>
                <div className="px-4 py-2 space-y-1 divide-y divide-gray-100">
                  <DetailField 
                    label="Email Principal" 
                    value={client.EMAIL} 
                    icon={<AtSign />} 
                  />
                  <DetailField 
                    label="Email Secundario" 
                    value={client.EMAIL2} 
                    icon={<AtSign />} 
                  />
                  <DetailField 
                    label="Email Facturación" 
                    value={client.EMAIL_FACTURACION} 
                    icon={<AtSign />} 
                  />
                  <div className="py-2">
                    <div className="text-center text-sm text-gray-400 py-4">
                      {!client.EMAIL && !client.EMAIL2 && !client.EMAIL_FACTURACION && "No hay correos electrónicos registrados"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Columna derecha */}
          <div className="md:w-2/5">
            {/* Responsables del Cliente */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-4">
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                <h2 className="font-medium text-sm">Responsables del Cliente</h2>
              </div>
              <div className="p-4">
                {client.RESPONSABLE ? (
                  <div className="flex items-center">
                    <User size={16} className="text-gray-400 mr-2" />
                    <span>{client.RESPONSABLE}</span>
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-400 py-4">
                    No hay responsables registrados
                  </div>
                )}
              </div>
            </div>
            
            {/* Indicadores */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-4">
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                <h2 className="font-medium text-sm">Indicadores</h2>
              </div>
              <div className="p-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 py-1 border">Año</th>
                      <th className="px-2 py-1 border">Nº Muestras</th>
                      <th className="px-2 py-1 border">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicadores.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-2 py-1 border">{item.año}</td>
                        <td className="px-2 py-1 border text-center">{item.muestras}</td>
                        <td className="px-2 py-1 border text-right">{item.importe}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pie con botones */}
      <div className="px-2 py-2 bg-gray-200 border-t flex justify-between items-center">
        {/* Lado izquierdo: botones de navegación */}
        <div className="flex space-x-2">
          <button 
            onClick={handleOpenAdjuntosModal}
            className="flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-200 hover:bg-blue-200"
          >
            <Paperclip size={14} className="mr-1" />
            Adjuntos
          </button>
          
          <button className="flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-300">
            <FileText size={14} className="mr-1" />
            Pedidos
          </button>
          
          <button className="flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-300">
            <Globe size={14} className="mr-1" />
            Direcciones
          </button>
          
          <button className="flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-300">
            <AlertTriangle size={14} className="mr-1" />
            Ofertas
          </button>
        </div>
        
        {/* Lado derecho: botones de acciones */}
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
              onClick={onEdit}
              className="flex items-center px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Edit size={14} className="mr-1" />
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;