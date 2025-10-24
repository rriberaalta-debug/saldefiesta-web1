import React, { useState } from 'react';
import { Post, User, Comment as CommentType } from '../types';
import { X, Heart, MessageCircle, Send, ShieldOff, Share2, Trash2, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ShareModal from './ShareModal';

interface PostDetailProps {
  post: Post;
  user: User;
  comments: CommentType[];
  users: User[];
  onClose: () => void;
  onLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onUserSelect: (userId: string) => void;
  currentUser: User | null;
  onBlockUser: (userId: string) => void;
  onDeletePost: (postId: string) => void;
  isOwner: boolean;
  isAdmin: boolean;
}

const Comment: React.FC<{ 
  comment: CommentType; 
  user?: User, 
  onUserSelect: (userId: string) => void;
  currentUser: User | null;
  onBlockUser: (userId: string) => void;
}> = ({ comment, user, onUserSelect, currentUser, onBlockUser }) => (
    <div className="flex items-start space-x-3 py-3 border-b border-white/10 group">
      <div className="cursor-pointer" onClick={() => onUserSelect(user?.id || '')}>
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.username} className="w-9 h-9 rounded-full object-cover"/>
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center">
            <UserIcon className="text-gray-400" size={18} />
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-sm cursor-pointer hover:underline" onClick={() => onUserSelect(user?.id || '')}>{user?.username}</span>
          <span className="text-xs text-gray-400">{format(new Date(comment.timestamp), "d MMM, yyyy", { locale: es })}</span>
        </div>
        <p className="text-gray-200 text-sm">{comment.text}</p>
      </div>
      {currentUser && currentUser.id !== comment.userId && (
        <button 
          onClick={() => onBlockUser(comment.userId)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
          title={`Bloquear a ${user?.username}`}
        >
          <ShieldOff size={16} />
        </button>
      )}
    </div>
);

const PostDetail: React.FC<PostDetailProps> = ({ post, user, comments, users, onClose, onLike, onAddComment, onUserSelect, currentUser, onBlockUser, onDeletePost, isOwner, isAdmin }) => {
    const [newComment, setNewComment] = useState('');
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const isLiked = post.likedBy?.includes(currentUser?.id ?? '');

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddComment(post.id, newComment);
            setNewComment('');
        }
    };
    
    const getPostDate = (timestamp: any): Date => {
        if (!timestamp) return new Date();
        if (timestamp.toDate) { // Firebase Timestamp object
          return timestamp.toDate();
        }
        return new Date(timestamp); // ISO string
    };

    const handleDeleteClick = () => {
      onDeletePost(post.id);
    };

    return (
        <>
            <div className="bg-black/50 backdrop-blur-lg p-4 sm:p-6 rounded-2xl max-w-4xl mx-auto animate-fade-in">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-1/2">
                        <div className="relative aspect-square sm:aspect-video lg:aspect-square rounded-lg overflow-hidden">
                            <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover"/>
                            <button onClick={onClose} className="absolute top-3 right-3 bg-black/50 p-2 rounded-full text-white hover:bg-black/70">
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                    <div className="lg:w-1/2 flex flex-col">
                        <div className="flex items-start justify-between mb-4 gap-4">
                            <div className="flex items-center cursor-pointer" onClick={() => onUserSelect(user.id)}>
                              {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.username} className="w-12 h-12 rounded-full mr-4 border-2 border-festive-orange object-cover"/>
                              ) : (
                                <div className="w-12 h-12 rounded-full mr-4 border-2 border-festive-orange bg-gray-700 flex items-center justify-center">
                                  <UserIcon className="text-gray-400" size={24} />
                                </div>
                              )}
                                <div>
                                    <p className="font-bold text-lg hover:underline">{user.username}</p>
                                    <p className="text-sm text-gray-300">{format(getPostDate(post.timestamp), "d 'de' MMMM, yyyy 'a las' H:mm", { locale: es })}</p>
                                </div>
                            </div>
                             {(isOwner || isAdmin) && (
                                <button
                                    onClick={handleDeleteClick}
                                    type="button"
                                    className="bg-red-600 text-white font-bold py-2 px-4 rounded-full hover:bg-red-700 transition-colors flex-shrink-0 flex items-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    <span>Eliminar</span>
                                </button>
                            )}
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                            <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                            <p className="text-gray-300 mb-4">{post.description}</p>
                            <p className="font-semibold text-festive-orange mb-4">{post.city}</p>
                            <div className="flex items-center space-x-6 mb-4 text-gray-300">
                               <button onClick={() => onLike(post.id)} className={`flex items-center space-x-2 hover:text-white transition-colors ${isLiked ? 'text-red-500' : ''}`}>
                                 <Heart fill={isLiked ? 'currentColor' : 'none'} size={24} />
                                 <span>{post.likes}</span>
                               </button>
                               <div className="flex items-center space-x-2">
                                 <MessageCircle size={24} />
                                 <span>{post.commentCount}</span>
                               </div>
                               <button onClick={() => setShareModalOpen(true)} className="flex items-center space-x-2 hover:text-white transition-colors">
                                 <Share2 size={24} />
                                 <span>Compartir</span>
                               </button>
                            </div>

                            <div className="space-y-2">
                              {comments.length > 0 ? comments.map(comment => (
                                <Comment 
                                  key={comment.id} 
                                  comment={comment} 
                                  user={users.find(u => u.id === comment.userId)} 
                                  onUserSelect={onUserSelect}
                                  currentUser={currentUser}
                                  onBlockUser={onBlockUser}
                                />
                              )) : <p className="text-gray-400 text-sm py-4">Aún no hay comentarios. ¡Sé el primero en comentar!</p>}
                            </div>
                        </div>
                        {currentUser ? (
                          <form onSubmit={handleSubmitComment} className="mt-auto pt-4 flex items-center gap-2">
                              <input
                                  type="text"
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  placeholder="Añade un comentario..."
                                  className="w-full bg-white/10 placeholder-gray-400 text-white rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-festive-orange"
                              />
                              <button type="submit" className="bg-festive-orange text-white p-2.5 rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50" disabled={!newComment.trim()}>
                                  <Send size={20}/>
                              </button>
                          </form>
                        ) : (
                          <div className="mt-auto pt-4 text-center text-gray-400">
                            <p>Inicia sesión para dejar un comentario.</p>
                          </div>
                        )}
                    </div>
                </div>
            </div>
            {isShareModalOpen && (
                <ShareModal post={post} onClose={() => setShareModalOpen(false)} />
            )}
        </>
    );
};

export default PostDetail;