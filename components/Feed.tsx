
import React, { useRef, useCallback } from 'react';
import { Post, User } from '../types';
import PostCard from './PostCard';
import LoadingSpinner from './LoadingSpinner';
import { FileQuestion } from 'lucide-react';

interface FeedProps {
  posts: Post[];
  users: User[];
  onPostSelect: (postId: string) => void;
  onUserSelect: (userId: string) => void;
  onLike: (postId: string) => void;
  loadMorePosts: () => void;
  hasMore: boolean;
  isSearchActive: boolean;
  currentUser: User | null;
}

const EmptyState: React.FC = () => (
  <div className="text-center py-20">
    <h2 className="text-2xl font-bold mb-2">¡Aún no hay publicaciones!</h2>
    <p className="text-gray-300">¡Sé el primero en compartir un recuerdo de una fiesta!</p>
  </div>
);

const NoResultsState: React.FC = () => (
  <div className="text-center py-20 flex flex-col items-center">
    <FileQuestion size={48} className="text-festive-orange mb-4" />
    <h2 className="text-2xl font-bold mb-2">No se encontraron resultados</h2>
    <p className="text-gray-300">Prueba con otra búsqueda o ajusta los filtros.</p>
  </div>
);


const Feed: React.FC<FeedProps> = ({ posts, users, onPostSelect, onUserSelect, onLike, loadMorePosts, hasMore, isSearchActive, currentUser }) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });
    if (node) observer.current.observe(node);
  }, [hasMore, loadMorePosts]);
  
  if (posts.length === 0) {
    return isSearchActive ? <NoResultsState /> : <EmptyState />;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => {
          const user = users.find(u => u.id === post.userId);
          if (!user) return null;

          const cardProps = {
            key: post.id,
            post,
            user,
            currentUser,
            onPostSelect,
            onUserSelect,
            onLike
          };

          if (posts.length === index + 1) {
             return <div ref={lastPostElementRef}><PostCard {...cardProps} /></div>;
          }
          return <PostCard {...cardProps} />;
        })}
      </div>
      {hasMore && (
        <div className="flex justify-center py-8">
            <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

export default Feed;
