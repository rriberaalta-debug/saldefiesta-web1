
import React from 'react';
import { TopContributor, TrendingLocation } from '../types';
import TopContributors from './TopContributors';
import TrendingLocations from './TrendingLocations';

interface GamificationSidebarProps {
  topContributors: TopContributor[];
  trendingLocations: TrendingLocation[];
  onUserSelect: (userId: string) => void;
  selectedLocation: string | null;
  onLocationSelect: (city: string | null) => void;
}

const GamificationSidebar: React.FC<GamificationSidebarProps> = ({ 
  topContributors, 
  trendingLocations, 
  onUserSelect,
  selectedLocation,
  onLocationSelect
}) => {
  return (
    <div className="sticky top-28 space-y-6">
      <TopContributors contributors={topContributors} onUserSelect={onUserSelect} />
      <TrendingLocations 
        locations={trendingLocations} 
        selectedLocation={selectedLocation}
        onLocationSelect={onLocationSelect}
      />
    </div>
  );
};

export default GamificationSidebar;