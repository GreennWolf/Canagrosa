import React, { useState, useEffect, useRef } from 'react';
import { 
  File, Paperclip, Upload, X, Download, Trash2, 
  AlertCircle, FileText, RotateCw, Image, Clock,
  Calendar, Search, Check
} from 'lucide-react';
import adjuntosService from '../../services/adjuntosService';
import ConfirmModal from '../common/ConfirmModal';

const AdjuntosModal = ({ clientId }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  // Estados para el modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    fileToDelete: null,
    isDeleting: false
  });

  // Estado para previsualización
  const [selectedFilePreview, setSelectedFilePreview] = useState(null);
  
  
  // Cargar adjuntos al montar el componente
  useEffect(() => {
    const fetchFiles = async () => {
      if (!clientId) return;
      
      setIsLoading(true);
      setError(null);
      
      // Cancelar solicitudes anteriores
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      try {
        const fetchedFiles = await adjuntosService.obtenerPorCliente(
          clientId, 
          abortControllerRef.current.signal
        );
        
        // Convertir fechas de string a Date si es necesario
        const processedFiles = fetchedFiles.map(file => ({
          ...file,
          uploadDate: file.uploadDate ? new Date(file.uploadDate) : new Date(),
          // Asegurar campos requeridos
          description: file.description || '',
          size: file.size || 0,
          type: file.type || file.mimeType || 'application/octet-stream'
        }));
        
        setFiles(processedFiles);
        setFilteredFiles(processedFiles);
        
      } catch (err) {
        // No mostrar error si la petición fue cancelada
        if (err.name === 'CanceledError' || err.name === 'AbortError') {
          return;
        }
        
        console.error('Error fetching attachments:', err);
        setError(err.isFormatted ? err.message : 
          'No se pudieron cargar los adjuntos. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFiles();
    
    // Cleanup al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Limpiar todos los timeouts pendientes
      Object.values(debounceTimeoutRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
      debounceTimeoutRef.current = {};
    };
  }, [clientId]);
  
  // Filtrar archivos cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredFiles(files);
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = files.filter(file => 
      file.filename.toLowerCase().includes(searchLower) ||
      (file.description && file.description.toLowerCase().includes(searchLower))
    );
    
    setFilteredFiles(filtered);
  }, [searchTerm, files]);
  
  // Manejar la subida de archivos
  const handleFileUpload = async (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || !selectedFiles.length) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    // Crear nuevo AbortController para esta subida
    const uploadController = new AbortController();
    
    try {
      // Crear FormData
      const formData = new FormData();
      Array.from(selectedFiles).forEach(file => {
        formData.append('files', file);
      });
      
      // Subir archivos
      const uploadedFiles = await adjuntosService.subir(
        clientId,
        formData,
        uploadController.signal,
        setUploadProgress
      );
      
      // Procesar archivos subidos
      const processedFiles = uploadedFiles.map(file => ({
        ...file,
        uploadDate: file.uploadDate ? new Date(file.uploadDate) : new Date(),
        description: file.description || '',
        size: file.size || 0,
        type: file.type || file.mimeType || 'application/octet-stream'
      }));
      
      // Agregar los nuevos archivos al inicio de la lista
      setFiles(prev => [...processedFiles, ...prev]);
      setFilteredFiles(prev => [...processedFiles, ...prev]);
      
      // Limpiar el input de archivos
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (err) {
      // No mostrar error si la petición fue cancelada
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return;
      }
      
      console.error('Error uploading files:', err);
      setError(err.isFormatted ? err.message : 
        'Error al subir los archivos. Por favor, intente nuevamente.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Abrir modal de confirmación para eliminar
  const handleDeleteFile = (file) => {
    setConfirmModal({
      isOpen: true,
      fileToDelete: file,
      isDeleting: false
    });
  };

  // Confirmar eliminación del archivo
  const confirmDeleteFile = async () => {
    if (!confirmModal.fileToDelete) return;
    
    setConfirmModal(prev => ({ ...prev, isDeleting: true }));
    
    try {
      await adjuntosService.eliminar(confirmModal.fileToDelete.id);
      
      // Eliminar de la lista local
      setFiles(prev => prev.filter(file => file.id !== confirmModal.fileToDelete.id));
      setFilteredFiles(prev => prev.filter(file => file.id !== confirmModal.fileToDelete.id));
      
      // Cerrar modal
      setConfirmModal({
        isOpen: false,
        fileToDelete: null,
        isDeleting: false
      });
      
    } catch (err) {
      console.error('Error deleting file:', err);
      setError(err.isFormatted ? err.message : 
        'Error al eliminar el archivo. Por favor, intente nuevamente.');
      
      // Mantener modal abierto pero no en estado de carga
      setConfirmModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Cerrar modal de confirmación
  const closeConfirmModal = () => {
    if (!confirmModal.isDeleting) {
      setConfirmModal({
        isOpen: false,
        fileToDelete: null,
        isDeleting: false
      });
    }
  };
  
  // Manejar la descarga de un archivo
  const handleDownloadFile = async (file) => {
    try {
      await adjuntosService.descargar(file.id, file.filename);
      
    } catch (err) {
      console.error('Error downloading file:', err);
      setError(err.isFormatted ? err.message : 
        'Error al descargar el archivo. Por favor, intente nuevamente.');
    }
  };

  // Manejar doble click para abrir archivo en nueva pestaña
  const handleFileDoubleClick = async (file) => {
    try {
      // Crear una URL temporal con contenido simulado (funciona tanto en mock como real)
      const content = `Contenido del archivo: ${file.filename}\nID: ${file.id}\nTamaño: ${file.size} bytes\nTipo: ${file.type}\n\nEste es un contenido de ejemplo para visualizar el archivo.`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      
      // Abrir en nueva pestaña
      window.open(url, '_blank');
      
      // Limpiar la URL después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      console.error('Error opening file:', err);
      setError(err.isFormatted ? err.message : 
        'Error al abrir el archivo. Por favor, intente nuevamente.');
    }
  };

  // Manejar click simple para previsualización
  const handleFileClick = (file) => {
    setSelectedFilePreview(file);
  };
  
  // Refs para debounce de actualización de descripción
  const debounceTimeoutRef = useRef({});
  
  // Manejar la actualización de la descripción de un archivo
  const handleUpdateDescription = (fileId, newDescription) => {
    // Actualizar la UI inmediatamente
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, description: newDescription } : file
    ));
    setFilteredFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, description: newDescription } : file
    ));
    
    // Limpiar timeout anterior para este archivo
    if (debounceTimeoutRef.current[fileId]) {
      clearTimeout(debounceTimeoutRef.current[fileId]);
    }
    
    // Crear nuevo timeout para la llamada a la API
    debounceTimeoutRef.current[fileId] = setTimeout(async () => {
      try {
        await adjuntosService.actualizarDescripcion(fileId, newDescription);
      } catch (err) {
        console.error('Error updating file description:', err);
        setError(err.isFormatted ? err.message : 
          'Error al actualizar la descripción. Por favor, intente nuevamente.');
      }
      
      // Limpiar el timeout después de la ejecución
      delete debounceTimeoutRef.current[fileId];
    }, 1000); // Esperar 1 segundo después de que el usuario deje de escribir
  };
  
  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Función para determinar el icono según el tipo de archivo
  const getFileIcon = (fileType) => {
    if (fileType.includes('image')) return <Image size={14} className="text-blue-500" />;
    if (fileType.includes('pdf')) return <FileText size={14} className="text-red-500" />;
    if (fileType.includes('word') || fileType.includes('document')) return <FileText size={14} className="text-blue-600" />;
    if (fileType.includes('sheet') || fileType.includes('excel')) return <FileText size={14} className="text-green-600" />;
    
    return <File size={14} className="text-gray-500" />;
  };
  
  // Función para formatear la fecha
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Componente de previsualización
  const FilePreview = ({ file }) => {
    if (!file) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <File size={48} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Selecciona un archivo para previsualizar</p>
          </div>
        </div>
      );
    }

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    const isText = file.type.startsWith('text/') || 
                   file.type === 'application/json' || 
                   file.filename.endsWith('.txt') || 
                   file.filename.endsWith('.md');

    return (
      <div className="h-full flex flex-col">
        {/* Header del archivo */}
        <div className="border-b border-gray-200 p-3">
          <div className="flex items-center space-x-2">
            {getFileIcon(file.type)}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate" title={file.filename}>
                {file.filename}
              </h3>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)} • {formatDate(file.uploadDate)}
              </p>
            </div>
            <button
              onClick={() => handleFileDoubleClick(file)}
              className="flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 cursor-pointer"
              title="Abrir en nueva pestaña"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Abrir
            </button>
          </div>
          {file.description && (
            <p className="text-xs text-gray-600 mt-2 bg-gray-50 px-2 py-1 rounded">
              {file.description}
            </p>
          )}
        </div>

        {/* Contenido de previsualización */}
        <div className="flex-1 p-3 overflow-auto">
          {isImage ? (
            <div className="h-full">
              {file.content && file.content.startsWith('data:') ? (
                <div className="h-full flex flex-col">
                  <img 
                    src={file.content} 
                    alt={file.filename}
                    className="max-w-full max-h-full object-contain mx-auto"
                    style={{ maxHeight: 'calc(100% - 60px)' }}
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Vista previa real de la imagen
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Image size={64} className="mx-auto mb-4 text-blue-500" />
                    <p className="text-sm text-gray-600 mb-2">Vista previa de imagen</p>
                    <p className="text-xs text-gray-500">
                      Haz doble click para ver en tamaño completo
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : isPdf ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText size={64} className="mx-auto mb-4 text-red-500" />
                <p className="text-sm text-gray-600 mb-2">Documento PDF</p>
                <p className="text-xs text-gray-500">
                  Haz doble click para abrir el documento
                </p>
              </div>
            </div>
          ) : isText ? (
            <div className="h-full">
              {file.content ? (
                <div className="h-full flex flex-col">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded p-3 overflow-auto">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                      {file.content.length > 500 ? file.content.substring(0, 500) + '...' : file.content}
                    </pre>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Vista previa del contenido real del archivo
                    {file.content.length > 500 && ' (primeros 500 caracteres)'}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText size={64} className="mx-auto mb-4 text-green-500" />
                    <p className="text-sm text-gray-600 mb-2">Archivo de texto</p>
                    <p className="text-xs text-gray-500">
                      Haz doble click para ver el contenido
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <File size={64} className="mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  {file.type || 'Archivo'}
                </p>
                <p className="text-xs text-gray-500">
                  Haz doble click para abrir
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Barra superior con buscador y botón de subida */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-full mr-2">
          <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar adjuntos..."
            className="w-full pl-8 pr-4 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          />
        </div>
        
        <div className="flex items-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
          />
          <div className="relative">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={`flex items-center px-3 py-1 text-xs rounded ${
                isUploading
                  ? 'bg-blue-300 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isUploading ? (
                <>
                  <RotateCw size={14} className="mr-1 animate-spin" />
                  Subiendo... {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload size={14} className="mr-1" />
                  Subir archivo
                </>
              )}
            </button>
            
            {isUploading && (
              <div className="absolute -bottom-1 left-0 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mensaje de error (si existe) */}
      {error && (
        <div className="bg-red-50 p-2 mb-3 rounded-md border border-red-200 text-sm text-red-700 flex items-start">
          <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}
      
      {/* Contenido principal: tabla y previsualización */}
      <div className="flex-grow flex gap-4 min-h-0">
        {/* Lista de archivos - más pequeña */}
        <div className="w-3/5 bg-white border border-gray-200 rounded-md overflow-hidden flex flex-col">
          {/* Cabecera de la tabla */}
          <div className="bg-gray-50 border-b border-gray-200 grid grid-cols-12 text-xs font-medium text-gray-700 py-2 px-3">
            <div className="col-span-5">Nombre</div>
            <div className="col-span-3">Descripción</div>
            <div className="col-span-2">Fecha</div>
            <div className="col-span-1 text-center">Tamaño</div>
            <div className="col-span-1 text-center">Acciones</div>
          </div>
          
          {/* Contenido de la tabla */}
          <div className="flex-grow overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="flex flex-col items-center">
                <RotateCw className="animate-spin h-8 w-8 text-blue-600 mb-2" />
                <p className="text-gray-500 text-sm">Cargando archivos...</p>
              </div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron archivos que coincidan con la búsqueda' : 'No hay archivos adjuntos'}
            </div>
          ) : (
            filteredFiles.map((file) => (
              <div 
                key={file.id} 
                className={`grid grid-cols-12 text-xs border-b border-gray-200 py-2 px-3 cursor-pointer transition-colors ${
                  selectedFilePreview?.id === file.id 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleFileClick(file)}
                onDoubleClick={() => handleFileDoubleClick(file)}
                title="Click para previsualizar, doble click para abrir"
              >
                <div className="col-span-5 flex items-center space-x-2">
                  {getFileIcon(file.type)}
                  <div className="truncate text-gray-800 font-medium" title={file.filename}>{file.filename}</div>
                </div>
                
                <div className="col-span-3">
                  <input
                    type="text"
                    value={file.description || ''}
                    onChange={(e) => handleUpdateDescription(file.id, e.target.value)}
                    placeholder="Añadir descripción..."
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                  />
                </div>
                
                <div className="col-span-2 flex items-center">
                  <Calendar size={10} className="text-gray-400 mr-1" />
                  <span className="text-gray-700">{formatDate(file.uploadDate)}</span>
                </div>
                
                <div className="col-span-1 text-center flex items-center justify-center">
                  <span className="text-gray-700">{formatFileSize(file.size)}</span>
                </div>
                
                <div className="col-span-1 flex items-center justify-center space-x-1">
                  <button
                    onClick={() => handleDownloadFile(file)}
                    title="Descargar"
                    className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file)}
                    title="Eliminar"
                    className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
          </div>
        </div>

        {/* Sección de previsualización */}
        <div className="w-2/5 bg-white border border-gray-200 rounded-md overflow-hidden flex flex-col">
          <div className="bg-gray-50 border-b border-gray-200 px-3 py-2">
            <h3 className="text-xs font-medium text-gray-700">Previsualización</h3>
          </div>
          <div className="flex-grow">
            <FilePreview file={selectedFilePreview} />
          </div>
        </div>
      </div>
      
      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmDeleteFile}
        title="Eliminar archivo adjunto"
        message="¿Está seguro de que desea eliminar este archivo? Esta acción no se puede deshacer."
        confirmText="Eliminar archivo"
        cancelText="Cancelar"
        type="danger"
        isProcessing={confirmModal.isDeleting}
      >
        {confirmModal.fileToDelete && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex items-center space-x-2">
              {getFileIcon(confirmModal.fileToDelete.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {confirmModal.fileToDelete.filename}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(confirmModal.fileToDelete.size)} • {formatDate(confirmModal.fileToDelete.uploadDate)}
                </p>
                {confirmModal.fileToDelete.description && (
                  <p className="text-xs text-gray-600 mt-1">
                    {confirmModal.fileToDelete.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </ConfirmModal>
    </div>
  );
};

export default AdjuntosModal;