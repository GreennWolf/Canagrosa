import clienteApi from './clienteApi';

const authService = {
  // Iniciar sesión y obtener token
  iniciarSesion: async (credenciales) => {
    try {
      const respuesta = await clienteApi.post('/login', credenciales);
      if (respuesta.data && respuesta.data.token) {
        localStorage.setItem('token', respuesta.data.token);
      }
      return respuesta.data;
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      throw error;
    }
  },
  
  // Obtener información del usuario autenticado
  obtenerUsuarioActual: async () => {
    try {
      const respuesta = await clienteApi.get('/me');
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener el usuario actual:', error);
      throw error;
    }
  },
  
  // Cerrar sesión
  cerrarSesion: async () => {
    try {
      const respuesta = await clienteApi.post('/logout');
      localStorage.removeItem('token');
      return respuesta.data;
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
      localStorage.removeItem('token');
      throw error;
    }
  },
  
  // Verificar si el usuario está autenticado
  estaAutenticado: () => {
    return !!localStorage.getItem('token');
  }
};

export default authService;