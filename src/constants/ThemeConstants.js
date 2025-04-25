// ThemeConstants.js
// Define constantes para el tema de la aplicación

const ThemeConstants = {
    // Colores de fondo
    bgColors: {
      page: "bg-slate-100", // Fondo general de la página
      card: "bg-slate-50", // Fondo de tarjetas
      sidebar: "bg-slate-800", // Fondo de la barra lateral
      header: "bg-slate-700", // Fondo del encabezado
      form: "bg-slate-50", // Fondo de formularios
      input: "bg-white", // Fondo de inputs
      tableHeader: "bg-slate-200", // Fondo de cabeceras de tabla
      tableRow: "bg-slate-50", // Fondo de filas de tabla
      tableRowAlt: "bg-white", // Fondo alternativo para filas
      tableRowHover: "hover:bg-slate-100", // Fondo al pasar sobre filas
      tableRowSelected: "bg-blue-50", // Fondo de filas seleccionadas
    },
    
    // Colores de texto
    textColors: {
      primary: "text-slate-900", // Texto principal
      secondary: "text-slate-700", // Texto secundario
      tertiary: "text-slate-600", // Texto terciario
      light: "text-slate-500", // Texto claro
      header: "text-white", // Texto en cabecera
      sidebar: "text-slate-200", // Texto en sidebar
      link: "text-blue-600", // Enlaces
      linkHover: "hover:text-blue-800", // Enlaces al pasar el mouse
    },
    
    // Estilos de bordes
    borders: {
      default: "border border-slate-200", // Borde por defecto
      focus: "focus:ring-2 focus:ring-blue-500 focus:border-blue-500", // Borde al enfocar
      input: "border-slate-300", // Bordes de inputs
      table: "border-slate-200", // Bordes en tablas
      card: "border border-slate-200", // Bordes en tarjetas
    },
    
    // Estilos de botones
    buttons: {
      primary: "bg-blue-600 hover:bg-blue-700 text-white",
      secondary: "bg-slate-200 hover:bg-slate-300 text-slate-800",
      danger: "bg-red-600 hover:bg-red-700 text-white",
      ghost: "hover:bg-slate-100 text-slate-700",
      disabled: "bg-slate-200 text-slate-400 cursor-not-allowed",
    },
    
    // Tamaños y espaciados de texto
    text: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
    },
    
    // Sombras
    shadows: {
      sm: "shadow-sm",
      md: "shadow",
      lg: "shadow-lg",
    },
    
    // Redondeado
    rounded: {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full",
    },
    
    // Estilos combinados para entradas de formulario
    inputs: {
      default: "block w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
      error: "block w-full px-3 py-2 border border-red-300 rounded-md bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500",
      disabled: "block w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-100 text-slate-500 cursor-not-allowed",
    },
    
    // Transiciones
    transitions: {
      default: "transition-all duration-200",
      slow: "transition-all duration-300",
      fast: "transition-all duration-100",
    },
    
    // Estados
    states: {
      active: "bg-blue-50 border-blue-500",
      success: "bg-green-50 text-green-800 border-green-200",
      warning: "bg-yellow-50 text-yellow-800 border-yellow-200", 
      error: "bg-red-50 text-red-800 border-red-200",
      info: "bg-blue-50 text-blue-800 border-blue-200",
    }
  };
  
  export default ThemeConstants;