/**
 * Constantes de estilo para la aplicación
 * Centraliza configuraciones de estilo para mantener la consistencia visual
 */
const ThemeConstants = {
  // Colores de fondo
  bgColors: {
    page: 'bg-gray-100',
    card: 'bg-white',
    header: 'bg-slate-800',
    sidebar: 'bg-slate-800',
    input: 'bg-white'
  },
  
  // Colores de texto
  textColors: {
    primary: 'text-gray-800',
    secondary: 'text-gray-600',
    light: 'text-gray-400',
    header: 'text-white',
    sidebar: 'text-white'
  },
  
  // Bordes
  borders: {
    default: 'border border-gray-200',
    card: 'border border-gray-200',
    input: 'border-gray-300',
    focus: 'focus:ring-blue-500 focus:border-blue-500'
  },
  
  // Sombras
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  },
  
  // Bordes redondeados
  rounded: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  },
  
  // Transiciones
  transitions: {
    default: 'transition duration-200 ease-in-out'
  },
  
  // Tamaños de texto
  text: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  },
  
  // Estados
  states: {
    success: 'bg-green-50 text-green-800',
    warning: 'bg-yellow-50 text-yellow-800',
    error: 'bg-red-50 text-red-800',
    info: 'bg-blue-50 text-blue-800'
  },
  
  // Botones
  buttons: {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    disabled: 'bg-gray-400 text-white cursor-not-allowed'
  },
  
  // Inputs
  inputs: {
    default: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
    error: 'w-full px-3 py-2 border border-red-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500'
  }
};

export default ThemeConstants;