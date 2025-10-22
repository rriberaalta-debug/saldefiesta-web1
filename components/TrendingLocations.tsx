
import React from 'react';
import { TrendingLocation } from '../types';
import { MapPin } from 'lucide-react';

interface TrendingLocationsProps {
  locations: TrendingLocation[];
  selectedLocation: string | null;
  onLocationSelect: (city: string | null) => void;
}

const TrendingLocations: React.FC<TrendingLocationsProps> = ({ locations, selectedLocation, onLocationSelect }) => {
  if (locations.length === 0) {
    return null;
  }

  const getButtonClass = (city: string | null) => {
    return `w-full text-left p-2 rounded-md transition-colors text-sm ${
      selectedLocation === city
        ? 'bg-sky-blue/30 text-white font-bold'
        : 'hover:bg-white/10 text-gray-300'
    }`;
  };

  return (
    <div className="bg-black/20 backdrop-blur-lg p-4 rounded-xl">
      <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
        <MapPin className="text-sky-blue" />
        Filtrar por Ubicación
      </h3>
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => onLocationSelect(null)}
            className={getButtonClass(null)}
          >
            <span className="font-semibold">Mostrar Todas</span>
          </button>
        </li>
        {locations.map(({ city, postCount }) => (
          <li key={city}>
            <button
              onClick={() => onLocationSelect(city)}
              className={getButtonClass(city)}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold truncate">{city}</span>
                <span className="font-medium bg-white/10 px-2 py-0.5 rounded-md">{postCount}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrendingLocations;