
import React from 'react';
import { TopContributor } from '../types';
import { Crown } from 'lucide-react';

interface TopContributorsProps {
  contributors: TopContributor[];
  onUserSelect: (userId: string) => void;
}

const TopContributors: React.FC<TopContributorsProps> = ({ contributors, onUserSelect }) => {
  if (contributors.length === 0) {
    return null;
  }

  return (
    <div className="bg-black/20 backdrop-blur-lg p-4 rounded-xl">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Crown className="text-yellow-400" />
        ¡Los Reyes de la Fiesta!
      </h3>
      <ul className="space-y-3">
        {contributors.map(({ user, score }, index) => (
          <li 
            key={user.id} 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onUserSelect(user.id)}
          >
            <span className="font-bold text-lg w-5 text-center">{index + 1}</span>
            <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full border-2 border-transparent group-hover:border-festive-orange transition-colors" />
            <div className="flex-1">
              <p className="font-semibold text-white group-hover:underline truncate">{user.username}</p>
              <p className="text-xs text-gray-400">{score} puntos</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopContributors;