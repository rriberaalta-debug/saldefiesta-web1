
import React, { useState } from 'react';
import { X, Search, Loader2, Info, Calendar, MapPin } from 'lucide-react';
import { findFiestasWithAI } from '../services/geminiService';
import { FiestaEvent } from '../types';

interface FiestaFinderProps {
  onClose: () => void;
}

const FiestaCard: React.FC<{ event: FiestaEvent }> = ({ event }) => (
  <div className="bg-white/5 p-4 rounded-lg border border-white/10 animate-fade-in space-y-3 text-left">
    <div className="flex justify-between items-start gap-2">
      <h3 className="font-bold text-lg text-festive-orange pr-2">{event.name}</h3>
      <span className="text-xs bg-sky-blue/20 text-sky-300 font-semibold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">{event.type}</span>
    </div>
    <div className="flex items-center gap-2 text-sm text-sky-300">
      <MapPin size={16} />
      <span>{event.city}</span>
    </div>
    <div className="flex items-center gap-2 text-sm text-gray-300">
      <Calendar size={16} />
      <span>{event.dates}</span>
    </div>
    <p className="text-sm text-gray-400 pt-2 border-t border-white/10">{event.description}</p>
  </div>
);

const FiestaFinder: React.FC<FiestaFinderProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FiestaEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(true);
    
    try {
      const fiestas = await findFiestasWithAI(query);
      setResults(fiestas);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error inesperado al buscar.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full flex-col text-center">
          <Loader2 className="animate-spin text-festive-orange" size={48} />
          <p className="mt-4 text-lg">Buscando fiestas...</p>
          <p className="text-sm text-gray-400">Consultando información actualizada...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-red-400 p-8">
          <Info className="mb-4" size={48} />
          <p className="text-lg font-semibold">Ha ocurrido un error</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }
    if (hasSearched) {
      if (results.length > 0) {
        return (
          <div className="space-y-4">
            {results.map((event, index) => (
              <FiestaCard key={`${event.name}-${index}`} event={event} />
            ))}
          </div>
        );
      }
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Info className="text-sky-400 mb-4" size={48} />
          <p className="text-lg font-semibold">No se encontraron resultados</p>
          <p className="text-sm text-gray-400">Prueba con otra búsqueda. Sé lo más específico posible.</p>
        </div>
      );
    }
    return null; // No content before first search
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
        <h2 className="text-2xl font-bold mb-4 text-center">Buscador de Fiestas</h2>
        <p className="text-center text-gray-400 text-sm mb-6">Busca por municipio para encontrar sus fiestas patronales y eventos más importantes.</p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: 'Pamplona', 'Fiestas de la Mercè en Barcelona'..."
            className="w-full bg-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-festive-orange"
            autoFocus
          />
          <button type="submit" disabled={isLoading} className="bg-festive-orange font-bold py-3 px-5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center">
            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
          </button>
        </form>

        <div className="overflow-y-auto pr-2 flex-grow min-h-[200px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default FiestaFinder;