import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/apiClient';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Phone,
  Mail, 
  MapPin, 
  Building, 
  Users,
  FileText,
  DollarSign,
  ChevronRight,
  AlertCircle,
  Beaker,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Componente para mostrar un campo de datos en la vista de detalle
const DetailField = ({ label, value, icon, type = 'text' }) => {
  const displayValue = () => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400">No especificado</span>;
    }

    if (type === 'boolean') {
      return value === 1 ? 
        <span className="text-green-600 font-medium">Sí</span> : 
        <span className="text-gray-500">No</span>;
    }

    if (type === 'status') {
      return value === 1 ? 
        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
          Anulado
        </span> : 
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
          Activo
        </span>;
    }

    return <span className="text-gray-900">{value}</span>;
  };

  return (
    <div className="py-3">
      <div className="flex items-center text-sm text-gray-500 mb-1">
        {icon && React.cloneElement(icon, { size: 16, className: 'mr-2' })}
        {label}
      </div>
      <div className="text-gray-900">{displayValue()}</div>
    </div>
  );
};

// Tarjeta de estadísticas para el cliente
const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const ClientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  
  // Estadísticas simuladas del cliente (en una app real, vendrían del backend)
  const [stats, setStats] = useState({
    totalSamples: 0,
    pendingSamples: 0,
    urgentSamples: 0,
    completedSamples: 0
  });

  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.clients.getById(id);
        
        if (response.data && response.data.length > 0) {
          setClient(response.data[0]);
          
          // Simular carga de estadísticas (en una app real, sería otra llamada API)
          // Estos valores serían generados por el backend
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
        setError('Error al cargar la información del cliente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientData();
  }, [id]);

  const handleEdit = () => {
    navigate(`/clientes/editar/${id}`);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.clients.delete(id);
      setDeleteSuccess(true);
      
      // Esperar un momento para mostrar el mensaje de éxito
      setTimeout(() => {
        navigate('/clientes');
      }, 1500);
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Error al eliminar el cliente. Por favor, intente de nuevo.');
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 max-w-lg mx-auto mt-10">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/clientes')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver a la lista de clientes
          </button>
        </div>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/clientes')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {client.NOMBRE}
          </h1>
          {client.ANULADO === 1 && (
            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
              Anulado
            </span>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleEdit}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <Edit size={16} className="mr-2" />
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 flex items-center"
          >
            <Trash2 size={16} className="mr-2" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Estadísticas del cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Muestras Totales" 
          value={stats.totalSamples} 
          icon={<Beaker className="text-blue-500" size={24} />} 
          color="blue"
        />
        <StatCard 
          title="Muestras Pendientes" 
          value={stats.pendingSamples} 
          icon={<Clock className="text-yellow-500" size={24} />} 
          color="yellow"
        />
        <StatCard 
          title="Muestras Urgentes" 
          value={stats.urgentSamples} 
          icon={<AlertTriangle className="text-red-500" size={24} />} 
          color="red"
        />
        <StatCard 
          title="Muestras Completadas" 
          value={stats.completedSamples} 
          icon={<CheckCircle className="text-green-500" size={24} />} 
          color="green"
        />
      </div>
      
      {/* Información del cliente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información básica */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-medium text-lg">Información Básica</h2>
          </div>
          <div className="px-6 py-2 space-y-1 divide-y divide-gray-100">
            <DetailField 
              label="Nombre" 
              value={client.NOMBRE} 
              icon={<Building />} 
            />
            <DetailField 
              label="CIF/NIF" 
              value={client.CIF} 
              icon={<Building />} 
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
              label="Email" 
              value={client.EMAIL} 
              icon={<Mail />} 
            />
            <DetailField 
              label="Estado" 
              value={client.ANULADO} 
              type="status" 
              icon={<AlertCircle />} 
            />
          </div>
        </div>
        
        {/* Dirección */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-medium text-lg">Dirección</h2>
          </div>
          <div className="px-6 py-2 space-y-1 divide-y divide-gray-100">
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
              value={client.pais?.NOMBRE} 
              icon={<MapPin />} 
            />
            <DetailField 
              label="Provincia" 
              value={client.provincia?.NOMBRE} 
              icon={<MapPin />} 
            />
            <DetailField 
              label="Municipio" 
              value={client.municipio?.NOMBRE} 
              icon={<MapPin />} 
            />
          </div>
        </div>
        
        {/* Información comercial */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-medium text-lg">Información Comercial</h2>
          </div>
          <div className="px-6 py-2 space-y-1 divide-y divide-gray-100">
            <DetailField 
              label="Forma de Pago" 
              value={client.formaPago?.NOMBRE} 
              icon={<DollarSign />} 
            />
            <DetailField 
              label="Tarifa" 
              value={client.tarifa?.NOMBRE} 
              icon={<DollarSign />} 
            />
            <DetailField 
              label="Factura Determinaciones" 
              value={client.FACTURA_DETERMINACIONES} 
              type="boolean" 
              icon={<FileText />} 
            />
            <DetailField 
              label="EADS" 
              value={client.EADS} 
              type="boolean" 
              icon={<Building />} 
            />
            <DetailField 
              label="AIRBUS" 
              value={client.AIRBUS} 
              type="boolean" 
              icon={<Building />} 
            />
            <DetailField 
              label="IBERIA" 
              value={client.IBERIA} 
              type="boolean" 
              icon={<Building />} 
            />
            <DetailField 
              label="Agroalimentario" 
              value={client.AGROALIMENTARIO} 
              type="boolean" 
              icon={<Building />} 
            />
            <DetailField 
              label="Extranjero" 
              value={client.EXTRANJERO} 
              type="boolean" 
              icon={<Building />} 
            />
          </div>
        </div>
      </div>
      
      {/* Observaciones */}
      {client.OBSERVACIONES && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-medium text-lg">Observaciones</h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-700 whitespace-pre-line">{client.OBSERVACIONES}</p>
          </div>
        </div>
      )}
      
      {/* Muestras recientes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-medium text-lg">Muestras Recientes</h2>
          <button
            onClick={() => navigate('/muestras', { state: { clientId: id } })}
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
          >
            Ver todas
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="px-6 py-4">
          {/* Aquí normalmente cargaríamos las muestras recientes del cliente */}
          {/* Como no tenemos esa API, mostraremos un mensaje */}
          <div className="text-center py-10 text-gray-500">
            <Beaker size={48} className="mx-auto text-gray-300 mb-3" />
            <p>Sin datos de muestras recientes</p>
            <button
              onClick={() => navigate('/muestras/nueva', { state: { clientId: id } })}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Crear Nueva Muestra
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            {deleteSuccess ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Cliente eliminado</h3>
                <p className="text-gray-500">El cliente ha sido eliminado correctamente.</p>
              </div>
            ) : (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Confirmar eliminación</h3>
                <p className="text-gray-500 mb-4">
                  ¿Está seguro de que desea eliminar al cliente "{client.NOMBRE}"? Esta acción no se puede deshacer.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={deleteLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Eliminando...
                      </>
                    ) : (
                      'Eliminar'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;