
import React, { useState, useRef, useEffect } from 'react';
import { Search, User as UserIcon, Home, SlidersHorizontal, LogOut, Loader2, CalendarDays } from 'lucide-react';
import { FilterOptions, User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onSearch: (query: string) => void;
  isSearching: boolean;
  onProfileClick: () => void;
  onHomeClick: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  activeFilterCount: number;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogoutClick: () => void;
  onFiestaFinderClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  onSearch, 
  isSearching,
  onProfileClick, 
  onHomeClick, 
  onApplyFilters, 
  activeFilterCount,
  onLoginClick,
  onSignUpClick,
  onLogoutClick,
  onFiestaFinderClick
}) => {
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    mediaType: 'all',
  });
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApply = () => {
    onApplyFilters(filters);
    setFilterOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/20 backdrop-blur-md p-4 z-40 border-b border-white/10">
      <div className="container mx-auto flex flex-wrap justify-between items-center gap-y-4">
        
        {/* LOGO - Centered on mobile, left-aligned on desktop */}
        <div className="w-full md:w-auto md:flex-none text-center md:text-left md:order-1 md:mr-8">
           <div className="inline-block bg-black/20 backdrop-blur-sm p-2 rounded-lg shadow-lg">
             <h1 
                onClick={onHomeClick}
                className="font-lobster text-5xl text-festive-orange cursor-pointer transition-transform hover:scale-105"
             >
                SaldeFiesta
             </h1>
           </div>
        </div>

        {/* Search & Actions Wrapper */}
        <div className="w-full md:flex-1 md:order-2 flex items-center justify-center md:justify-end gap-x-2 sm:gap-x-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por fiesta, ciudad..."
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full bg-white/10 placeholder-gray-400 text-white rounded-full py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-festive-orange"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={20} />
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="relative">
                    <button onClick={() => setFilterOpen(!isFilterOpen)} className="text-white hover:text-festive-orange transition-colors relative">
                        <SlidersHorizontal size={28} />
                        {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-festive-orange text-white text-xs rounded-full flex items-center justify-center border-2 border-gray-800">{activeFilterCount}</span>
                        )}
                    </button>
                    {isFilterOpen && (
                    <div ref={filterRef} className="absolute top-12 right-0 bg-gray-800 rounded-lg shadow-xl p-4 w-72 z-50 border border-white/10">
                        <h4 className="font-bold mb-4">Filtros</h4>
                        <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold">Rango de Fechas</label>
                            <div className="flex gap-2 mt-1">
                            <input type="date" value={filters.startDate || ''} onChange={e => setFilters({...filters, startDate: e.target.value || null})} className="w-full bg-gray-700 p-2 rounded text-sm"/>
                            <input type="date" value={filters.endDate || ''} onChange={e => setFilters({...filters, endDate: e.target.value || null})} className="w-full bg-gray-700 p-2 rounded text-sm"/>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Tipo de Contenido</label>
                            <select value={filters.mediaType} onChange={e => setFilters({...filters, mediaType: e.target.value as 'all' | 'image' | 'video'})} className="w-full bg-gray-700 p-2 rounded mt-1 text-sm">
                            <option value="all">Todo</option>
                            <option value="image">Imágenes</option>
                            <option value="video">Vídeos</option>
                            </select>
                        </div>
                        </div>
                        <button onClick={handleApply} className="w-full bg-festive-orange mt-6 py-2 rounded font-bold hover:bg-orange-600 transition-colors">Aplicar</button>
                    </div>
                    )}
                </div>
                <button onClick={onFiestaFinderClick} className="text-white hover:text-festive-orange transition-colors hidden sm:block">
                    <CalendarDays size={28} />
                </button>
                <button onClick={onHomeClick} className="text-white hover:text-festive-orange transition-colors hidden sm:block">
                    <Home size={28} />
                </button>
                {currentUser ? (
                    <>
                    <button onClick={onProfileClick} className="text-white hover:text-festive-orange transition-colors">
                        <UserIcon size={28} />
                    </button>
                    <button onClick={onLogoutClick} className="text-white hover:text-festive-orange transition-colors">
                        <LogOut size={28} />
                    </button>
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                    <button onClick={onLoginClick} className="text-white font-semibold py-2 px-4 rounded-full hover:bg-white/10 transition-colors hidden sm:block">
                        Iniciar Sesión
                    </button>
                    <button onClick={onSignUpClick} className="bg-festive-orange text-white font-semibold py-2 px-4 rounded-full hover:bg-orange-600 transition-colors">
                        Registrarse
                    </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
