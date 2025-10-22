
import React, { useState, useEffect } from 'react';
import { heroImages } from '../constants';

interface HeroSectionProps {
  onSignUpClick: () => void;
  onScrollToFeed: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSignUpClick, onScrollToFeed }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[50vh] -mx-4 flex items-center justify-center text-center text-white overflow-hidden mb-8 rounded-2xl">
      {heroImages.map((src, index) => (
        <img
          key={src}
          src={src}
          alt="Fiesta background"
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 p-4">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
          Sube tu Fiesta. Comenta la de Otros.
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-200 mb-8 drop-shadow-md">
          Únete a la mayor comunidad de fiesteros. Comparte tus momentos y descubre celebraciones por toda España.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onSignUpClick}
            className="w-full sm:w-auto bg-festive-orange text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-orange-600 transition-transform transform hover:scale-105 shadow-lg"
          >
            Subir mi Contenido
          </button>
          <button
            onClick={onScrollToFeed}
            className="w-full sm:w-auto bg-white/20 backdrop-blur-md text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-white/30 transition-transform transform hover:scale-105"
          >
            Ver lo Más Reciente
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;