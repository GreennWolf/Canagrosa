import React, { memo, useEffect } from 'react';
import { MapPin, Copy } from 'lucide-react';
import FormField from './FormField';
import FormSection from './FormSection';
import { useClientForm } from '../../../contexts/ClientFormContext';
import { useData } from '../../../contexts/DataProvider';

/**
 * Sección de direcciones del cliente
 * Maneja dirección fiscal, de envío y de facturación
 */
const AddressSection = memo(() => {
  const { 
    formData, 
    errors, 
    touched, 
    handleChange, 
    handleBlur,
    setField,
    copyMainAddress
  } = useClientForm();

  const { 
    data,
    fetchCountries,
    fetchProvinces,
    fetchMunicipalities
  } = useData();

  // Cargar países al inicio
  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  // Cargar provincias cuando cambia el país principal
  useEffect(() => {
    if (formData.PAIS_ID) {
      fetchProvinces({ PAIS_ID: formData.PAIS_ID });
    }
  }, [formData.PAIS_ID, fetchProvinces]);

  // Cargar municipios cuando cambia la provincia principal
  useEffect(() => {
    if (formData.PROVINCIA_ID) {
      fetchMunicipalities({ PROVINCIA_ID: formData.PROVINCIA_ID });
    }
  }, [formData.PROVINCIA_ID, fetchMunicipalities]);

  // Cargar provincias para dirección de envío
  useEffect(() => {
    if (formData.PAIS_ID_ENVIO) {
      fetchProvinces({ PAIS_ID: formData.PAIS_ID_ENVIO });
    }
  }, [formData.PAIS_ID_ENVIO, fetchProvinces]);

  // Cargar municipios para dirección de envío
  useEffect(() => {
    if (formData.PROVINCIA_ID_ENVIO) {
      fetchMunicipalities({ PROVINCIA_ID: formData.PROVINCIA_ID_ENVIO });
    }
  }, [formData.PROVINCIA_ID_ENVIO, fetchMunicipalities]);

  // Cargar provincias para dirección de facturación
  useEffect(() => {
    if (formData.PAIS_ID_FACTURACION) {
      fetchProvinces({ PAIS_ID: formData.PAIS_ID_FACTURACION });
    }
  }, [formData.PAIS_ID_FACTURACION, fetchProvinces]);

  // Cargar municipios para dirección de facturación
  useEffect(() => {
    if (formData.PROVINCIA_ID_FACTURACION) {
      fetchMunicipalities({ PROVINCIA_ID: formData.PROVINCIA_ID_FACTURACION });
    }
  }, [formData.PROVINCIA_ID_FACTURACION, fetchMunicipalities]);

  // Preparar opciones para los selectores
  const countryOptions = data.countries?.map(country => ({
    value: country.ID_PAIS,
    label: country.NOMBRE
  })) || [];

  const provinceOptions = data.provinces?.map(province => ({
    value: province.ID_PROVINCIA,
    label: province.NOMBRE
  })) || [];

  const municipalityOptions = data.municipalities?.map(municipality => ({
    value: municipality.ID_MUNICIPIO,
    label: municipality.NOMBRE
  })) || [];

  // Manejar cambio de checkbox para usar dirección principal
  const handleUseMainAddress = (addressType, checked) => {
    const fieldName = addressType === 'shipping' ? 'USE_MAIN_ADDRESS' : 'USE_MAIN_ADDRESS_BILLING';
    
    setField(fieldName, checked ? 1 : 0);
    
    if (checked) {
      copyMainAddress(addressType);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dirección Fiscal (Principal) */}
      <FormSection 
        title="Dirección Fiscal (Principal)" 
        icon={<MapPin size={14} />}
      >
        <div className="grid grid-cols-1 gap-3">
          <FormField
            label="Dirección"
            name="DIRECCION"
            value={formData.DIRECCION}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Calle, número, piso, puerta"
            helpText="Dirección completa de la empresa"
          />
          
          <div className="grid grid-cols-3 gap-2">
            <FormField
              label="Código Postal"
              name="COD_POSTAL"
              value={formData.COD_POSTAL}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.COD_POSTAL}
              touched={touched.COD_POSTAL}
              placeholder="28001"
              maxLength={5}
            />
            
            <div className="col-span-2">
              <FormField
                label="País"
                name="PAIS_ID"
                type="select"
                value={formData.PAIS_ID}
                onChange={handleChange}
                onBlur={handleBlur}
                options={countryOptions}
                placeholder="Seleccione país"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <FormField
              label="Provincia"
              name="PROVINCIA_ID"
              type="select"
              value={formData.PROVINCIA_ID}
              onChange={handleChange}
              onBlur={handleBlur}
              options={provinceOptions}
              placeholder="Seleccione provincia"
              disabled={!formData.PAIS_ID}
            />
            
            <FormField
              label="Municipio"
              name="MUNICIPIO_ID"
              type="select"
              value={formData.MUNICIPIO_ID}
              onChange={handleChange}
              onBlur={handleBlur}
              options={municipalityOptions}
              placeholder="Seleccione municipio"
              disabled={!formData.PROVINCIA_ID}
            />
          </div>
        </div>
      </FormSection>
      
      {/* Dirección de Envío */}
      <FormSection 
        title="Dirección de Envío"
        icon={<MapPin size={14} />}
        actions={
          <button
            type="button"
            onClick={() => copyMainAddress('shipping')}
            className="flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            title="Copiar dirección fiscal"
          >
            <Copy size={12} className="mr-1" />
            <span className="hidden sm:inline">Copiar fiscal</span>
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center mb-2">
            <FormField
              type="checkbox"
              name="USE_MAIN_ADDRESS"
              checked={formData.USE_MAIN_ADDRESS === 1}
              onChange={(e) => handleUseMainAddress('shipping', e.target.checked)}
              placeholder="Usar la misma dirección fiscal"
            />
          </div>
          
          <FormField
            label="Dirección"
            name="DIRECCION_ENVIO"
            value={formData.DIRECCION_ENVIO}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={formData.USE_MAIN_ADDRESS === 1}
            placeholder="Calle, número, piso, puerta"
          />
          
          <div className="grid grid-cols-3 gap-2">
            <FormField
              label="Código Postal"
              name="COD_POSTAL_ENVIO"
              value={formData.COD_POSTAL_ENVIO}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.COD_POSTAL_ENVIO}
              touched={touched.COD_POSTAL_ENVIO}
              disabled={formData.USE_MAIN_ADDRESS === 1}
              placeholder="28001"
              maxLength={5}
            />
            
            <div className="col-span-2">
              <FormField
                label="País"
                name="PAIS_ID_ENVIO"
                type="select"
                value={formData.PAIS_ID_ENVIO}
                onChange={handleChange}
                onBlur={handleBlur}
                options={countryOptions}
                disabled={formData.USE_MAIN_ADDRESS === 1}
                placeholder="Seleccione país"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <FormField
              label="Provincia"
              name="PROVINCIA_ID_ENVIO"
              type="select"
              value={formData.PROVINCIA_ID_ENVIO}
              onChange={handleChange}
              onBlur={handleBlur}
              options={provinceOptions}
              disabled={formData.USE_MAIN_ADDRESS === 1 || !formData.PAIS_ID_ENVIO}
              placeholder="Seleccione provincia"
            />
            
            <FormField
              label="Municipio"
              name="MUNICIPIO_ID_ENVIO"
              type="select"
              value={formData.MUNICIPIO_ID_ENVIO}
              onChange={handleChange}
              onBlur={handleBlur}
              options={municipalityOptions}
              disabled={formData.USE_MAIN_ADDRESS === 1 || !formData.PROVINCIA_ID_ENVIO}
              placeholder="Seleccione municipio"
            />
          </div>
        </div>
      </FormSection>
      
      {/* Dirección de Facturación */}
      <FormSection 
        title="Dirección de Facturación"
        icon={<MapPin size={14} />}
        actions={
          <button
            type="button"
            onClick={() => copyMainAddress('billing')}
            className="flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            title="Copiar dirección fiscal"
          >
            <Copy size={12} className="mr-1" />
            <span className="hidden sm:inline">Copiar fiscal</span>
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center mb-2">
            <FormField
              type="checkbox"
              name="USE_MAIN_ADDRESS_BILLING"
              checked={formData.USE_MAIN_ADDRESS_BILLING === 1}
              onChange={(e) => handleUseMainAddress('billing', e.target.checked)}
              placeholder="Usar la misma dirección fiscal"
            />
          </div>
          
          <FormField
            label="Dirección"
            name="DIRECCION_FACTURACION"
            value={formData.DIRECCION_FACTURACION}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={formData.USE_MAIN_ADDRESS_BILLING === 1}
            placeholder="Calle, número, piso, puerta"
          />
          
          <div className="grid grid-cols-3 gap-2">
            <FormField
              label="Código Postal"
              name="COD_POSTAL_FACTURACION"
              value={formData.COD_POSTAL_FACTURACION}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.COD_POSTAL_FACTURACION}
              touched={touched.COD_POSTAL_FACTURACION}
              disabled={formData.USE_MAIN_ADDRESS_BILLING === 1}
              placeholder="28001"
              maxLength={5}
            />
            
            <div className="col-span-2">
              <FormField
                label="País"
                name="PAIS_ID_FACTURACION"
                type="select"
                value={formData.PAIS_ID_FACTURACION}
                onChange={handleChange}
                onBlur={handleBlur}
                options={countryOptions}
                disabled={formData.USE_MAIN_ADDRESS_BILLING === 1}
                placeholder="Seleccione país"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <FormField
              label="Provincia"
              name="PROVINCIA_ID_FACTURACION"
              type="select"
              value={formData.PROVINCIA_ID_FACTURACION}
              onChange={handleChange}
              onBlur={handleBlur}
              options={provinceOptions}
              disabled={formData.USE_MAIN_ADDRESS_BILLING === 1 || !formData.PAIS_ID_FACTURACION}
              placeholder="Seleccione provincia"
            />
            
            <FormField
              label="Municipio"
              name="MUNICIPIO_ID_FACTURACION"
              type="select"
              value={formData.MUNICIPIO_ID_FACTURACION}
              onChange={handleChange}
              onBlur={handleBlur}
              options={municipalityOptions}
              disabled={formData.USE_MAIN_ADDRESS_BILLING === 1 || !formData.PROVINCIA_ID_FACTURACION}
              placeholder="Seleccione municipio"
            />
          </div>
        </div>
      </FormSection>
    </div>
  );
});

AddressSection.displayName = 'AddressSection';

export default AddressSection;