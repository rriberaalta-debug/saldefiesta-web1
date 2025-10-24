import React, { useState } from 'react';
import { X, User, AtSign, Send, MessageSquare } from 'lucide-react';

interface ContactModalProps {
  onClose: () => void;
  recipientEmail: string;
}

const ContactModal: React.FC<ContactModalProps> = ({ onClose, recipientEmail }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const maxChars = 500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Contacto desde SaldeFiesta - de ${name}`;
    const body = `Nombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`;
    
    // Abrir el cliente de correo del usuario
    window.location.href = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-sky-blue/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 w-full max-w-lg relative text-white shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-200 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Contacto</h2>
        <p className="text-center text-gray-100 mb-6 text-sm max-w-md mx-auto">
          Si tienes algún comentario o sugerencia (lo que te gusta, lo que se puede mejorar, algo que echas en falta...), escríbelo aquí y envíanoslo. Tendremos en cuenta todas vuestras opiniones para seguir mejorando.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
             <input type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-white/90 text-gray-800 placeholder-gray-500 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-festive-orange"/>
          </div>
          <div className="relative">
             <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-white/90 text-gray-800 placeholder-gray-500 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-festive-orange"/>
          </div>
          <div className="relative">
            <textarea 
              placeholder="Tu mensaje..." 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              maxLength={maxChars}
              required 
              rows={5} 
              className="w-full bg-white/90 text-gray-800 placeholder-gray-500 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-festive-orange resize-none"
            ></textarea>
            <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white/90 px-2 py-1 rounded">
              Quedan {maxChars - message.length} caracteres
            </div>
          </div>
          
          <button type="submit" className="w-full bg-festive-orange font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
            <Send size={18} />
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
