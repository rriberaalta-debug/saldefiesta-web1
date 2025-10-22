
import React, { useState, useCallback, ChangeEvent } from 'react';
import { X, UploadCloud, Loader2 } from 'lucide-react';
import { generateDescription } from '../services/geminiService';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (formData: { title: string; description: string; city: string; file: File }) => Promise<void>;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Basic validation
      if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
        setError('Por favor, selecciona un archivo de imagen o vídeo válido.');
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
        setError('El tamaño del archivo debe ser inferior a 50MB.');
        return;
      }
      setError(null);
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };
  
  const handleGenerateDesc = async () => {
    if (!title || !city) {
        setError("Por favor, introduce un título y una ciudad para generar una descripción.");
        return;
    }
    setError(null);
    setIsGenerating(true);
    try {
        const generated = await generateDescription(title, city);
        setDescription(generated);
    } catch(err) {
        setError("No se pudo generar la descripción. Por favor, escríbela manualmente.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !city) {
      setError('El título, la ciudad y el archivo son obligatorios.');
      return;
    }
    setIsUploading(true);
    setError(null);
    await onUpload({ title, description, city, file });
    setIsUploading(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative text-white shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Comparte un Momento de Fiesta</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!preview ? (
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <label htmlFor="file-upload" className="cursor-pointer">
                <UploadCloud className="mx-auto text-gray-500 mb-2" size={48} />
                <span className="text-festive-orange font-semibold">Haz clic para subir</span>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, MP4, etc. (máx 50MB)</p>
              </label>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,video/*"/>
            </div>
          ) : (
            <div className="w-full aspect-video rounded-lg overflow-hidden relative">
              {file?.type.startsWith('video') ? (
                <video src={preview} controls className="w-full h-full object-cover"></video>
              ) : (
                <img src={preview} alt="Vista previa" className="w-full h-full object-cover"/>
              )}
               <button type="button" onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-black/70">
                    <X size={16} />
                </button>
            </div>
          )}
          
          <input type="text" placeholder="Título de la fiesta" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-festive-orange"/>
          <input type="text" placeholder="Ciudad" value={city} onChange={e => setCity(e.target.value)} required className="w-full bg-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-festive-orange"/>
          <div className="relative">
            <textarea placeholder="Añade una descripción..." value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-gray-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-festive-orange resize-none"></textarea>
            <button
                type="button"
                onClick={handleGenerateDesc}
                disabled={isGenerating || !title || !city}
                className="absolute bottom-2 right-2 bg-vibrant-purple text-white px-2 py-1 text-xs rounded-md hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={14}/> : '✨'}
              <span>Generar con IA</span>
            </button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <button type="submit" disabled={isUploading || !file} className="w-full bg-festive-orange font-bold py-3 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
            {isUploading && <Loader2 className="animate-spin mr-2" size={20} />}
            {isUploading ? 'Subiendo...' : 'Compartir'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;