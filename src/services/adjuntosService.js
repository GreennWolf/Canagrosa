import axios from 'axios';

// Obtener la URL base desde las variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Flag para determinar si usar datos mock o API real
const USE_MOCK_DATA = true; // Los endpoints de adjuntos no existen aún en la API

// Datos mock para desarrollo y testing
let mockAdjuntos = {
  1: [ // Cliente ID 1
    {
      id: 1,
      filename: 'factura-2023-001.pdf',
      size: 1240000,
      type: 'application/pdf',
      uploadDate: '2023-12-15T10:30:00Z',
      description: 'Factura trimestral Q4 2023'
    },
    {
      id: 2,
      filename: 'contrato-servicios.docx',
      size: 450000,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadDate: '2023-10-05T14:22:00Z',
      description: 'Contrato de servicios analíticos'
    },
    {
      id: 3,
      filename: 'logo-empresa.png',
      size: 340000,
      type: 'image/png',
      uploadDate: '2023-09-12T09:15:00Z',
      description: 'Logo corporativo en alta resolución'
    }
  ],
  2: [ // Cliente ID 2
    {
      id: 4,
      filename: 'certificado-calidad.pdf',
      size: 890000,
      type: 'application/pdf',
      uploadDate: '2024-01-08T11:45:00Z',
      description: 'Certificado ISO 9001:2015'
    }
  ]
};

// Función para simular delay de red
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Función de reintento automático para peticiones API
 */
const withRetry = async (apiCall, options = {}) => {
  const { 
    maxRetries = 3, 
    delayMs = 500, 
    shouldRetry = (error) => error.response?.status >= 500 || error.code === 'ECONNABORTED'
  } = options;
  
  let lastError;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      if (error.name === 'CanceledError' || error.name === 'AbortError' || !shouldRetry(error)) {
        throw error;
      }
      
      attempt++;
      
      if (attempt >= maxRetries) {
        throw error;
      }
      
      const waitTime = delayMs * Math.pow(1.5, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      console.log(`Reintentando petición (intento ${attempt} de ${maxRetries})...`);
    }
  }
  
  throw lastError;
};

/**
 * Servicio para manejar adjuntos de clientes
 */
