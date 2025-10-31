
import React from 'react';
import { X, Users } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 w-full max-w-2xl relative text-white shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <div className="text-center">
            <Users className="mx-auto text-sky-blue mb-4" size={48} />
            <h2 className="text-3xl font-bold mb-4">Quiénes Somos</h2>
        </div>
        
        <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white mx-auto text-left max-w-none">
            <h4>SaldeFiesta: La plataforma que da vida a tus tradiciones y eventos locales.</h4>
            <p>
              En un mundo digital saturado, SaldeFiesta emerge como la plataforma social y de descubrimiento diseñada específicamente para revalorizar nuestras raíces y celebraciones. Olvídate de buscar información fragmentada sobre las fiestas patronales, eventos culturales, conciertos y ferias de tu entorno. Nosotros centralizamos la agenda festiva, haciéndola accesible y viva.
            </p>

            <h3>Las Funcionalidades Clave (La Utilidad para el Usuario)</h3>
            <p>
              SaldeFiesta no es solo un calendario, es una comunidad. Nuestra utilidad reside en la capacidad de conectar al usuario de forma activa:
            </p>
            <ul>
              <li><strong>Descubrimiento Preciso:</strong> Utiliza nuestro avanzado buscador para filtrar eventos y fiestas por municipio o fecha específica, asegurando que nunca te pierdas un acontecimiento relevante en tu zona.</li>
              <li><strong>Memoria Compartida:</strong> El evento no termina cuando acaba la fiesta. Los usuarios pueden subir fotos, vídeos y comentarios de sus experiencias. Transforma tu vivencia en contenido, consulta el de otros y revive los mejores momentos.</li>
              <li><strong>Interacción Social:</strong> Comenta, reacciona y dialoga con la comunidad en torno a cada celebración, convirtiendo cada ficha de evento en un foro de experiencias compartidas.</li>
            </ul>

            <h3>La Conclusión (El Llamamiento a la Acción)</h3>
            <p>
              Desde la romería más tradicional hasta el último festival cultural, SaldeFiesta es el punto de encuentro digital de la tradición. Regístrate, explora el alma festiva de tu municipio y forma parte de la historia de cada evento. ¡Sal de Fiesta, y compártela!
            </p>
        </div>

        <div className="mt-8 text-center">
          <button onClick={onClose} className="bg-festive-orange text-white font-bold py-2 px-6 rounded-full hover:bg-orange-600 transition-colors">
            ¡A Festejar!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;