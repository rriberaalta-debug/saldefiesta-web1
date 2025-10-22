
import React from 'react';

interface CallToActionUploadProps {
  onSignUpClick: () => void;
}

const CallToActionUpload: React.FC<CallToActionUploadProps> = ({ onSignUpClick }) => {
  return (
    <div className="bg-black/20 backdrop-blur-lg text-center p-6 rounded-xl my-8">
      <h2 className="text-2xl font-bold mb-2">¿Cuéntanos tu última fiesta?</h2>
      <p className="text-gray-300 mb-4 max-w-lg mx-auto">
        ¡Tus recuerdos merecen ser compartidos! Únete a la comunidad para subir tus fotos y vídeos.
      </p>
      <button
        onClick={onSignUpClick}
        className="bg-festive-orange text-white font-bold py-2 px-6 rounded-full hover:bg-orange-600 transition-transform transform hover:scale-105"
      >
        Regístrate para Compartir
      </button>
    </div>
  );
};

export default CallToActionUpload;