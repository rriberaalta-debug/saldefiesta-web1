
import React from 'react';
import { User, UserStory } from '../types';

interface StoriesTrayProps {
  storiesByUser: UserStory[];
  users: User[];
  onStorySelect: (userId: string) => void;
  seenStories: Set<string>;
}

const StoryAvatar: React.FC<{
  user: User;
  hasUnseen: boolean;
  onClick: () => void;
}> = ({ user, hasUnseen, onClick }) => {
  const borderClass = hasUnseen
    ? 'bg-gradient-to-tr from-festive-orange to-vibrant-purple'
    : 'bg-gray-600';

  return (
    <div className="text-center flex-shrink-0" onClick={onClick}>
      <div className={`p-1 rounded-full ${borderClass} cursor-pointer`}>
        <div className="bg-gray-800 p-0.5 rounded-full">
          <img
            className="w-16 h-16 rounded-full object-cover"
            src={user.avatarUrl}
            alt={user.username}
          />
        </div>
      </div>
      <p className="text-xs mt-1 truncate w-20">{user.username}</p>
    </div>
  );
};

const StoriesTray: React.FC<StoriesTrayProps> = ({ storiesByUser, users, onStorySelect, seenStories }) => {
  if (storiesByUser.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-8 bg-black/10 backdrop-blur-sm p-4 rounded-xl">
      <div className="flex items-center space-x-4 overflow-x-auto pb-2 -mb-2">
        {storiesByUser.map(userStory => {
          const user = users.find(u => u.id === userStory.userId);
          if (!user) return null;

          const hasUnseenStories = userStory.stories.some(story => !seenStories.has(story.id));

          return (
            <StoryAvatar
              key={user.id}
              user={user}
              hasUnseen={hasUnseenStories}
              onClick={() => onStorySelect(user.id)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default StoriesTray;