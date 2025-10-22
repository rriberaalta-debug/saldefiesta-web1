
import React, { useState } from 'react';
import { Post } from '../types';
import { X, Copy, Check } from 'lucide-react';

interface ShareModalProps {
  post: Post;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ post, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  // In a real app, this would be the public URL of the post
  const postUrl = `${window.location.origin}/post/${post.id}`;
  const shareText = `¡Mira esta publicación de ${post.title} en SaldeFiesta!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + postUrl)}`,
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 w-full max-w-md relative text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Compartir Publicación</h2>
        
        <div className="space-y-4">
          <div className="flex items-center bg-gray-700/50 rounded-lg p-2">
            <input 
              type="text" 
              readOnly 
              value={postUrl} 
              className="bg-transparent text-gray-300 text-sm flex-grow focus:outline-none"
            />
            <button 
              onClick={handleCopyLink} 
              className="bg-festive-orange text-white font-semibold py-2 px-3 rounded-md hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              {isCopied ? <Check size={18} /> : <Copy size={18} />}
              {isCopied ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-600" />
            <span className="mx-4 text-gray-400 text-sm">O COMPARTE EN</span>
            <hr className="flex-grow border-gray-600" />
          </div>

          <div className="flex justify-center gap-4">
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] p-3 rounded-lg transition-colors font-bold">
              Facebook
            </a>
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#1a91da] p-3 rounded-lg transition-colors font-bold">
              X
            </a>
             <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe59] p-3 rounded-lg transition-colors font-bold">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;