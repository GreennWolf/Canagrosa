import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Componente ErrorBoundary para capturar y mostrar errores de forma elegante
 * en lugar de romper toda la aplicación
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Actualizar el estado para mostrar la UI de error
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Guardar información del error para diagnóstico
    this.setState({ errorInfo });
    
    // Registrar el error en un servicio de monitoreo (opcional)
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    
    // Se podría implementar un reporte de errores al backend aquí
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    if (this.state.hasError) {
      // UI de error personalizada
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 mr-3" size={24} />
              <h2 className="text-xl font-bold text-gray-800">
                Algo salió mal
              </h2>
            </div>
            
            <div className="text-gray-600 mb-6">
              <p className="mb-2">
                Ha ocurrido un error inesperado al renderizar este componente.
              </p>
              <p>
                Por favor, intente recargar la página. Si el problema persiste,
                contacte al soporte técnico.
              </p>
            </div>
            
            {/* En desarrollo, mostrar detalles del error */}
            {isDevelopment && this.state.error && (
              <div className="mt-4 border border-red-200 rounded p-3 bg-red-50 mb-4 overflow-auto max-h-40">
                <p className="font-mono text-xs text-red-800 whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </p>
              </div>
            )}
            
            <div className="flex justify-center space-x-3">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center"
              >
                <RefreshCw size={16} className="mr-2" />
                Reintentar
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Si no hay error, renderizar los children normalmente
    return this.props.children;
  }
}

export default ErrorBoundary;