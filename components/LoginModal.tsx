import React, { useState } from 'react';
import { X, AtSign, Lock } from 'lucide-react';
import { Credentials } from '../types';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (credentials: Credentials) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  onSwitchToSignUp: () => void;
}

const SocialButton: React.FC<{ provider: string; icon: React.ReactNode, onClick: () => void }> = ({ provider, icon, onClick }) => (
    <button onClick={onClick} className="flex-1 flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-700 p-3 rounded-lg transition-colors">
        {icon}
        <span>{provider}</span>
    </button>
);

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin, onGoogleSignIn, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 w-full max-w-md relative text-white shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Bienvenido de Nuevo</h2>
        <p className="text-center text-gray-400 mb-6">Inicia sesión para continuar la fiesta.</p>

        <div className="flex gap-4 mb-6">
            <SocialButton 
              provider="Google" 
              onClick={onGoogleSignIn}
              icon={<svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.904,36.213,44,30.836,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>} 
            />
        </div>
        
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-600" />
          <span className="mx-4 text-gray-400 text-sm">O INICIA SESIÓN CON EMAIL</span>
          <hr className="flex-grow border-gray-600" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-festive-orange"/>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-festive-orange"/>
          </div>
          
          <button type="submit" className="w-full bg-festive-orange font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors">
            Iniciar Sesión
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿No tienes una cuenta?{' '}
          <button onClick={onSwitchToSignUp} className="font-semibold text-festive-orange hover:underline">
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;