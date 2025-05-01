import React, { useState, useEffect } from 'react';
import { 
  Phone, Mail, MapPin, Building, Users, FileText, DollarSign, 
  AlertCircle, Edit, Trash2, CheckCircle, Loader, Home, AtSign, 
  Hash, User, Paperclip, Globe, CreditCard, Plus, UserPlus, X,
  Search
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { useData } from '../../contexts/DataProvider';
import clientesService from '../../services/clientesService';
import TabPanel from '../common/TabPanel';
import Modal from '../common/Modal';
import SelectInput from '../common/SelectInput';
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
          <h3 className="text-lg font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`p-2 rounded-full bg-${color}-100`}>
          {React.cloneElement(icon, { size: 18, className: `text-${color}-500` })}
        </div>
      </div>
    </div>
  );
};

// Modal para añadir responsables
const AddResponsibleModal = ({ clientId, onClose, onSuccess }) => {
  const { data, fetchUsers } = useData();
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        await fetchUsers();
        const userOptions = data.users.map(user => ({
          value: user.ID_EMPLEADO,
          label: `${user.NOMBRE} ${user.APELLIDOS || ''}`.trim()
        }));
        setUsers(userOptions);
      } catch (error) {
        console.error('Error loading users:', error);
        setErrorMessage('Error al cargar los usuarios');
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, [fetchUsers, data.users]);

  const handleAddResponsible = async () => {
    if (!selectedUser) {
      setErrorMessage('Por favor seleccione un responsable');
      return;
    }

    setLoading(true);
    try {
      // Aquí implementaríamos la lógica para asignar el responsable al cliente
      // por ejemplo: await api.clients.addResponsible(clientId, selectedUser);
      
      // Simulamos una operación exitosa
      setTimeout(() => {
        onSuccess?.();
      }, 500);
    } catch (error) {
      console.error('Error adding responsible:', error);
      setErrorMessage('Error al añadir el responsable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal.Header>Añadir Responsable</Modal.Header>
      
      <Modal.Body>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seleccionar Responsable
          </label>
          <SelectInput
            options={users}
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              setErrorMessage('');
            }}
            placeholder="Buscar usuario..."
            name="responsible"
            id="responsible-select"
            className="text-gray-800"
            icon={<Search size={14} className="text-gray-400" />}
          />
          {errorMessage && (
            <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
          )}
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleAddResponsible}
            disabled={loading || !selectedUser}
            className={`px-3 py-1.5 rounded text-white text-sm flex items-center ${
              loading || !selectedUser ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <span className="animate-spin mr-1">⊛</span>
                Procesando...
              </>
            ) : (
              <>
                <Plus size={16} className="mr-1" />
                Añadir
              </>
            )}
          </button>
        </div>
      </Modal.Footer>
    </>
  );
};

const ClientDetail = ({ clientId, onEdit, onDelete, onClose }) => {
  const { openModal, closeModal } = useModal();
  const { data } = useData();
  
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estadísticas simuladas del cliente
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
      
      const clientData = await clientesService.obtenerPorId(clientId);
      
      // Validar que la respuesta tenga datos
      if (clientData) {
        if (Array.isArray(clientData) && clientData.length > 0) {
          setClient(clientData[0]);
        } else {
          setClient(clientData);
        }
        
        // Simular carga de estadísticas
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
        err.message || 
        'Error al cargar la información del cliente. Por favor, intente nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [clientId]);
  
  // Abrir modal de adjuntos
  const handleOpenAdjuntosModal = () => {
    openModal('adjuntosModal', {
      size: '2xl',
      content: (
        <>
          <Modal.Header>Adjuntos</Modal.Header>
          <Modal.Body>
            <AdjuntosModal 
              clientId={clientId} 
            />
          </Modal.Body>
          <Modal.Footer>
            <button
              onClick={() => closeModal('adjuntosModal')}
              className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
            >
              Cerrar
            </button>
          </Modal.Footer>
        </>
      )
    });
  };

  // Abrir el modal para añadir un responsable
  const handleOpenAddResponsibleModal = () => {
    openModal('addResponsible', {
      size: 'md',
      content: (
        <AddResponsibleModal 
          clientId={clientId} 
          onClose={() => closeModal('addResponsible')}
          onSuccess={() => {
            closeModal('addResponsible');
            // Recargar datos del cliente
            fetchClientData();
          }}
        />
      )
    });
  };

  if (loading) {
    return (
      <>
        <Modal.Header>Detalle de Cliente</Modal.Header>
        
        <Modal.Body>
          <div className="flex justify-center items-center p-8">
            <div className="flex flex-col items-center">
              <Loader className="animate-spin h-8 w-8 text-blue-600 mb-2" />
              <p className="text-gray-500 text-sm">Cargando información del cliente...</p>
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
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
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

  if (!client) {
    return (
      <>
        <Modal.Header>Cliente no encontrado</Modal.Header>
        
        <Modal.Body>
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 m-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-yellow-700">No se encontraron datos del cliente.</span>
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

  // Función de utilidad para acceder de forma segura a propiedades anidadas
  const getSafeValue = (obj, path, defaultValue = '') => {
    if (!obj) return defaultValue;
    
    const keys = path.split('.');
    return keys.reduce((o, key) => (o?.[key] !== undefined ? o[key] : defaultValue), obj);
  };

  // Configuración de pestañas
  const tabs = [
    { id: 'general', label: 'General', icon: <Building size={14} /> },
    { id: 'direcciones', label: 'Direcciones', icon: <MapPin size={14} /> },
    { id: 'emails', label: 'Correos', icon: <Mail size={14} /> }
  ];

  return (
    <>
      <Modal.Header>
        <div className="flex items-center">
          <Building size={18} className="mr-2" />
          <span>{client.NOMBRE}</span>
          {client.ID_CLIENTE && <span className="text-sm ml-2 opacity-75">(#{client.ID_CLIENTE})</span>}
        </div>
      </Modal.Header>
      
      <Modal.Body>
        {/* Estadísticas del cliente */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard 
            title="Muestras Totales" 
            value={stats.totalSamples} 
            icon={<FileText />} 
            color="blue"
          />
          <StatCard 
            title="Pendientes" 
            value={stats.pendingSamples} 
            icon={<FileText />} 
            color="yellow"
          />
          <StatCard 
            title="Urgentes" 
            value={stats.urgentSamples} 
            icon={<AlertCircle />} 
            color="red"
          />
          <StatCard 
            title="Completadas" 
            value={stats.completedSamples} 
            icon={<CheckCircle />} 
            color="green"
          />
        </div>
        
        <TabPanel tabs={tabs}>
          {/* Pestaña General */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Columna izquierda */}
              <div className="md:w-3/5">
                {/* Información básica */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-4">
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-medium text-sm text-gray-700">Información Básica</h2>
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
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-4">
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-medium text-sm text-gray-700">Otros Datos</h2>
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
                    <h2 className="font-medium text-sm text-gray-700">Información Comercial</h2>
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
              </div>
              
              {/* Columna derecha */}
              <div className="md:w-2/5">
                {/* Responsables del Cliente */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-4">
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="font-medium text-sm text-gray-700">Responsables del Cliente</h2>
                    <button 
                      onClick={handleOpenAddResponsibleModal}
                      className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
                      title="Añadir responsable"
                    >
                      <UserPlus size={14} />
                    </button>
                  </div>
                  <div className="p-4">
                    {client.responsables && client.responsables.length > 0 ? (
                      <div className="space-y-2">
                        {client.responsables.map((resp, index) => (
                          <div key={index} className="flex items-center">
                            <User size={16} className="text-gray-400 mr-2" />
                            <span className="text-gray-700">{resp.NOMBRE}</span>
                          </div>
                        ))}
                      </div>
                    ) : client.RESPONSABLE ? (
                      <div className="flex items-center">
                        <User size={16} className="text-gray-400 mr-2" />
                        <span className="text-gray-700">{client.RESPONSABLE}</span>
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
                    <h2 className="font-medium text-sm text-gray-700">Indicadores</h2>
                  </div>
                  <div className="p-4">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-2 py-1 border text-gray-700">Año</th>
                          <th className="px-2 py-1 border text-gray-700">Nº Muestras</th>
                          <th className="px-2 py-1 border text-gray-700">Importe</th>
                        </tr>
                      </thead>
                      <tbody>
                        {indicadores.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-2 py-1 border text-gray-700">{item.año}</td>
                            <td className="px-2 py-1 border text-center text-gray-700">{item.muestras}</td>
                            <td className="px-2 py-1 border text-right text-gray-700">{item.importe}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Observaciones */}
                {client.OBSERVACIONES && (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                      <h2 className="font-medium text-sm text-gray-700">Observaciones</h2>
                    </div>
                    <div className="px-4 py-2">
                      <p className="text-gray-700 whitespace-pre-line text-sm">{client.OBSERVACIONES}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Pestaña Direcciones */}
          <div className="space-y-4">
            {/* Dirección Fiscal (Principal) */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-4">
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="font-medium text-sm text-gray-700">Dirección Fiscal (Principal)</h2>
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
            
            {/* Dirección de Envío */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-4">
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="font-medium text-sm text-gray-700">Dirección de Envío</h2>
              </div>
              <div className="px-4 py-2 space-y-1 divide-y divide-gray-100">
                {client.USE_MAIN_ADDRESS === 1 ? (
                  <div className="py-4 text-center text-sm text-gray-600">
                    Se utiliza la misma dirección fiscal principal
                  </div>
                ) : (
                  <>
                    <DetailField 
                      label="Dirección" 
                      value={client.DIRECCION_ENVIO} 
                      icon={<MapPin />} 
                    />
                    <DetailField 
                      label="Código Postal" 
                      value={client.COD_POSTAL_ENVIO} 
                      icon={<MapPin />} 
                    />
                    <DetailField 
                      label="País" 
                      value={getSafeValue(client, 'paisEnvio.NOMBRE')} 
                      icon={<Globe />} 
                    />
                    <DetailField 
                      label="Provincia" 
                      value={getSafeValue(client, 'provinciaEnvio.NOMBRE')} 
                      icon={<MapPin />} 
                    />
                    <DetailField 
                      label="Municipio" 
                      value={getSafeValue(client, 'municipioEnvio.NOMBRE')} 
                      icon={<Home />} 
                    />
                  </>
                )}
              </div>
            </div>
            
            {/* Dirección de Facturación */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="font-medium text-sm text-gray-700">Dirección de Facturación</h2>
              </div>
              <div className="px-4 py-2 space-y-1 divide-y divide-gray-100">
                {client.USE_MAIN_ADDRESS_BILLING === 1 ? (
                  <div className="py-4 text-center text-sm text-gray-600">
                    Se utiliza la misma dirección fiscal principal
                  </div>
                ) : (
                  <>
                    <DetailField 
                      label="Dirección" 
                      value={client.DIRECCION_FACTURACION} 
                      icon={<MapPin />} 
                    />
                    <DetailField 
                      label="Código Postal" 
                      value={client.COD_POSTAL_FACTURACION} 
                      icon={<MapPin />} 
                    />
                    <DetailField 
                      label="País" 
                      value={getSafeValue(client, 'paisFacturacion.NOMBRE')} 
                      icon={<Globe />} 
                    />
                    <DetailField 
                      label="Provincia" 
                      value={getSafeValue(client, 'provinciaFacturacion.NOMBRE')} 
                      icon={<MapPin />} 
                    />
                    <DetailField 
                      label="Municipio" 
                      value={getSafeValue(client, 'municipioFacturacion.NOMBRE')} 
                      icon={<Home />} 
                    />
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Pestaña Correos */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="font-medium text-sm text-gray-700">Emails</h2>
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
              {!client.EMAIL && !client.EMAIL2 && !client.EMAIL_FACTURACION && (
                <div className="py-4 text-center text-sm text-gray-400">
                  No hay correos electrónicos registrados
                </div>
              )}
            </div>
          </div>
        </TabPanel>
      </Modal.Body>
      
      <Modal.Footer>
        <div className="flex w-full justify-between">
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
                onClick={onEdit}
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
};

export default ClientDetail;