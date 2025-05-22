// Índice de exportaciones para los componentes del formulario mejorado
export { default as FormField } from './FormField';
export { default as FormSection } from './FormSection';
export { default as BasicInfoSection } from './BasicInfoSection';
export { default as AddressSection } from './AddressSection';
export { default as ContactSection } from './ContactSection';
export { default as FinancialSection } from './FinancialSection';
export { default as ResponsiblesSection } from './ResponsiblesSection';
export { default as ObservationsSection } from './ObservationsSection';

// Exportar también el contexto
export { ClientFormProvider, useClientForm } from '../../../contexts/ClientFormContext';

// Hook de validación
export { default as useFormValidation } from '../../../hooks/useFormValidation';