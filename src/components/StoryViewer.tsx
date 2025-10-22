
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, UserStory, Story } from '../types';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface StoryViewerProps {
  storiesByUser: UserStory[];
  users: User[];
  initialUserIndex: number;
  onClose: () => void;
  onStorySeen: (storyId: string) => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ storiesByUser, users, initialUserIndex, onClose, onStorySeen }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number | null>(null);

  const currentUserStories = storiesByUser[currentUserIndex];
  const currentStory = currentUserStories.stories[currentStoryIndex];
  const user = users.find(u => u.id === currentUserStories.userId);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  
  const goToNextStory = useCallback(() => {
    clearTimer();
    if (currentStoryIndex < currentUserStories.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
       if (currentUserIndex < storiesByUser.length - 1) {
         setCurrentUserIndex(prev => prev + 1);
         setCurrentStoryIndex(0);
       } else {
         onClose();
       }
    }
  }, [currentStoryIndex, currentUserIndex, currentUserStories.stories.length, storiesByUser.length, onClose]);
  
  const goToPrevStory = () => {
    clearTimer();
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else {
       if (currentUserIndex > 0) {
         setCurrentUserIndex(prev => prev - 1);
         // Go to the last story of the previous user
         setCurrentStoryIndex(storiesByUser[currentUserIndex - 1].stories.length - 1);
       }
    }
  };

  const goToNextUser = () => {
    if (currentUserIndex < storiesByUser.length - 1) {
      clearTimer();
      setCurrentUserIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
    }
  };
  
  const goToPrevUser = () => {
    if (currentUserIndex > 0) {
      clearTimer();
      setCurrentUserIndex(prev => prev - 1);
      setCurrentStoryIndex(0);
    }
  };

  useEffect(() => {
    onStorySeen(currentStory.id);
    
    if (currentStory.mediaType === 'image') {
      timerRef.current = window.setTimeout(goToNextStory, (currentStory.duration || 5) * 1000);
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(e => console.error("Error playing video:", e));
    }
    
    return () => clearTimer();
  }, [currentStory, onStorySeen, goToNextStory]);


  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center animate-fade-in">
      <div className="relative w-full h-full max-w-md max-h-screen-md aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-2xl">
        {/* Progress Bars */}
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
          {currentUserStories.stories.map((story, index) => (
            <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
               <div
                className="h-full bg-white transition-all duration-300"
                style={{
                  width: index < currentStoryIndex ? '100%' : index === currentStoryIndex ? '100%' : '0%',
                  transitionDuration: index === currentStoryIndex && currentStory.mediaType === 'image' ? `${currentStory.duration || 5}s` : '0s',
                  transitionTimingFunction: 'linear'
                }}
              />
            </div>
          ))}
        </div>
        
        {/* User Info & Close Button */}
        <div className="absolute top-6 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full"/>
            <div>
              <p className="font-bold text-white">{user.username}</p>
              <p className="text-xs text-gray-300">{formatDistanceToNow(new Date(currentStory.timestamp), { locale: es, addSuffix: true })}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white bg-black/30 p-2 rounded-full"><X/></button>
        </div>
        
        {/* Media */}
        <div className="absolute inset-0">
          {currentStory.mediaType === 'image' ? (
            <img src={currentStory.mediaUrl} alt="Story" className="w-full h-full object-cover" />
          ) : (
            <video 
              ref={videoRef}
              src={currentStory.mediaUrl} 
              className="w-full h-full object-cover"
              muted={isMuted}
              onEnded={goToNextStory}
              playsInline
            />
          )}
        </div>

        {/* Navigation */}
        <div className="absolute inset-0 flex z-10">
          <div className="w-1/3 h-full" onClick={goToPrevStory}></div>
          <div className="w-2/3 h-full" onClick={goToNextStory}></div>
        </div>

        {/* Mute/Unmute for videos */}
        {currentStory.mediaType === 'video' && (
          <button onClick={() => setIsMuted(!isMuted)} className="absolute bottom-4 right-4 text-white bg-black/30 p-2 rounded-full z-20">
            {isMuted ? <VolumeX/> : <Volume2/>}
          </button>
        )}

      </div>
       {/* Prev/Next User Buttons */}
      <button onClick={goToPrevUser} disabled={currentUserIndex === 0} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full z-30 disabled:opacity-30 hidden md:block">
        <ChevronLeft size={32}/>
      </button>
      <button onClick={goToNextUser} disabled={currentUserIndex >= storiesByUser.length - 1} className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full z-30 disabled:opacity-30 hidden md:block">
        <ChevronRight size={32}/>
      </button>
    </div>
  );
};

export default StoryViewer;