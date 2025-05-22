import React, { memo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Componente FormSection mejorado
 * Proporciona estructura y organización visual para grupos de campos
 */
const FormSection = memo(({ 
  title, 
  children, 
  className = '',
  headerClassName = '',
  contentClassName = '',
  collapsible = false,
  defaultCollapsed = false,
  icon = null,
  actions = null
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className={`border border-gray-300 rounded bg-gray-50 overflow-hidden ${className}`}>
      {/* Header */}
      <div 
        className={`flex items-center justify-between p-2 border-b border-gray-200 bg-gray-100 ${
          collapsible ? 'cursor-pointer hover:bg-gray-150' : ''
        } ${headerClassName}`}
        onClick={toggleCollapse}
      >
        <div className="flex items-center">
          {icon && (
            <div className="mr-2 text-gray-600">
              {icon}
            </div>
          )}
          <h3 className="text-xs font-bold text-gray-700">
            {title}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {actions && (
            <div className="flex items-center space-x-1">
              {actions}
            </div>
          )}
          
          {collapsible && (
            <div className="text-gray-500">
              {isCollapsed ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronUp size={14} />
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      {(!collapsible || !isCollapsed) && (
        <div className={`p-2 ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
});

FormSection.displayName = 'FormSection';

export default FormSection;