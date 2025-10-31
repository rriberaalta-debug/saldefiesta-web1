import React from 'react';
import { LegalContentType } from '../types';

interface FooterProps {
  onLegalLinkClick: (type: LegalContentType) => void;
  onContactClick: () => void;
  onAboutClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onLegalLinkClick, onContactClick, onAboutClick }) => {
  return (
    <footer className="bg-black/20 backdrop-blur-md mt-12 py-6 border-t border-white/10">
      <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
        <div className="flex justify-center flex-wrap gap-4 sm:gap-6 mb-4">
          <button onClick={() => onLegalLinkClick('Aviso Legal')} className="hover:text-white hover:underline transition-colors">Aviso Legal</button>
          <button onClick={() => onLegalLinkClick('Política de Privacidad')} className="hover:text-white hover:underline transition-colors">Política de Privacidad</button>
          <button onClick={() => onLegalLinkClick('Política de Cookies')} className="hover:text-white hover:underline transition-colors">Política de Cookies</button>
          <button onClick={onAboutClick} className="hover:text-white hover:underline transition-colors">Quiénes Somos</button>
          <button onClick={onContactClick} className="hover:text-white hover:underline transition-colors">Contacto</button>
        </div>
        <p>&copy; {new Date().getFullYear()} SaldeFiesta. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
