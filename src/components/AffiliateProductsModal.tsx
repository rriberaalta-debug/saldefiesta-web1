// src/components/AffiliateProductsModal.tsx
import React from 'react';
import { X, ShoppingCart, Info, Loader2, AlertTriangle } from 'lucide-react';
import { AffiliateProduct } from '../types';

interface AffiliateProductsModalProps {
  state: {
    status: 'loading' | 'success' | 'error';
    data: AffiliateProduct[];
    error: string | null;
  };
  onClose: () => void;
}

const ProductCard: React.FC<{ product: AffiliateProduct }> = ({ product }) => (
  <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex flex-col sm:flex-row gap-4">
    <div className="w-full sm:w-1/3 flex-shrink-0">
        <img src={product.imageUrl} alt={product.name} className="w-full h-32 sm:h-full object-cover rounded-md" />
    </div>
    <div className="flex flex-col">
        <h3 className="font-bold text-lg text-white">{product.name}</h3>
        <p className="text-sm text-gray-300 flex-grow my-2">{product.description}</p>
        <a 
            href={product.affiliateUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mt-auto inline-block bg-festive-orange text-white font-bold py-2 px-4 rounded-full hover:bg-orange-600 transition-colors text-center text-sm"
        >
            Comprar en Amazon
        </a>
    </div>
  </div>
);


const AffiliateProductsModal: React.FC<AffiliateProductsModalProps> = ({ state, onClose }) => {
  
  const renderContent = () => {
    if (state.status === 'loading') {
       return (
        <div className="flex items-center justify-center h-48 flex-col text-center">
          <Loader2 className="animate-spin text-festive-orange" size={48} />
          <p className="mt-4 text-lg">Cargando productos...</p>
        </div>
      );
    }

    if (state.status === 'error') {
      const urlMatch = state.error?.match(/(https?:\/\/[^\s]+)/);
      const indexUrl = urlMatch ? urlMatch[0] : null;

      return (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg text-left">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-lg">Error al Cargar los Productos</h3>
              <div className="bg-black/50 p-2 rounded-md mt-4">
                <p className="text-xs font-semibold text-gray-400">Mensaje de error:</p>
                <code className="text-xs whitespace-pre-wrap">{state.error}</code>
              </div>
              {indexUrl && (
                <div className="mt-4">
                  <p className="text-sm font-bold mb-2">ACCIÓN REQUERIDA (Falta Índice):</p>
                  <p className="text-xs mb-2">Haz clic en el siguiente enlace para crear el índice que Firebase necesita. Se abrirá en una nueva pestaña. Una vez creado (tarda 1-2 minutos), refresca esta página.</p>
                  <a 
                    href={indexUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-yellow-500 text-black font-bold py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors text-sm break-all"
                  >
                    Crear Índice en Firebase
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    if (state.status === 'success' && state.data.length > 0) {
      return (
        <div className="space-y-4">
          {state.data.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      );
    }
    
    // This case will be hit if status is 'success' but data is empty,
    // which shouldn't happen with the new logic in App.tsx that sets an error instead.
    // It's kept as a fallback.
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <Info className="text-sky-400 mb-4" size={48} />
        <p className="text-lg font-semibold">¡Vuelve pronto!</p>
        <p className="text-sm text-gray-400">Estamos preparando una selección de los mejores productos para fiesteros.</p>
      </div>
    );
  };
    
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col relative text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <div className="text-center mb-6">
            <ShoppingCart className="mx-auto text-sky-blue mb-2" size={32} />
            <h2 className="text-2xl font-bold">Productos para Fiesteros</h2>
             <p className="text-xs text-gray-500 mt-2">(Como afiliado de Amazon, gano por las compras que califican)</p>
        </div>
        
        <div className="overflow-y-auto pr-2 flex-grow min-h-0">
          {renderContent()}
        </div>
        
        <div className="mt-6 text-center">
            <button onClick={onClose} className="bg-white/10 font-bold py-2 px-6 rounded-lg hover:bg-white/20 transition-colors">
                Cerrar
            </button>
        </div>
      </div>
    </div>
  );
};

export default AffiliateProductsModal;