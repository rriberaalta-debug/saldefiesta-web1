
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-2 text-white">
      <Loader2 className="animate-spin text-festive-orange" size={24} />
      <span>Cargando...</span>
    </div>
  );
};

export default LoadingSpinner;