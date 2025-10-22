
import React from 'react';
import { SortBy } from '../types';
import { Loader2 } from 'lucide-react';

interface FeedFiltersProps {
  sortBy: SortBy;
  onSortChange: (sortBy: SortBy) => void;
}

const FeedFilters: React.FC<FeedFiltersProps> = ({ sortBy, onSortChange }) => {
  const getButtonClass = (buttonType: SortBy) => {
    const isActive = sortBy === buttonType;
    return `px-4 py-2 rounded-full font-semibold transition-colors text-sm sm:text-base flex items-center gap-2 ${
      isActive
        ? 'bg-festive-orange text-white'
        : 'bg-black/20 text-gray-300 hover:bg-white/20'
    } disabled:opacity-50 disabled:cursor-not-allowed`;
  };

  return (
    <div className="flex justify-center sm:justify-start items-center gap-2 sm:gap-4 p-2 bg-black/10 rounded-full mb-4">
      <button
        onClick={() => onSortChange('recent')}
        className={getButtonClass('recent')}
      >
        Más Recientes
      </button>
      <button
        onClick={() => onSortChange('popular')}
        className={getButtonClass('popular')}
      >
        Más Populares
      </button>
      <button
        onClick={() => onSortChange('nearby')}
        className={getButtonClass('nearby')}
      >
        Cerca de Mí
      </button>
    </div>
  );
};

export default FeedFilters;