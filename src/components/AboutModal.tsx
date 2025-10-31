
// src/components/AboutModal.tsx
import React from 'react';
import { X, Users } from 'lucide-react';

interface AboutModalProps {
  content: string;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ content, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[80vh] flex flex-col relative text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        
        <div className="text-center flex-shrink-0">
            <Users className="mx-auto text-sky-blue mb-4" size={48} />
            <h2 className="text-2xl font-bold mb-6">Quiénes Somos</h2>
        </div>
        
        <div 
          className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white mx-auto text-left max-w-none flex-grow min-h-0 overflow-y-auto pr-4"
          dangerouslySetInnerHTML={{ __html: content }}
        >
        </div>

        <div className="mt-8 text-center flex-shrink-0">
          <button onClick={onClose} className="bg-festive-orange text-white font-bold py-2 px-6 rounded-full hover:bg-orange-600 transition-colors">
            ¡A Festejar!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
