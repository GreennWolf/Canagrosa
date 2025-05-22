import React, { memo } from 'react';
import { Building } from 'lucide-react';
import FormField from './FormField';
import FormSection from './FormSection';
import { useClientForm } from '../../../contexts/ClientFormContext';

/**
 * Sección de información básica del cliente
 * Maneja los campos principales del cliente
 */
const BasicInfoSection = memo(() => {
  const { 
    formData, 
    errors, 
    touched, 
    handleChange, 
    handleBlur 
  } = useClientForm();

  return (
    <FormSection 
      title="Datos del Cliente" 
      icon={<Building size={14} />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Nombre - Campo obligatorio */}
        <div className="col-span-2 md:col-span-1">
          <FormField
            label="Nombre de la empresa"
            name="NOMBRE"
            value={formData.NOMBRE}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.NOMBRE}
            touched={touched.NOMBRE}
            required={true}
            placeholder="Ingrese el nombre de la empresa"
            helpText="Nombre completo de la empresa o razón social"
          />
        </div>
        
        {/* CIF y Teléfono en la misma fila */}
        <div className="col-span-2 md:col-span-1">
          <div className="grid grid-cols-2 gap-2">
            <FormField
              label="C.I.F./N.I.F."
              name="CIF"
              value={formData.CIF}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.CIF}
              touched={touched.CIF}
              placeholder="A12345678"
              helpText="Código de identificación fiscal"
            />
            
            <FormField
              label="Teléfono"
              name="TELEFONO"
              type="tel"
              value={formData.TELEFONO}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.TELEFONO}
              touched={touched.TELEFONO}
              placeholder="912345678"
            />
          </div>
        </div>
        
        {/* FAX */}
        <div>
          <FormField
            label="FAX"
            name="FAX"
            type="tel"
            value={formData.FAX}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="912345679"
          />
        </div>

        {/* Web */}
        <div>
          <FormField
            label="Página Web"
            name="WEB"
            type="url"
            value={formData.WEB}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.WEB}
            touched={touched.WEB}
            placeholder="https://www.ejemplo.com"
          />
        </div>
        
        {/* Sección de checkboxes para características */}
        <div className="col-span-2">
          <div className="border border-gray-200 rounded p-2 bg-white">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Características del Cliente</h4>
            
            {/* Factura por determinaciones - checkbox principal */}
            <div className="mb-2">
              <FormField
                type="checkbox"
                name="FACTURA_DETERMINACIONES"
                checked={formData.FACTURA_DETERMINACIONES === 1}
                onChange={handleChange}
                placeholder="Factura por determinaciones"
              />
            </div>
            
            {/* Grid de características organizadas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
              <FormField
                type="checkbox"
                name="EADS"
                checked={formData.EADS === 1}
                onChange={handleChange}
                placeholder="Aeronáutico"
              />
              
              <FormField
                type="checkbox"
                name="AIRBUS"
                checked={formData.AIRBUS === 1}
                onChange={handleChange}
                placeholder="Airbus"
              />
              
              <FormField
                type="checkbox"
                name="IBERIA"
                checked={formData.IBERIA === 1}
                onChange={handleChange}
                placeholder="Iberia"
              />
              
              <FormField
                type="checkbox"
                name="AGROALIMENTARIO"
                checked={formData.AGROALIMENTARIO === 1}
                onChange={handleChange}
                placeholder="Agroalimentario"
              />
              
              <FormField
                type="checkbox"
                name="INTRA"
                checked={formData.INTRA === 1}
                onChange={handleChange}
                placeholder="Intracomunitario"
              />
              
              <FormField
                type="checkbox"
                name="EXTRANJERO"
                checked={formData.EXTRANJERO === 1}
                onChange={handleChange}
                placeholder="Extracomunitario"
              />
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
});

BasicInfoSection.displayName = 'BasicInfoSection';

export default BasicInfoSection;