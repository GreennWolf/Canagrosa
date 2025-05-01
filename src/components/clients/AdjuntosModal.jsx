import React, { useState, useEffect } from 'react';
import { 
  File, Paperclip, Upload, X, Download, Trash2, 
  AlertCircle, FileText, RotateCw, Image, Clock,
  Calendar, Search, Check
} from 'lucide-react';
import { useData } from '../../contexts/DataProvider';

const AdjuntosModal = ({ clientId, onClose }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);
  const fileInputRef = React.useRef(null);
  
  const { apiService } = useData();
  
  // Cargar adjuntos al montar el componente
  useEffect(() => {
    const fetchFiles = async () => {
      if (!clientId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Esta sería la llamada real a la API
        // const response = await apiService.getAdjuntos(clientId);
        // setFiles(response.data || []);
        
        // Simulación de datos
        setTimeout(() => {
          const mockFiles = [
            {
              id: 1,
              filename: 'factura-2023-001.pdf',
              size: 1240000,
              type: 'application/pdf',
              uploadDate: new Date('2023-12-15'),
              description: 'Factura trimestral'
            },
            {
              id: 2,
              filename: 'contrato.docx',
              size: 450000,
              type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              uploadDate: new Date('2023-10-05'),
              description: 'Contrato de servicios'
            },
            {
              id: 3,
              filename: 'especificaciones-tecnicas.xlsx',
              size: 820000,
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              uploadDate: new Date('2024-01-20'),
              description: 'Especificaciones técnicas del proyecto'
            },
            {
              id: 4,
              filename: 'logo-cliente.png',
              size: 340000,
              type: 'image/png',
              uploadDate: new Date('2023-09-12'),
              description: 'Logo del cliente en alta resolución'
            }
          ];
          
          setFiles(mockFiles);
          setFilteredFiles(mockFiles);
          setIsLoading(false);
        }, 800);
        
      } catch (err) {
        console.error('Error fetching attachments:', err);
        setError('No se pudieron cargar los adjuntos. Por favor, intente nuevamente.');
        setIsLoading(false);
      }
    };
    
    fetchFiles();
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
    setError(null);
    
    try {
      // Aquí iría el código real para subir los archivos al servidor
      // const formData = new FormData();
      // Array.from(selectedFiles).forEach(file => {
      //   formData.append('files', file);
      // });
      // formData.append('clientId', clientId);
      // const response = await apiService.uploadAdjuntos(formData);
      
      // Simulación de subida
      setTimeout(() => {
        const newFiles = Array.from(selectedFiles).map((file, index) => ({
          id: Date.now() + index,
          filename: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date(),
          description: ''
        }));
        
        setFiles(prev => [...newFiles, ...prev]);
        setFilteredFiles(prev => [...newFiles, ...prev]);
        setIsUploading(false);
        
        // Limpiar el input de archivos
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1500);
      
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Error al subir los archivos. Por favor, intente nuevamente.');
      setIsUploading(false);
    }
  };
  
  // Manejar la eliminación de un archivo
  const handleDeleteFile = async (fileId) => {
    try {
      // Esta sería la llamada real a la API
      // await apiService.deleteAdjunto(fileId);
      
      // Simulación de eliminación
      setFiles(prev => prev.filter(file => file.id !== fileId));
      setFilteredFiles(prev => prev.filter(file => file.id !== fileId));
      
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Error al eliminar el archivo. Por favor, intente nuevamente.');
    }
  };
  
  // Manejar la descarga de un archivo
  const handleDownloadFile = async (file) => {
    try {
      // En una implementación real, aquí se obtendría la URL del archivo
      // const response = await apiService.getFileUrl(file.id);
      // window.open(response.data.url, '_blank');
      
      // Simulación de descarga
      alert(`Descargando: ${file.filename}`);
      
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Error al descargar el archivo. Por favor, intente nuevamente.');
    }
  };
  
  // Manejar la actualización de la descripción de un archivo
  const handleUpdateDescription = async (fileId, newDescription) => {
    try {
      // Esta sería la llamada real a la API
      // await apiService.updateAdjuntoDescription(fileId, { description: newDescription });
      
      // Simulación de actualización
      setFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, description: newDescription } : file
      ));
      setFilteredFiles(prev => prev.map(file => 
        file.id === fileId ? { ...file, description: newDescription } : file
      ));
      
    } catch (err) {
      console.error('Error updating file description:', err);
      setError('Error al actualizar la descripción. Por favor, intente nuevamente.');
    }
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
                Subiendo...
              </>
            ) : (
              <>
                <Upload size={14} className="mr-1" />
                Subir archivo
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Mensaje de error (si existe) */}
      {error && (
        <div className="bg-red-50 p-2 mb-3 rounded-md border border-red-200 text-sm text-red-700 flex items-start">
          <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}
      
      {/* Lista de archivos */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden flex-grow">
        {/* Cabecera de la tabla */}
        <div className="bg-gray-50 border-b border-gray-200 grid grid-cols-12 text-xs font-medium text-gray-700 py-2 px-3">
          <div className="col-span-5">Nombre</div>
          <div className="col-span-3">Descripción</div>
          <div className="col-span-2">Fecha</div>
          <div className="col-span-1 text-center">Tamaño</div>
          <div className="col-span-1 text-center">Acciones</div>
        </div>
        
        {/* Contenido de la tabla */}
        <div className="overflow-y-auto max-h-72">
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
                className="grid grid-cols-12 text-xs border-b border-gray-200 py-2 px-3 hover:bg-gray-50"
              >
                <div className="col-span-5 flex items-center space-x-2">
                  {getFileIcon(file.type)}
                  <div className="truncate" title={file.filename}>{file.filename}</div>
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
                    onClick={() => handleDeleteFile(file.id)}
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
    </div>
  );
};

export default AdjuntosModal;