
import React, { useRef, useState, useEffect } from 'react';
import { Post, User } from '../types';
import { Heart, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface PostCardProps {
  post: Post;
  user: User;
  currentUser: User | null;
  onPostSelect: (postId: string) => void;
  onUserSelect: (userId:string) => void;
  onLike: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, user, currentUser, onPostSelect, onUserSelect, onLike }) => {
  const getPostDate = (timestamp: any): Date => {
    if (!timestamp) return new Date();
    if (timestamp.toDate) { // Firebase Timestamp object
      return timestamp.toDate();
    }
    return new Date(timestamp); // ISO string
  };
  
  const timeAgo = formatDistanceToNow(getPostDate(post.timestamp), { addSuffix: true, locale: es });
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const isLiked = post.likedBy?.includes(currentUser?.id ?? '');

  useEffect(() => {
    if (post.mediaType !== 'video' || !cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(error => {
            console.warn("La reproducción automática del vídeo falló:", error);
          });
        } else {
          videoRef.current?.pause();
        }
      },
      {
        threshold: 0.5, // Start playing when 50% of the card is visible
      }
    );

    const currentCardRef = cardRef.current;
    observer.observe(currentCardRef);

    return () => {
      if (currentCardRef) {
        observer.unobserve(currentCardRef);
      }
    };
  }, [post.mediaType]);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(post.id);
  };
  
  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUserSelect(user.id);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <div 
      ref={cardRef}
      className="bg-black/20 backdrop-blur-lg rounded-xl overflow-hidden shadow-lg cursor-pointer transition-transform transform hover:-translate-y-1 group flex flex-col"
      onClick={() => onPostSelect(post.id)}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
         {post.mediaType === 'video' ? (
           <>
            <video
              ref={videoRef}
              src={post.mediaUrl}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              playsInline
              loop
              muted={isMuted}
            />
            <button
              onClick={toggleMute}
              className="absolute bottom-2 right-2 bg-black/50 p-1.5 rounded-full text-white hover:bg-black/70 transition-opacity z-10"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
           </>
         ) : (
            <img src={post.mediaUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
         <div className="absolute bottom-0 left-0 p-4 w-full">
            <h3 className="font-bold text-lg truncate text-white drop-shadow-md">{post.title}</h3>
            <p className="text-gray-200 text-sm truncate drop-shadow-md">{post.city}</p>
         </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center mb-4" onClick={handleUserClick}>
          <img src={user?.avatarUrl || `https://picsum.photos/seed/${post.userId}/100/100`} alt={user?.username} className="w-10 h-10 rounded-full mr-3 border-2 border-festive-orange" />
          <div>
            <p className="font-semibold text-white hover:underline">{user?.username || 'Usuario'}</p>
            <p className="text-xs text-gray-300">{timeAgo}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-gray-300 mt-auto pt-2">
          <div className="flex gap-4">
             <button onClick={handleLikeClick} className={`flex items-center space-x-1.5 hover:text-white transition-colors ${isLiked ? 'text-red-500' : ''}`}>
                <Heart fill={isLiked ? 'currentColor' : 'none'} size={20} />
                <span className="text-sm font-medium">{post.likes} Me gusta</span>
             </button>
             <div className="flex items-center space-x-1.5">
                <MessageCircle size={20} />
                <span className="text-sm font-medium">{post.commentCount} Comentarios</span>
             </div>
          </div>
          <button onClick={() => onPostSelect(post.id)} className="text-sm font-semibold text-festive-orange hover:underline">
              Unirse a la charla
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;