const adjuntosService = {
  /**
   * Obtener todos los adjuntos de un cliente
   * @param {number} clienteId - ID del cliente
   * @param {AbortSignal} signal - Señal para cancelar la petición
   * @returns {Promise<Array>} Lista de adjuntos
   */
  obtenerPorCliente: async (clienteId, signal = null) => {
    if (USE_MOCK_DATA) {
      // Simular delay de red
      await mockDelay(300);
      
      // Verificar si la petición fue cancelada
      if (signal && signal.aborted) {
        const error = new Error('Operation was aborted');
        error.name = 'AbortError';
        throw error;
      }
      
      // Devolver datos mock para este cliente
      const clientFiles = mockAdjuntos[clienteId] || [];
      return [...clientFiles]; // Devolver copia para evitar mutaciones
    }
    
    return withRetry(async () => {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          timeout: 10000
        };
        
        if (signal) {
          config.signal = signal;
        }
        
        const response = await axios.get(
          `${API_URL}/adjuntos/cliente/${clienteId}`,
          config
        );
        
        return response.data?.data || response.data || [];
      } catch (error) {
        console.error('Error fetching client attachments:', error);
        
        // Crear error formateado
        const formattedError = new Error(
          error.response?.data?.message || 
          'Error al obtener los adjuntos del cliente'
        );
        formattedError.isFormatted = true;
        formattedError.status = error.response?.status;
        
        throw formattedError;
      }
    });
  },

  /**
   * Subir adjuntos para un cliente
   * @param {number} clienteId - ID del cliente
   * @param {FormData} formData - Datos del formulario con archivos
   * @param {AbortSignal} signal - Señal para cancelar la petición
   * @param {Function} onProgress - Callback para progreso de subida
   * @returns {Promise<Array>} Lista de adjuntos subidos
   */
  subir: async (clienteId, formData, signal = null, onProgress = null) => {
    if (USE_MOCK_DATA) {
      // Simular progreso de subida
      if (onProgress) {
        for (let i = 0; i <= 100; i += 10) {
          if (signal && signal.aborted) {
            const error = new Error('Operation was aborted');
            error.name = 'AbortError';
            throw error;
          }
          
          onProgress(i);
          await mockDelay(100);
        }
      } else {
        await mockDelay(1000);
      }
      
      // Simular archivos subidos - crear objetos más realistas
      const files = formData.getAll('files');
      const newFiles = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const newFile = {
          id: Date.now() + i,
          filename: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date().toISOString(),
          description: '',
          // Agregar datos adicionales para mejor simulación
          originalFile: file, // Guardar referencia al archivo original
          status: 'uploaded'
        };
        
        // Leer el contenido del archivo si es texto o imagen pequeña
        if (file.type.startsWith('text/') || file.size < 100000) {
          try {
            const reader = new FileReader();
            const content = await new Promise((resolve) => {
              reader.onload = (e) => resolve(e.target.result);
              if (file.type.startsWith('text/')) {
                reader.readAsText(file);
              } else {
                reader.readAsDataURL(file);
              }
            });
            newFile.content = content;
          } catch (err) {
            console.log('No se pudo leer el contenido del archivo:', err);
          }
        }
        
        newFiles.push(newFile);
      }
      
      // Agregar a los datos mock
      if (!mockAdjuntos[clienteId]) {
        mockAdjuntos[clienteId] = [];
      }
      mockAdjuntos[clienteId].unshift(...newFiles);
      
      return newFiles;
    }
    
    return withRetry(async () => {
      try {
        const config = {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000 // 1 minuto para subidas
        };
        
        if (signal) {
          config.signal = signal;
        }
        
        if (onProgress) {
          config.onUploadProgress = (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          };
        }
        
        // Agregar el clienteId al FormData si no está presente
        if (!formData.has('clienteId')) {
          formData.append('clienteId', clienteId);
        }
        
        const response = await axios.post(
          `${API_URL}/adjuntos/upload`,
          formData,
          config
        );
        
        return response.data?.data || response.data || [];
      } catch (error) {
        console.error('Error uploading attachments:', error);
        
        const formattedError = new Error(
          error.response?.data?.message || 
          'Error al subir los archivos'
        );
        formattedError.isFormatted = true;
        formattedError.status = error.response?.status;
        
        throw formattedError;
      }
    });
  },

  /**
   * Actualizar descripción de un adjunto
   * @param {number} adjuntoId - ID del adjunto
   * @param {string} descripcion - Nueva descripción
   * @param {AbortSignal} signal - Señal para cancelar la petición
   * @returns {Promise<Object>} Adjunto actualizado
   */
  actualizarDescripcion: async (adjuntoId, descripcion, signal = null) => {
    if (USE_MOCK_DATA) {
      await mockDelay(200);
      
      if (signal && signal.aborted) {
        const error = new Error('Operation was aborted');
        error.name = 'AbortError';
        throw error;
      }
      
      // Buscar y actualizar en todos los clientes
      for (const clienteId in mockAdjuntos) {
        const fileIndex = mockAdjuntos[clienteId].findIndex(file => file.id === adjuntoId);
        if (fileIndex !== -1) {
          mockAdjuntos[clienteId][fileIndex].description = descripcion;
          return mockAdjuntos[clienteId][fileIndex];
        }
      }
      
      throw new Error('Adjunto no encontrado');
    }
    
    return withRetry(async () => {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          timeout: 10000
        };
        
        if (signal) {
          config.signal = signal;
        }
        
        const response = await axios.put(
          `${API_URL}/adjuntos/${adjuntoId}`,
          { descripcion },
          config
        );
        
        return response.data?.data || response.data;
      } catch (error) {
        console.error('Error updating attachment description:', error);
        
        const formattedError = new Error(
          error.response?.data?.message || 
          'Error al actualizar la descripción del adjunto'
        );
        formattedError.isFormatted = true;
        formattedError.status = error.response?.status;
        
        throw formattedError;
      }
    });
  },

  /**
   * Eliminar un adjunto
   * @param {number} adjuntoId - ID del adjunto
   * @param {AbortSignal} signal - Señal para cancelar la petición
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  eliminar: async (adjuntoId, signal = null) => {
    if (USE_MOCK_DATA) {
      await mockDelay(300);
      
      if (signal && signal.aborted) {
        const error = new Error('Operation was aborted');
        error.name = 'AbortError';
        throw error;
      }
      
      // Buscar y eliminar de todos los clientes
      for (const clienteId in mockAdjuntos) {
        const fileIndex = mockAdjuntos[clienteId].findIndex(file => file.id === adjuntoId);
        if (fileIndex !== -1) {
          mockAdjuntos[clienteId].splice(fileIndex, 1);
          return true;
        }
      }
      
      throw new Error('Adjunto no encontrado');
    }
    
    return withRetry(async () => {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          timeout: 10000
        };
        
        if (signal) {
          config.signal = signal;
        }
        
        await axios.delete(
          `${API_URL}/adjuntos/${adjuntoId}`,
          config
        );
        
        return true;
      } catch (error) {
        console.error('Error deleting attachment:', error);
        
        const formattedError = new Error(
          error.response?.data?.message || 
          'Error al eliminar el adjunto'
        );
        formattedError.isFormatted = true;
        formattedError.status = error.response?.status;
        
        throw formattedError;
      }
    });
  },

  /**
   * Obtener URL de descarga de un adjunto
   * @param {number} adjuntoId - ID del adjunto
   * @param {AbortSignal} signal - Señal para cancelar la petición
   * @returns {Promise<string>} URL de descarga
   */
  obtenerUrlDescarga: async (adjuntoId, signal = null) => {
    return withRetry(async () => {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          timeout: 10000
        };
        
        if (signal) {
          config.signal = signal;
        }
        
        const response = await axios.get(
          `${API_URL}/adjuntos/${adjuntoId}/download-url`,
          config
        );
        
        return response.data?.downloadUrl || response.data?.url || response.data;
      } catch (error) {
        console.error('Error getting download URL:', error);
        
        const formattedError = new Error(
          error.response?.data?.message || 
          'Error al obtener el enlace de descarga'
        );
        formattedError.isFormatted = true;
        formattedError.status = error.response?.status;
        
        throw formattedError;
      }
    });
  },

  /**
   * Descargar un adjunto directamente
   * @param {number} adjuntoId - ID del adjunto
   * @param {string} filename - Nombre del archivo
   * @param {AbortSignal} signal - Señal para cancelar la petición
   * @returns {Promise<void>} Inicia la descarga automáticamente
   */
  descargar: async (adjuntoId, filename = null, signal = null) => {
    if (USE_MOCK_DATA) {
      await mockDelay(500);
      
      if (signal && signal.aborted) {
        const error = new Error('Operation was aborted');
        error.name = 'AbortError';
        throw error;
      }
      
      // Buscar el archivo en los datos mock
      let foundFile = null;
      for (const clienteId in mockAdjuntos) {
        foundFile = mockAdjuntos[clienteId].find(file => file.id === adjuntoId);
        if (foundFile) break;
      }
      
      if (!foundFile) {
        throw new Error('Archivo no encontrado');
      }
      
      // Simular descarga - usar contenido real si está disponible
      const fileName = filename || foundFile.filename;
      let blob;
      
      if (foundFile.content) {
        // Si tenemos el contenido real del archivo
        if (foundFile.type.startsWith('text/')) {
          blob = new Blob([foundFile.content], { type: foundFile.type });
        } else if (foundFile.content.startsWith('data:')) {
          // Para archivos binarios como imágenes
          const base64Data = foundFile.content.split(',')[1];
          const binaryData = atob(base64Data);
          const bytes = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
          }
          blob = new Blob([bytes], { type: foundFile.type });
        } else {
          blob = new Blob([foundFile.content], { type: foundFile.type });
        }
      } else {
        // Crear contenido de ejemplo para la simulación
        const content = `Contenido simulado del archivo: ${fileName}\nID: ${adjuntoId}\nTamaño: ${foundFile.size} bytes`;
        blob = new Blob([content], { type: 'text/plain' });
      }
      
      const url = window.URL.createObjectURL(blob);
      
      // Crear link temporal y hacer click para descargar
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return;
    }
    
    try {
      const config = {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        timeout: 30000,
        responseType: 'blob'
      };
      
      if (signal) {
        config.signal = signal;
      }
      
      const response = await axios.get(
        `${API_URL}/adjuntos/${adjuntoId}/download`,
        config
      );
      
      // Crear blob y descargar
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      // Obtener nombre del archivo desde headers o usar el proporcionado
      const contentDisposition = response.headers['content-disposition'];
      let fileName = filename;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }
      
      if (!fileName) {
        fileName = `adjunto_${adjuntoId}`;
      }
      
      // Crear link temporal y hacer click para descargar
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading attachment:', error);
      
      const formattedError = new Error(
        error.response?.data?.message || 
        'Error al descargar el archivo'
      );
      formattedError.isFormatted = true;
      formattedError.status = error.response?.status;
      
      throw formattedError;
    }
  }
};

export default adjuntosService;

/**
 * NOTAS PARA DESARROLLO:
 * 
 * Este servicio está configurado para usar datos mock mientras se desarrolla la API real.
 * 
 * Para cambiar a la API real:
 * 1. Cambiar USE_MOCK_DATA = false en la línea 5
 * 2. Implementar los siguientes endpoints en el backend:
 *    - GET /adjuntos/cliente/{clienteId} - Obtener adjuntos de un cliente
 *    - POST /adjuntos/upload - Subir archivos (multipart/form-data)
 *    - PUT /adjuntos/{adjuntoId} - Actualizar descripción
 *    - DELETE /adjuntos/{adjuntoId} - Eliminar adjunto
 *    - GET /adjuntos/{adjuntoId}/download - Descargar archivo
 * 
 * Estructura esperada de respuesta:
 * {
 *   "data": [
 *     {
 *       "id": 1,
 *       "filename": "archivo.pdf",
 *       "size": 123456,
 *       "type": "application/pdf",
 *       "uploadDate": "2024-01-01T10:00:00Z",
 *       "description": "Descripción del archivo"
 *     }
 *   ]
 * }
 */