import React, { useState, useEffect, forwardRef } from 'react';
import { 
  User, Mail, Shield, CheckCircle, XCircle, Calendar, Phone,
  Edit, Copy, Trash2, FileText, Users, Settings, AlertCircle,
  KeyRound, Building, Award, X, Eye, Activity, Lock, Star
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
      return value === 1 ? 
        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 flex items-center w-fit">
          <XCircle size={10} className="mr-1" />
          Anulado
        </span> : 
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 flex items-center w-fit">
          <CheckCircle size={10} className="mr-1" />
          Activo
        </span>;
    }

    if (type === 'admin') {
      return value === 1 ? 
        <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 flex items-center w-fit">
          <Shield size={10} className="mr-1" />
          Administrador
        </span> : 
        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 flex items-center w-fit">
          <User size={10} className="mr-1" />
          Usuario Estándar
        </span>;
    }

    if (type === 'link' && value && value !== 'No configurada' && value !== 'Configurada') {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-800 underline flex items-center"
        >
          <Eye size={12} className="mr-1" />
          Ver firma digital
        </a>
      );
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

// Tarjeta de estadísticas para el usuario
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

// Componente para mostrar permisos como checkboxes de solo lectura
const PermissionDisplay = ({ label, checked }) => (
  <div className="flex items-center py-1">
    <input
      type="checkbox"
      checked={checked}
      disabled
      className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2 opacity-50"
    />
    <span className={`text-sm ${checked ? 'text-gray-700' : 'text-gray-400'}`}>
      {label}
    </span>
  </div>
);

