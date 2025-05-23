import React, { useState } from 'react';

/**
 * Componente de pestañas para ser usado en modales y formularios
 * 
 * @param {Object} props
 * @param {Array} props.tabs - Array de objetos {id, label, icon}
 * @param {Object} props.children - Componentes a renderizar en cada pestaña
 * @param {String} props.activeTab - ID de la pestaña activa
 * @param {Function} props.onTabChange - Función a llamar cuando cambia la pestaña
 * @param {Boolean} props.fixedHeight - Si debe mantener altura fija entre tabs
 * @param {String} props.contentHeight - Altura específica para el contenido
 */
const TabPanel = ({ 
  tabs = [], 
  children, 
  activeTab: externalActiveTab = null,
  onTabChange = null,
  className = '',
  fixedHeight = false,
  contentHeight = '400px'
}) => {
  // Estado interno para la pestaña activa si no se proporciona externamente
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id || '');
  
  // Usar la pestaña activa proporcionada externamente o la interna
  const activeTab = externalActiveTab !== null ? externalActiveTab : internalActiveTab;
  
  // Manejar el cambio de pestaña
  const handleTabChange = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };
  
  return (
    <div className={`flex flex-col ${className}`}>
      {/* Cabecera de pestañas */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 text-sm font-medium focus:outline-none ${
              activeTab === tab.id 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleTabChange(tab.id)}
          >
            <div className="flex items-center">
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </div>
          </button>
        ))}
      </div>
      
      {/* Contenido de la pestaña activa */}
      <div 
        className="py-4"
        style={fixedHeight ? {
          minHeight: contentHeight,
          height: contentHeight,
          overflowY: 'auto'
        } : {}}
      >
        <div className={fixedHeight ? 'h-full' : ''}>
          {React.Children.toArray(children).find((child, index) => {
            return tabs[index]?.id === activeTab;
          })}
        </div>
      </div>
    </div>
  );
};

export default TabPanel;