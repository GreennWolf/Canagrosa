import React, { useState, useEffect } from 'react';
import { 
  Paperclip, 
  X, 
  Plus, 
  Trash2, 
  Upload, 
  File, 
  FileText, 
  Image, 
  FileSpreadsheet
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';

const AdjuntosModal = ({ clientId, onClose }) => {
  // Estado para documentos adjuntos
  const [documentos, setDocumentos] = useState([
    { id: 1, nombre: 'factura_2023.pdf', tipo: 'PDF', fecha: '15/03/2023', tamaño: '245 KB' },
    { id: 2, nombre: 'contrato_firmado.pdf', tipo: 'PDF', fecha: '22/01/2023', tamaño: '1.2 MB' },
    { id: 3, nombre: 'logo_empresa.jpg', tipo: 'JPG', fecha: '05/12/2022', tamaño: '340 KB' }
  ]);
  
  // Estado para la interfaz
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [fileType, setFileType] = useState('PDF');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Manejo de archivos
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Crear URL para previsualización
      if (selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };
  
  // Limpiar la URL de previsualización al desmontar
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  // Agregar documento
  const handleAddDocument = () => {
    if (!file) return;
    
    const newDoc = {
      id: Date.now(),
      nombre: file.name,
      tipo: fileType,
      fecha: new Date().toLocaleDateString(),
      tamaño: formatFileSize(file.size)
    };
    
    setDocumentos([...documentos, newDoc]);
    setFile(null);
    setPreviewUrl(null);
    
    // Resetear el input de archivo
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
  };
  
  // Eliminar documento
  const handleRemoveDocument = () => {
    if (selectedDocId) {
      setDocumentos(documentos.filter(doc => doc.id !== selectedDocId));
      setSelectedDocId(null);
    }
  };
  
  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Obtener icono según tipo de archivo
  const getFileIcon = (tipo) => {
    switch (tipo.toLowerCase()) {
      case 'pdf':
        return <FileText size={14} className="text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image size={14} className="text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet size={14} className="text-green-500" />;
      default:
        return <File size={14} className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg overflow-hidden flex flex-col max-h-[90vh]">
      {/* Cabecera */}
      <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
        <h2 className="font-medium text-sm flex items-center">
          <Paperclip size={16} className="mr-2" />
          Documentos adjuntos - Cliente #{clientId}
        </h2>
        <button 
          onClick={onClose}
          className="text-white hover:text-red-200"
        >
          <X size={18} />
        </button>
      </div>
      
      {/* Contenido */}
      <div className="p-3 overflow-auto flex-grow">
        {/* Tabla de documentos */}
        <div className="bg-white border border-gray-300 rounded mb-3 overflow-hidden">
          <div className="bg-gray-50 px-3 py-1 border-b border-gray-300 flex justify-between items-center">
            <h3 className="text-xs font-medium text-gray-700">Documentos adjuntos</h3>
            <div className="flex space-x-2">
              <button 
                onClick={handleRemoveDocument}
                disabled={!selectedDocId}
                className={`p-1 rounded text-xs flex items-center ${
                  selectedDocId ? 'text-red-600 hover:bg-red-50' : 'text-gray-400'
                }`}
              >
                <Trash2 size={14} className="mr-1" />
                Eliminar
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 tracking-wider">
                    Tamaño
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documentos.length > 0 ? (
                  documentos.map((doc) => (
                    <tr 
                      key={doc.id} 
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`cursor-pointer hover:bg-blue-50 ${selectedDocId === doc.id ? 'bg-blue-100' : ''}`}
                    >
                      <td className="px-3 py-2 text-xs text-gray-900 flex items-center">
                        {getFileIcon(doc.tipo)}
                        <span className="ml-2">{doc.nombre}</span>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-500">{doc.tipo}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">{doc.fecha}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">{doc.tamaño}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-500">
                      No hay documentos adjuntos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Formulario de carga */}
        <div className="bg-white border border-gray-300 rounded p-3">
          <div className="flex flex-col space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tipo de documento
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PDF">PDF</option>
                  <option value="DOC">DOC/DOCX</option>
                  <option value="XLS">XLS/XLSX</option>
                  <option value="JPG">JPG/JPEG</option>
                  <option value="PNG">PNG</option>
                  <option value="TXT">TXT</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Seleccionar archivo
                </label>
                <input
                  id="fileInput"
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-gray-700 border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500 file:mr-3 file:py-1 file:px-2 file:text-xs file:border-0 file:bg-blue-50 file:text-blue-600 file:rounded"
                />
              </div>
            </div>
            
            {file && (
              <div className="flex items-start space-x-3">
                <div className="flex-grow">
                  <div className="text-xs font-medium text-gray-700">Archivo seleccionado:</div>
                  <div className="text-xs text-gray-600 mt-1 flex items-center">
                    {getFileIcon(file.name.split('.').pop())}
                    <span className="ml-2">{file.name}</span>
                    <span className="ml-2 text-gray-500">({formatFileSize(file.size)})</span>
                  </div>
                </div>
                
                {previewUrl && (
                  <div className="w-16 h-16 border border-gray-300 rounded overflow-hidden">
                    <img src={previewUrl} alt="Vista previa" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <button
                  onClick={handleAddDocument}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center"
                >
                  <Upload size={14} className="mr-1" />
                  Subir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Pie */}
      <div className="bg-gray-200 border-t border-gray-300 px-4 py-2 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default AdjuntosModal;