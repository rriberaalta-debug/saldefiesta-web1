import React, { useState, useRef } from 'react';
import { User, Post } from '../types';
import { ArrowLeft, ShieldOff, UserCheck, Upload, Camera, Loader2 } from 'lucide-react';

interface ProfileProps {
  user: User;
  posts: Post[];
  onPostSelect: (postId: string) => void;
  onBack: () => void;
  currentUser: User | null;
  blockedUsers: Set<string>;
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
  onOpenUploadModal: () => void;
  onUpdateAvatar: (file: File) => Promise<void>;
}

const Profile: React.FC<ProfileProps> = ({ user, posts, onPostSelect, onBack, currentUser, blockedUsers, onBlockUser, onUnblockUser, onOpenUploadModal, onUpdateAvatar }) => {
  const isBlocked = blockedUsers.has(user.id);
  const isOwnProfile = currentUser?.id === user.id;
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit for avatars
        alert('El tamaño de la foto de perfil debe ser inferior a 5MB.');
        return;
      }
      setIsUploadingAvatar(true);
      await onUpdateAvatar(file);
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-black/20 p-6 rounded-2xl animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-white mb-6 hover:text-festive-orange">
        <ArrowLeft size={20} />
        <span>Volver al inicio</span>
      </button>

      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 mb-8">
        <div className="relative w-32 h-32 flex-shrink-0">
          <img src={user.avatarUrl} alt={user.username} className="w-32 h-32 rounded-full border-4 border-festive-orange object-cover" />
          {isOwnProfile && (
            <>
              <button
                onClick={handleAvatarChangeClick}
                className="absolute bottom-0 right-0 bg-sky-blue p-2 rounded-full text-white hover:bg-sky-blue-600 transition-colors"
                title="Cambiar foto de perfil"
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/png, image/jpeg"
                onChange={handleFileSelected}
              />
            </>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-4xl font-bold">{user.username}</h1>
          <p className="text-lg text-gray-300 mt-2">{posts.length} Publicaciones</p>
          {isOwnProfile && (
            <button
              onClick={onOpenUploadModal}
              className="mt-4 bg-festive-orange text-white font-bold py-2 px-6 rounded-full hover:bg-orange-600 transition-transform transform hover:scale-105 flex items-center gap-2"
            >
              <Upload size={20} />
              Subir Publicación
            </button>
          )}
        </div>
        {currentUser && !isOwnProfile && (
            isBlocked ? (
                <button
                    onClick={() => onUnblockUser(user.id)}
                    className="bg-sky-blue/80 text-white font-semibold py-2 px-4 rounded-full hover:bg-sky-blue transition-colors flex items-center gap-2"
                >
                    <UserCheck size={20} />
                    Desbloquear
                </button>
            ) : (
                <button
                    onClick={() => onBlockUser(user.id)}
                    className="bg-red-500/80 text-white font-semibold py-2 px-4 rounded-full hover:bg-red-500 transition-colors flex items-center gap-2"
                >
                    <ShieldOff size={20} />
                    Bloquear Usuario
                </button>
            )
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 border-b-2 border-festive-orange pb-2">Publicaciones</h2>
        {isBlocked ? (
          <div className="text-center py-10 bg-black/20 rounded-lg">
            <ShieldOff size={48} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-bold">Has bloqueado a {user.username}</h3>
            <p className="text-gray-400 mt-2">No puedes ver sus publicaciones.</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {posts.map(post => (
              <div 
                key={post.id} 
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => onPostSelect(post.id)}
              >
                <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                  <p className="text-white text-center font-semibold">{post.title}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Este usuario aún no ha publicado nada.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
