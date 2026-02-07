import React from 'react';
import { Difficulty } from '../types';
import { TEXTURES, SOUNDS } from '../constants';

interface DifficultyProps {
  onSelectDifficulty: (diff: Difficulty) => void;
  onBack: () => void;
}

const DifficultySelect: React.FC<DifficultyProps> = ({ onSelectDifficulty, onBack }) => {

  const playClick = () => {
    const audio = new Audio(SOUNDS.CLICK);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const handleSelect = (diff: Difficulty) => {
    playClick();
    onSelectDifficulty(diff);
  };

  const handleBack = () => {
    playClick();
    onBack();
  };

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Background Ambience similar to Levels but darker/focused */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
            backgroundImage: `radial-gradient(circle at center, transparent 0%, #000 90%), url(${TEXTURES.WALL})`,
            backgroundSize: '200px 200px',
            filter: 'brightness(0.15) contrast(1.5)'
        }}
      />

      {/* Shelves simulation using CSS borders/divs to mimic the reference image vibe roughly */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-[30%] left-0 w-1/3 h-2 bg-[#3e2723] shadow-lg transform -skew-y-6"></div>
          <div className="absolute top-[50%] left-0 w-1/3 h-2 bg-[#3e2723] shadow-lg transform -skew-y-6"></div>
          <div className="absolute top-[70%] left-0 w-1/3 h-2 bg-[#3e2723] shadow-lg transform -skew-y-6"></div>
      </div>

      <h1 className="relative z-10 text-6xl md:text-8xl font-bloody text-red-600 mb-16 tracking-widest drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]">
        DIFFICULTY
      </h1>

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md">
        <button 
          onClick={() => handleSelect(Difficulty.EASY)}
          className="group w-full text-center transition-transform hover:scale-110 duration-200"
        >
           <span className="text-5xl md:text-6xl text-red-600 font-horror tracking-wider drop-shadow-md group-hover:text-red-400 group-hover:drop-shadow-[0_0_10px_red]">
             EASY
           </span>
        </button>

        <button 
          onClick={() => handleSelect(Difficulty.MEDIUM)}
          className="group w-full text-center transition-transform hover:scale-110 duration-200"
        >
           <span className="text-5xl md:text-6xl text-red-600 font-horror tracking-wider drop-shadow-md group-hover:text-red-400 group-hover:drop-shadow-[0_0_10px_red]">
             MEDIUM
           </span>
        </button>

        <button 
          onClick={() => handleSelect(Difficulty.HARD)}
          className="group w-full text-center transition-transform hover:scale-110 duration-200"
        >
           <span className="text-5xl md:text-6xl text-red-600 font-horror tracking-wider drop-shadow-md group-hover:text-red-400 group-hover:drop-shadow-[0_0_10px_red]">
             HARD
           </span>
        </button>
      </div>

      <button 
        onClick={handleBack}
        className="absolute bottom-10 right-10 text-4xl text-red-800 font-horror hover:text-red-500 hover:scale-110 transition-all duration-300 z-20 drop-shadow-lg"
      >
        BACK
      </button>
    </div>
  );
};

export default DifficultySelect;