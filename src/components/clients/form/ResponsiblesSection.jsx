import React, { memo, useState, useEffect } from 'react';
import { Users, Plus, Trash2, User, Search } from 'lucide-react';
import FormSection from './FormSection';
import SelectInput from '../../common/SelectInput';
import { useClientForm } from '../../../contexts/ClientFormContext';
import { useData } from '../../../contexts/DataProvider';

/**
 * Sección de responsables del cliente
 * Maneja la asignación de usuarios responsables del cliente
 */
const ResponsiblesSection = memo(() => {
  const { 
    responsibles,
    addResponsible,
    removeResponsible
  } = useClientForm();

  const { 
    data,
    fetchUsers
  } = useData();

  const [selectedResponsible, setSelectedResponsible] = useState('');

  // Cargar usuarios al inicio
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Preparar opciones de usuarios activos
  const userOptions = data.users
    ?.filter(user => user.ANULADO !== 1)
    ?.map(user => ({
      value: user.ID_EMPLEADO,
      label: `${user.NOMBRE} ${user.APELLIDOS || ''}`.trim()
    })) || [];

  // Añadir responsable
  const handleAddResponsible = () => {
    if (!selectedResponsible) return;
    
    const selectedUser = data.users?.find(user => 
      user.ID_EMPLEADO === parseInt(selectedResponsible)
    );
    
    if (selectedUser) {
      const newResponsible = {
        ID_EMPLEADO: selectedUser.ID_EMPLEADO,
        NOMBRE: `${selectedUser.NOMBRE} ${selectedUser.APELLIDOS || ''}`.trim()
      };
      
      addResponsible(newResponsible);
      setSelectedResponsible('');
    }
  };

  // Eliminar responsable
  const handleRemoveResponsible = (id) => {
    removeResponsible(id);
  };

  return (
    <FormSection 
      title="Responsables del Cliente" 
      icon={<Users size={14} />}
    >
      <div className="space-y-3">
        {/* Selector para añadir responsables */}
        <div className="flex items-center gap-2">
          <div className="flex-grow">
            <SelectInput
              options={userOptions}
              value={selectedResponsible}
              onChange={(e) => setSelectedResponsible(e.target.value)}
              placeholder="Buscar y seleccionar usuario..."
              name="responsible"
              id="responsible-select"
              className="text-gray-800"
              icon={<Search size={14} className="text-gray-400" />}
            />
          </div>
          
          <button 
            type="button"
            onClick={handleAddResponsible}
            disabled={!selectedResponsible}
            className={`p-2 rounded transition-colors ${
              selectedResponsible 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title="Añadir responsable"
          >
            <Plus size={14} />
          </button>
        </div>
        
        {/* Lista de responsables */}
        {responsibles.length > 0 ? (
          <div className="space-y-2">
            <label className="block text-xs text-gray-700 mb-1">
              Responsables Asignados ({responsibles.length})
            </label>
            
            <div className="space-y-1 max-h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
              {responsibles.map((resp) => (
                <div 
                  key={resp.ID_EMPLEADO} 
                  className="flex items-center justify-between py-1.5 px-2 bg-white rounded border border-gray-100 text-xs hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <User size={10} className="text-blue-600" />
                    </div>
                    <div>
                      <span className="text-gray-800 font-medium">{resp.NOMBRE}</span>
                      <span className="text-gray-500 ml-1">(ID: {resp.ID_EMPLEADO})</span>
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => handleRemoveResponsible(resp.ID_EMPLEADO)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                    title="Eliminar responsable"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 border border-gray-200 rounded">
            <Users size={24} className="text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">
              No hay responsables asignados
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Seleccione usuarios del listado superior para asignarlos como responsables
            </p>
          </div>
        )}
        
        {/* Información adicional */}
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <h4 className="text-xs font-medium text-yellow-800 mb-1">💡 Información sobre responsables</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Los responsables recibirán notificaciones relacionadas con este cliente</li>
            <li>• Pueden gestionar muestras y comunicaciones del cliente</li>
            <li>• Es recomendable asignar al menos un responsable por cliente</li>
          </ul>
        </div>
      </div>
    </FormSection>
  );
});

ResponsiblesSection.displayName = 'ResponsiblesSection';

export default ResponsiblesSection;