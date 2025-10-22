
import React from 'react';
import { X } from 'lucide-react';

interface LegalModalProps {
  title: string;
  content: string;
  onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ title, content, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col relative text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
        <div 
          className="prose prose-invert prose-p:text-gray-300 prose-h2:text-white prose-h3:text-gray-200 overflow-y-auto pr-4"
          dangerouslySetInnerHTML={{ __html: content }}
        >
        </div>
        <div className="mt-6 text-center">
            <button onClick={onClose} className="bg-festive-orange text-white font-bold py-2 px-6 rounded-full hover:bg-orange-600 transition-colors">
                Cerrar
            </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;