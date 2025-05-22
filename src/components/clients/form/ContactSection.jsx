import React, { memo } from 'react';
import { Mail } from 'lucide-react';
import FormField from './FormField';
import FormSection from './FormSection';
import { useClientForm } from '../../../contexts/ClientFormContext';

/**
 * Sección de información de contacto y emails
 * Maneja emails principales, secundarios y de facturación
 */
const ContactSection = memo(() => {
  const { 
    formData, 
    errors, 
    touched, 
    handleChange, 
    handleBlur 
  } = useClientForm();

  return (
    <FormSection 
      title="Gestión de Correos Electrónicos" 
      icon={<Mail size={14} />}
    >
      <div className="space-y-3">
        {/* Email Principal */}
        <FormField
          label="Email Principal"
          name="EMAIL"
          type="email"
          value={formData.EMAIL}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.EMAIL}
          touched={touched.EMAIL}
          placeholder="contacto@empresa.com"
          helpText="Dirección de email principal para comunicaciones"
        />
        
        {/* Email Secundario */}
        <FormField
          label="Email Secundario"
          name="EMAIL2"
          type="email"
          value={formData.EMAIL2}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.EMAIL2}
          touched={touched.EMAIL2}
          placeholder="info@empresa.com"
          helpText="Dirección de email alternativa (opcional)"
        />
        
        {/* Email de Facturación */}
        <FormField
          label="Email de Facturación"
          name="EMAIL_FACTURACION"
          type="email"
          value={formData.EMAIL_FACTURACION}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.EMAIL_FACTURACION}
          touched={touched.EMAIL_FACTURACION}
          placeholder="facturacion@empresa.com"
          helpText="Email específico para el envío de facturas"
        />
        
        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
          <h4 className="text-xs font-medium text-blue-800 mb-2">ℹ️ Información sobre emails</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• El email principal se usará para comunicaciones generales</li>
            <li>• El email de facturación recibirá las facturas automáticamente</li>
            <li>• Puede configurar múltiples emails para diferentes propósitos</li>
          </ul>
        </div>
      </div>
    </FormSection>
  );
});

ContactSection.displayName = 'ContactSection';

export default ContactSection;