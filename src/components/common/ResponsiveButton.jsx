import React from 'react';
import { Loader } from 'lucide-react';

/**
 * Botón responsive reutilizable
 * Se adapta automáticamente a diferentes tamaños de pantalla
 */
const ResponsiveButton = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  // Variantes de color
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-transparent',
    success: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white border-transparent',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent',
  };

  // Tamaños responsive
  const sizes = {
    xs: 'px-2 py-1 text-xs sm:px-2 sm:py-1',
    sm: 'px-3 py-1.5 text-sm sm:px-3 sm:py-1.5',
    md: 'px-4 py-2 text-sm sm:px-3 sm:py-1.5 sm:text-xs',
    lg: 'px-6 py-3 text-base sm:px-4 sm:py-2 sm:text-sm',
    xl: 'px-8 py-4 text-lg sm:px-6 sm:py-3 sm:text-base',
  };

  // Clases base
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-md border
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    ${fullWidth ? 'w-full' : ''}
    ${loading ? 'cursor-wait' : ''}
  `.trim().replace(/\s+/g, ' ');

  // Combinar todas las clases
  const buttonClasses = `
    ${baseClasses}
    ${variants[variant] || variants.primary}
    ${sizes[size] || sizes.md}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Renderizar icono
  const renderIcon = () => {
    if (loading) {
      return <Loader size={16} className="animate-spin" />;
    }
    return icon;
  };

  // Manejar click
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick && onClick(e);
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* Icono izquierdo */}
      {iconPosition === 'left' && renderIcon() && (
        <span className={`${children ? 'mr-2' : ''}`}>
          {renderIcon()}
        </span>
      )}

      {/* Contenido del botón */}
      {loading ? (
        <span className="flex items-center">
          <Loader size={16} className="animate-spin mr-2" />
          Cargando...
        </span>
      ) : (
        children
      )}

      {/* Icono derecho */}
      {iconPosition === 'right' && renderIcon() && !loading && (
        <span className={`${children ? 'ml-2' : ''}`}>
          {renderIcon()}
        </span>
      )}
    </button>
  );
};

// Componentes específicos para casos comunes
export const PrimaryButton = (props) => (
  <ResponsiveButton variant="primary" {...props} />
);

export const SecondaryButton = (props) => (
  <ResponsiveButton variant="secondary" {...props} />
);

export const DangerButton = (props) => (
  <ResponsiveButton variant="danger" {...props} />
);

export const OutlineButton = (props) => (
  <ResponsiveButton variant="outline" {...props} />
);

export const GhostButton = (props) => (
  <ResponsiveButton variant="ghost" {...props} />
);

export default ResponsiveButton;