// Grupo de permisos para organización
const PermissionGroup = ({ title, permissions, userPermissions }) => {
  const activeCount = permissions.filter(p => userPermissions[p.accessor] === 1).length;
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-4">
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-sm text-gray-700">{title}</h3>
          <span className="text-xs text-gray-500">
            {activeCount} de {permissions.length} activos
          </span>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-2">
          {permissions.map(permission => (
            <PermissionDisplay 
              key={permission.accessor}
              label={permission.label}
              checked={userPermissions[permission.accessor] === 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const UserDetail = forwardRef(({ user, onEdit, onDelete, onClone, onClose }, ref) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (loading) {
    return (
      <>
        <Modal.Header>Detalle de Usuario</Modal.Header>
        
        <Modal.Body>
          <div className="flex justify-center items-center p-8">
            <div className="flex flex-col items-center">
              <Activity className="animate-spin h-8 w-8 text-blue-600 mb-2" />
              <p className="text-gray-500 text-sm">Cargando información del usuario...</p>
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

  if (!user) {
    return (
      <>
        <Modal.Header>Usuario no encontrado</Modal.Header>
        
        <Modal.Body>
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 m-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-yellow-700">No se encontraron datos del usuario.</span>
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

  // Calcular estadísticas de permisos
  const allPermissions = Object.keys(user).filter(key => key.startsWith('PER_'));
  const activePermissions = allPermissions.filter(key => user[key] === 1);
  const basicPermissions = ['PER_IMPRESION', 'PER_FACTURACION', 'PER_MODIFICACION', 'PER_ELIMINACION'];
  const activeBasicPermissions = basicPermissions.filter(key => user[key] === 1);

  // Configuración de pestañas según la imagen
  const tabs = [
    { id: 'datos', label: 'Datos Personales', icon: <User size={14} /> },
    { id: 'propiedades', label: 'Propiedades', icon: <Settings size={14} /> },
    { id: 'responsables', label: 'Responsables Dpto', icon: <Users size={14} /> },
    { id: 'departamentos', label: 'Departamentos', icon: <Building size={14} /> },
    { id: 'indicadores', label: 'Indicadores', icon: <Star size={14} /> }
  ];

  // Definir grupos de permisos para las pestañas
  const propiedadesPermisos = [
    { accessor: 'PER_IMPRESION', label: 'Impresión' },
    { accessor: 'PER_FACTURACION', label: 'Facturación' },
    { accessor: 'PER_MODIFICACION', label: 'Modificación' },
    { accessor: 'PER_EDICION', label: 'Edición' },
    { accessor: 'PER_ALTAS_BAJAS_USUARIOS', label: 'Altas / Bajas usuarios' },
    { accessor: 'PER_SEGUNDA_EDICION', label: 'Segunda Edición' },
    { accessor: 'PER_EXPLORAR', label: 'Explorar' },
    { accessor: 'PER_CONTABILIDAD', label: 'Contabilidad' },
    { accessor: 'PER_ENVIO_PEDIDOS_PROVEEDOR', label: 'Envío Pedidos a Proveedor' },
    { accessor: 'PER_GESTION_PROYECTOS', label: 'Gestión de proyectos' },
    { accessor: 'PER_GESTION_INCIDENCIAS', label: 'Gestión de Incidencias' },
    { accessor: 'PER_OFERTAS', label: 'Ofertas' },
    { accessor: 'PER_CIERRE_MUESTRAS', label: 'Cierre de Muestras' },
    { accessor: 'PER_PLAZO_ENTREGA', label: 'Plazos de Entrega' },
    { accessor: 'PER_DEPARTAMENTOS', label: 'Departamentos' },
    { accessor: 'PER_DOCUMENTA_CALIDAD', label: 'Documenta. Gestión Calidad' },
    { accessor: 'PER_GENERACION_DOCUMENTOS', label: 'Generación de documentos' },
    { accessor: 'PER_VIDEOS', label: 'Videos' }
  ];

  const calidadPermisos = [
    { accessor: 'PER_ACCESO_DOCUMENTACION_CALIDAD', label: 'Acceso Documentación Calidad' },
    { accessor: 'PER_CREACION_VERSIONES_DOCUMENTOS', label: 'Creación Versiones Documentos' },
    { accessor: 'PER_INSPECCION_DOC_CALIDAD', label: 'Inspección doc. calidad' },
    { accessor: 'PER_LISTA_PROCENSAL_PNT', label: 'Lista Procensal PNT' },
    { accessor: 'PER_VER_TODAS_FAMILIAS', label: 'Ver todas las Familias' },
    { accessor: 'PER_GESTION_NO_CONFORMIDADES', label: 'Gestión de No Conformidades' },
    { accessor: 'PER_NORMAS_NO_CONTROLADAS', label: 'Normas NO CONTROLADAS' },
    { accessor: 'PER_LISTADO_INCIDENCIAS', label: 'Listado de Incidencias' }
  ];

  const indicadoresPermisos = [
    { accessor: 'PER_CENTROS_PLAZO_ENTREGA', label: 'Centros de Plazo de Entrega' },
    { accessor: 'PER_LISTADO_PLAZO_PASO', label: 'Listado de Plazos de Paso' },
    { accessor: 'PER_INDICADORES_CLIENTE', label: 'Indicadores Cliente' },
    { accessor: 'PER_PRODUCTIVIDAD', label: 'Productividad' }
  ];

  const tesoreriaPermisos = [
    { accessor: 'PER_MENU_TESORERIA', label: 'Menú Tesorería' },
    { accessor: 'PER_FACTURAS_PROVEEDORES', label: 'Facturas Proveedores' }
  ];

  const facturacionPermisos = [
    { accessor: 'PER_CARGAR_PNT', label: 'Cargar PNT' },
    { accessor: 'PER_FACTURACION_ANUAL', label: 'Fact Facturación Anual' }
  ];

  return (
    <>
      <Modal.Header>
        <div className="flex items-center">
          <User size={18} className="mr-2" />
          <span>{user.NOMBRE} {user.APELLIDOS}</span>
          {user.ID_EMPLEADO && <span className="text-sm ml-2 opacity-75">(#{user.ID_EMPLEADO})</span>}
        </div>
      </Modal.Header>
      
      <Modal.Body>
        {/* Estadísticas del usuario */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard 
            title="Permisos Activos" 
            value={activePermissions.length} 
            icon={<Shield />} 
            color="blue"
          />
          <StatCard 
            title="Permisos Básicos" 
            value={activeBasicPermissions.length} 
            icon={<Settings />} 
            color="green"
          />
          <StatCard 
            title="Tipo Usuario" 
            value={user.ADMIN === 1 ? 'Admin' : 'Estándar'} 
            icon={<User />} 
            color="purple"
          />
          <StatCard 
            title="Estado" 
            value={user.ANULADO === 1 ? 'Anulado' : 'Activo'} 
            icon={<CheckCircle />} 
            color={user.ANULADO === 1 ? 'red' : 'green'}
          />
        </div>
        
        <TabPanel tabs={tabs}>
          {/* Pestaña Datos Personales */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-medium text-sm text-gray-700">Información Básica</h2>
                  </div>
                  <div className="px-4 py-2 space-y-1 divide-y divide-gray-100">
                    <DetailField 
                      label="Usuario" 
                      value={user.USUARIO} 
                      icon={<User />} 
                    />
                    <DetailField 
                      label="Nombre" 
                      value={user.NOMBRE} 
                      icon={<User />} 
                    />
                    <DetailField 
                      label="Apellidos" 
                      value={user.APELLIDOS} 
                      icon={<User />} 
                    />
                    <DetailField 
                      label="Email" 
                      value={user.EMAIL} 
                      icon={<Mail />} 
                    />
                    <DetailField 
                      label="Teléfono" 
                      value={user.TELEFONO} 
                      icon={<Phone />} 
                    />
                    <DetailField 
                      label="Cargo" 
                      value={user.CARGO} 
                      icon={<Building />} 
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-medium text-sm text-gray-700">Firma Electrónica</h2>
                  </div>
                  <div className="px-4 py-2 space-y-1 divide-y divide-gray-100">
                    <DetailField 
                      label="Firma Electrónica" 
                      value={user.FIRMA_ELECTRONICA} 
                      icon={<Mail />} 
                    />
                    <DetailField 
                      label="Files" 
                      value={user.FILES} 
                      icon={<FileText />} 
                    />
                  </div>
                </div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-medium text-sm text-gray-700">Estado y Configuración</h2>
                  </div>
                  <div className="px-4 py-2 space-y-1 divide-y divide-gray-100">
                    <DetailField 
                      label="Estado" 
                      value={user.ANULADO} 
                      type="status" 
                      icon={<AlertCircle />} 
                    />
                    <DetailField 
                      label="Tipo de Usuario" 
                      value={user.ADMIN} 
                      type="admin" 
                      icon={<Shield />} 
                    />
                    <DetailField 
                      label="Debe Cambiar Contraseña" 
                      value={user.CAMBIAR_PASSWORD} 
                      type="boolean"
                      icon={<KeyRound />} 
                    />
                    <DetailField 
                      label="Fecha de Alta" 
                      value={user.FECHA_ALTA ? new Date(user.FECHA_ALTA).toLocaleDateString() : ''} 
                      icon={<Calendar />} 
                    />
                    <DetailField 
                      label="Fecha de Caducidad" 
                      value={user.FECHA_CADUCIDAD ? new Date(user.FECHA_CADUCIDAD).toLocaleDateString() : ''} 
                      icon={<Calendar />} 
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-medium text-sm text-gray-700">Revisión de Informes y FNMT</h2>
                  </div>
                  <div className="px-4 py-2 space-y-1 divide-y divide-gray-100">
                    <DetailField 
                      label="Revisión de Muestras" 
                      value={user.REVISION_DE_MUESTRAS} 
                      type="boolean"
                      icon={<CheckCircle />} 
                    />
                    <DetailField 
                      label="Cargo Interno" 
                      value={user.CARGO_INTERNO} 
                      icon={<Building />} 
                    />
                    <DetailField 
                      label="Ruta Servicio" 
                      value={user.RUTA_SERVICIO} 
                      icon={<FileText />} 
                    />
                    <DetailField 
                      label="Certificado FNMT" 
                      value={user.FNMT_RUTA ? 'Configurado' : 'No configurado'} 
                      icon={<Award />} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Acceso Aplicaciones */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                <h2 className="font-medium text-sm text-gray-700">Acceso Aplicaciones</h2>
              </div>
              <div className="px-4 py-2">
                <PermissionDisplay 
                  label="Ordenes No Procesado"
                  checked={user.ORDENES_NO_PROCESADO === 1}
                />
              </div>
            </div>

            {/* Observaciones si existen */}
            {user.OBSERVACIONES && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-medium text-sm text-gray-700">Observaciones</h2>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm text-gray-700">{user.OBSERVACIONES}</p>
                </div>
              </div>
            )}
          </div>

          {/* Pestaña Propiedades */}
          <div className="space-y-4">
            <PermissionGroup 
              title="Propiedades Generales"
              permissions={propiedadesPermisos}
              userPermissions={user}
            />
            
            {activePermissions.length === 0 && (
              <div className="text-center py-8">
                <Shield className="mx-auto text-gray-400 mb-2" size={48} />
                <p className="text-gray-500">Este usuario no tiene propiedades especiales asignadas</p>
              </div>
            )}
          </div>

          {/* Pestaña Responsables Dpto */}
          <div className="space-y-4">
            <PermissionGroup 
              title="Calidad"
              permissions={calidadPermisos}
              userPermissions={user}
            />
            
            <PermissionGroup 
              title="Indicadores"
              permissions={indicadoresPermisos}
              userPermissions={user}
            />
            
            <PermissionGroup 
              title="Tesorería"
              permissions={tesoreriaPermisos}
              userPermissions={user}
            />
          </div>

          {/* Pestaña Departamentos */}
          <div className="space-y-4">
            <PermissionGroup 
              title="Facturación"
              permissions={facturacionPermisos}
              userPermissions={user}
            />
          </div>

          {/* Pestaña Indicadores */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                <h2 className="font-medium text-sm text-gray-700">Configuración de Indicadores</h2>
              </div>
              <div className="px-4 py-6 text-center">
                <Star className="mx-auto text-gray-400 mb-2" size={48} />
                <p className="text-gray-500">Configuración específica de indicadores del usuario</p>
                <p className="text-gray-400 text-sm mt-1">Los indicadores se configuran según las necesidades del sistema</p>
              </div>
            </div>

            {/* Información adicional de seguridad */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start">
                <AlertCircle className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium mb-1">Información del Usuario</p>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Total de permisos configurados: {allPermissions.length}</li>
                    <li>• Permisos activos: {activePermissions.length}</li>
                    {user.FECHA_CADUCIDAD && (
                      <li>• La cuenta tiene fecha de caducidad configurada</li>
                    )}
                  </ul>
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
              Historial
            </button>
            
            <button className="flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-300">
              <Activity size={14} className="mr-1" />
              Actividad
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
                onClick={() => onEdit(user)}
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

UserDetail.displayName = 'UserDetail';

export default UserDetail;