
import React, { useState } from 'react';
import { GeolocationStatus } from '../types';
import { X, MapPin, Search, Loader2 } from 'lucide-react';

interface GeolocationModalProps {
  status: GeolocationStatus;
  onClose: () => void;
  onAllow: () => void;
  onManualSearch: (city: string) => void;
  cities: string[];
}

const GeolocationModal: React.FC<GeolocationModalProps> = ({ status, onClose, onAllow, onManualSearch, cities }) => {
  const [manualCity, setManualCity] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCity) {
      onManualSearch(manualCity);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader2 className="mx-auto animate-spin text-festive-orange mb-4" size={48} />
            <h3 className="text-xl font-bold">Obteniendo tu ubicación...</h3>
            <p className="text-gray-400 mt-2">Por favor, espera un momento.</p>
          </div>
        );
      case 'denied':
      case 'error':
        return (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">
              {status === 'denied' ? 'Permiso de ubicación denegado' : 'No se pudo obtener la ubicación'}
            </h3>
            <p className="text-gray-400 mb-6">
              Para usar esta función, necesitamos tu ubicación. Como alternativa, puedes buscar una ciudad manualmente.
            </p>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  placeholder="Escribe una ciudad..."
                  className="w-full bg-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-festive-orange"
                  list="city-suggestions"
                  autoFocus
                />
                 <datalist id="city-suggestions">
                    {cities.map(city => <option key={city} value={city} />)}
                </datalist>
              </div>
              <button type="submit" className="bg-festive-orange font-bold py-3 px-5 rounded-lg hover:bg-orange-600 transition-colors">
                Buscar
              </button>
            </form>
          </div>
        );
      case 'requesting':
      default:
        return (
          <div className="text-center">
            <MapPin className="mx-auto text-sky-blue mb-4" size={48} />
            <h3 className="text-xl font-bold mb-2">Activar "Cerca de Mí"</h3>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto">
              Para mostrarte las fiestas más cercanas, necesitamos tu permiso para acceder a tu ubicación. Tu ubicación no se compartirá con nadie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={onAllow}
                    className="bg-festive-orange font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors"
                >
                    Permitir Ubicación
                </button>
                 <button
                    onClick={onClose}
                    className="bg-white/10 font-bold py-3 px-6 rounded-lg hover:bg-white/20 transition-colors"
                >
                    Cancelar
                </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 w-full max-w-lg relative text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {status !== 'loading' && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

export default GeolocationModal;