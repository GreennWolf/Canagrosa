import React, { memo } from 'react';
import { FileText, Building2 } from 'lucide-react';
import FormField from './FormField';
import FormSection from './FormSection';
import { useClientForm } from '../../../contexts/ClientFormContext';
import { useData } from '../../../contexts/DataProvider';

/**
 * Sección de observaciones y relaciones del cliente
 * Maneja comentarios adicionales y cliente padre
 */
const ObservationsSection = memo(() => {
  const { 
    formData, 
    handleChange, 
    handleBlur 
  } = useClientForm();

  const { data } = useData();

  // Preparar opciones para cliente padre
  const clientOptions = data.clients?.map(client => ({
    value: client.ID_CLIENTE,
    label: client.NOMBRE
  })) || [];

  return (
    <div className="space-y-4">
      {/* Cliente Padre */}
      <FormSection 
        title="Relación Empresarial" 
        icon={<Building2 size={14} />}
      >
        <div>
          <FormField
            label="Cliente Padre (Delegaciones/Sucursales)"
            name="PARENT_ID"
            type="select"
            value={formData.PARENT_ID || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            options={clientOptions}
            placeholder="Seleccionar cliente padre..."
            helpText="Si este cliente es una delegación o sucursal, seleccione la empresa matriz"
          />
          
          {formData.PARENT_ID && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs text-blue-700">
                ℹ️ Este cliente será tratado como una delegación o sucursal del cliente seleccionado.
                Las facturas y comunicaciones pueden heredar configuraciones del cliente padre.
              </p>
            </div>
          )}
        </div>
      </FormSection>

      {/* Observaciones */}
      <FormSection 
        title="Observaciones y Notas" 
        icon={<FileText size={14} />}
      >
        <div>
          <FormField
            label="Observaciones Generales"
            name="OBSERVACIONES"
            type="textarea"
            value={formData.OBSERVACIONES}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={6}
            placeholder="Ingrese aquí cualquier información relevante sobre el cliente..."
            helpText="Notas internas, condiciones especiales, historial, etc."
          />
          
          {/* Contador de caracteres */}
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Máximo 1000 caracteres recomendados
            </p>
            <span className="text-xs text-gray-400">
              {formData.OBSERVACIONES?.length || 0} caracteres
            </span>
          </div>
        </div>
      </FormSection>

      {/* Consejos para observaciones */}
      <div className="bg-green-50 border border-green-200 rounded p-3">
        <h4 className="text-xs font-medium text-green-800 mb-2">✅ Sugerencias para las observaciones</h4>
        <ul className="text-xs text-green-700 space-y-1">
          <li>• Condiciones comerciales especiales</li>
          <li>• Requisitos técnicos específicos</li>
          <li>• Contactos adicionales importantes</li>
          <li>• Horarios de entrega preferidos</li>
          <li>• Historial de incidencias relevantes</li>
          <li>• Certificaciones o acreditaciones especiales</li>
        </ul>
      </div>
    </div>
  );
});

ObservationsSection.displayName = 'ObservationsSection';

export default ObservationsSection;