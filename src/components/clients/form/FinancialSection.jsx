import React, { memo, useEffect } from 'react';
import { CreditCard, DollarSign, Globe } from 'lucide-react';
import FormField from './FormField';
import FormSection from './FormSection';
import { useClientForm } from '../../../contexts/ClientFormContext';
import { useData } from '../../../contexts/DataProvider';

/**
 * Sección de información financiera del cliente
 * Maneja datos bancarios, formas de pago, tarifas e idioma
 */
const FinancialSection = memo(() => {
  const { 
    formData, 
    errors, 
    touched, 
    handleChange, 
    handleBlur,
    setField 
  } = useClientForm();

  const { 
    data,
    fetchPaymentMethods,
    fetchRates
  } = useData();

  // Cargar catálogos al inicio
  useEffect(() => {
    fetchPaymentMethods();
    fetchRates();
  }, [fetchPaymentMethods, fetchRates]);

  // Preparar opciones para los selectores
  const paymentMethodOptions = data.paymentMethods?.map(method => ({
    value: method.ID_FP,
    label: method.NOMBRE
  })) || [];

  const rateOptions = data.rates?.map(rate => ({
    value: rate.ID_TARIFA,
    label: rate.NOMBRE
  })) || [];

  // Manejar cambio de idioma (radio buttons)
  const handleLanguageChange = (value) => {
    setField('IDIOMA_FACTURA', value);
  };

  return (
    <div className="space-y-4">
      {/* Datos Bancarios */}
      <FormSection 
        title="Datos Bancarios" 
        icon={<CreditCard size={14} />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            label="Banco"
            name="BANCO"
            value={formData.BANCO}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Nombre del banco"
            helpText="Entidad bancaria principal"
          />
          
          <FormField
            label="Número de Cuenta (IBAN/CCC)"
            name="CUENTA"
            value={formData.CUENTA}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="ES91 2100 0418 4502 0005 1332"
            helpText="Código de cuenta del cliente"
          />
        </div>
      </FormSection>

      {/* Configuración Comercial */}
      <FormSection 
        title="Configuración Comercial" 
        icon={<DollarSign size={14} />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            label="Forma de Pago"
            name="FP_ID"
            type="select"
            value={formData.FP_ID}
            onChange={handleChange}
            onBlur={handleBlur}
            options={paymentMethodOptions}
            placeholder="Seleccione forma de pago"
            helpText="Método de pago preferido"
          />
          
          <FormField
            label="Tarifa"
            name="TARIFA_ID"
            type="select"
            value={formData.TARIFA_ID}
            onChange={handleChange}
            onBlur={handleBlur}
            options={rateOptions}
            placeholder="Seleccione tarifa"
            helpText="Tarifa de precios aplicable"
          />
        </div>
        
        {/* Factura Electrónica */}
        <div className="mt-3">
          <FormField
            type="checkbox"
            name="FACTURA_ELECTRONICA"
            checked={formData.FACTURA_ELECTRONICA === 1}
            onChange={handleChange}
            placeholder="Habilitar facturación electrónica"
          />
          <p className="text-xs text-gray-500 mt-1 ml-5">
            Permite el envío de facturas en formato electrónico
          </p>
        </div>
      </FormSection>

      {/* Configuración de Idioma */}
      <FormSection 
        title="Configuración de Idioma" 
        icon={<Globe size={14} />}
      >
        <div>
          <label className="block text-xs text-gray-700 mb-2">
            Idioma de Facturación
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50">
              <input
                type="radio"
                id="idioma_es"
                name="IDIOMA_FACTURA"
                checked={formData.IDIOMA_FACTURA === 1 || formData.IDIOMA_FACTURA === '1'}
                onChange={() => handleLanguageChange(1)}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="idioma_es" className="ml-2 text-xs text-gray-700 cursor-pointer">
                🇪🇸 Español
              </label>
            </div>
            
            <div className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50">
              <input
                type="radio"
                id="idioma_en"
                name="IDIOMA_FACTURA"
                checked={formData.IDIOMA_FACTURA === 2 || formData.IDIOMA_FACTURA === '2'}
                onChange={() => handleLanguageChange(2)}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="idioma_en" className="ml-2 text-xs text-gray-700 cursor-pointer">
                🇬🇧 Inglés
              </label>
            </div>
            
            <div className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50">
              <input
                type="radio"
                id="idioma_fr"
                name="IDIOMA_FACTURA"
                checked={formData.IDIOMA_FACTURA === 3 || formData.IDIOMA_FACTURA === '3'}
                onChange={() => handleLanguageChange(3)}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="idioma_fr" className="ml-2 text-xs text-gray-700 cursor-pointer">
                🇫🇷 Francés
              </label>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            Seleccione el idioma en el que se generarán las facturas para este cliente
          </p>
        </div>
      </FormSection>

      {/* Otros Datos Empresariales */}
      <FormSection title="Otros Datos Empresariales">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            label="Centro"
            name="CENTRO"
            value={formData.CENTRO}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Centro de trabajo o división"
            helpText="Departamento o centro específico"
          />
          
          <FormField
            label="Cargo del Contacto"
            name="CARGO"
            value={formData.CARGO}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Director, Gerente, etc."
            helpText="Cargo del contacto principal"
          />
        </div>
      </FormSection>
    </div>
  );
});

FinancialSection.displayName = 'FinancialSection';

export default FinancialSection;