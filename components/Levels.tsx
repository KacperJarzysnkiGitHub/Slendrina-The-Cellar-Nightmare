import React from 'react';
import { TEXTURES } from '../constants';

interface LevelsProps {
  onBack: () => void;
  onSelectLevel: (level: number) => void;
}

const Levels: React.FC<LevelsProps> = ({ onBack, onSelectLevel }) => {
  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center select-none overflow-hidden">
       {/* Background Ambience */}
       <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
             backgroundImage: `url(${TEXTURES.WALL})`,
             backgroundSize: '200px 200px',
             filter: 'brightness(0.2)'
          }}
       />
       
       {/* Title */}
       <h1 className="relative z-10 text-6xl md:text-8xl font-bloody text-red-600 mb-8 md:mb-12 tracking-widest drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]">
         LEVELS
       </h1>

       {/* Levels Container - Triangle Layout like reference */}
       <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center gap-8">
          
          {/* Cellar 1 - Top Center */}
          <div className="flex justify-center w-full">
             <button 
               onClick={() => onSelectLevel(1)}
               className="group relative w-72 h-44 md:w-96 md:h-56 border-4 border-gray-800 hover:border-red-600 transition-colors duration-300 overflow-hidden bg-black shadow-[0_0_20px_black]"
             >
                {/* Thumbnail Image Simulation */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                  style={{ backgroundImage: `url(${TEXTURES.WALL})`, filter: 'sepia(0.5) contrast(1.2)' }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-transparent transition-colors duration-300">
                   <span className="text-4xl text-red-100 font-horror tracking-wider drop-shadow-md group-hover:scale-110 transition-transform">CELLAR 1</span>
                </div>
             </button>
          </div>

          {/* Bottom Row - Cellar 2 and 3 */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-24 w-full justify-center">
              {/* Cellar 2 */}
             <button 
               onClick={() => onSelectLevel(2)}
               className="group relative w-72 h-44 md:w-80 md:h-48 border-4 border-gray-800 hover:border-red-600 transition-colors duration-300 overflow-hidden bg-black shadow-[0_0_20px_black]"
             >
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                  style={{ backgroundImage: `url(${TEXTURES.FLOOR})`, filter: 'hue-rotate(180deg) contrast(1.2) brightness(0.4)' }}
                />
                 <div className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-transparent transition-colors duration-300">
                   <span className="text-3xl text-red-100 font-horror tracking-wider drop-shadow-md group-hover:scale-110 transition-transform">CELLAR 2</span>
                </div>
             </button>

             {/* Cellar 3 */}
             <button 
               onClick={() => onSelectLevel(3)}
               className="group relative w-72 h-44 md:w-80 md:h-48 border-4 border-gray-800 hover:border-red-600 transition-colors duration-300 overflow-hidden bg-black shadow-[0_0_20px_black]"
             >
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                  style={{ backgroundImage: `url(${TEXTURES.CEILING})`, filter: 'grayscale(1) brightness(0.5) contrast(1.5)' }}
                />
                 <div className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-transparent transition-colors duration-300">
                   <span className="text-3xl text-red-100 font-horror tracking-wider drop-shadow-md group-hover:scale-110 transition-transform">CELLAR 3</span>
                </div>
             </button>
          </div>
       </div>

       {/* Back Button */}
       <button 
         onClick={onBack}
         className="absolute bottom-10 right-10 text-4xl text-red-800 font-horror hover:text-red-500 hover:scale-110 transition-all duration-300 z-20 drop-shadow-lg"
       >
         BACK
       </button>
    </div>
  );
};

export default Levels;