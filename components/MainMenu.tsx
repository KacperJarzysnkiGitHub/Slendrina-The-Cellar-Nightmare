import React, { useState } from 'react';
import { TEXTURES } from '../constants';

interface MainMenuProps {
  onStart: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  const [showHelp, setShowHelp] = useState(false);

  const handleQuit = () => {
    // In a browser, we can't really "quit", so we just reload or show a message
    window.location.reload();
  };

  return (
    <div className="absolute inset-0 z-50 overflow-hidden bg-black font-horror text-red-600 select-none">
      
      {/* 3D CORRIDOR BACKGROUND */}
      <div className="absolute inset-0 flex items-center justify-center perspective-container">
         {/* Center Black Hole */}
         <div className="absolute z-10 w-[20%] h-[20%] bg-black shadow-[0_0_50px_50px_black]"></div>

         {/* Floor */}
         <div 
            className="absolute bottom-0 w-full h-[50%] bg-[#1a1a1a] origin-bottom"
            style={{
                transform: 'perspective(300px) rotateX(20deg) scale(2)',
                background: `linear-gradient(to top, rgba(0,0,0,0.8), #1a1a1a), url(${TEXTURES.WALL})`, // Reusing wall texture for grit
                backgroundSize: '100px 100px',
                filter: 'brightness(0.3)'
            }}
         ></div>

         {/* Ceiling */}
         <div 
            className="absolute top-0 w-full h-[50%] bg-[#111] origin-top"
            style={{
                transform: 'perspective(300px) rotateX(-20deg) scale(2)',
                background: `linear-gradient(to bottom, rgba(0,0,0,0.8), #111), url(${TEXTURES.WALL})`,
                backgroundSize: '100px 100px',
                filter: 'brightness(0.2)'
            }}
         ></div>

         {/* Left Wall */}
         <div 
            className="absolute left-0 top-0 bottom-0 w-[50%] origin-left"
            style={{
                transform: 'perspective(500px) rotateY(15deg)',
                background: `linear-gradient(to right, #000, transparent), url(${TEXTURES.WALL})`,
                backgroundSize: '200px 200px',
                filter: 'brightness(0.5) contrast(1.2)'
            }}
         ></div>

         {/* Right Wall */}
         <div 
            className="absolute right-0 top-0 bottom-0 w-[50%] origin-right"
            style={{
                transform: 'perspective(500px) rotateY(-15deg)',
                background: `linear-gradient(to left, #000, transparent), url(${TEXTURES.WALL})`,
                backgroundSize: '200px 200px',
                filter: 'brightness(0.5) contrast(1.2)'
            }}
         ></div>

         {/* Vignette */}
         <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,black_90%)] z-20 pointer-events-none"></div>
      </div>

      {/* SPOOKY FACE IN DARKNESS */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 opacity-60 scale-50 pointer-events-none">
          <div className="w-32 h-44 bg-gray-300 rounded-[50%_50%_45%_45%] shadow-[0_0_20px_rgba(255,255,255,0.1)] relative">
             {/* Eyes */}
             <div className="absolute top-12 left-5 w-8 h-6 bg-black rounded-full rotate-12">
                 <div className="absolute top-1 left-2 w-1 h-1 bg-red-600 rounded-full shadow-[0_0_5px_red]"></div>
             </div>
             <div className="absolute top-12 right-5 w-8 h-6 bg-black rounded-full -rotate-12">
                 <div className="absolute top-1 right-2 w-1 h-1 bg-red-600 rounded-full shadow-[0_0_5px_red]"></div>
             </div>
             {/* Mouth */}
             <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-20 bg-black rounded-[40%] border border-gray-800"></div>
          </div>
      </div>

      {/* LOGO */}
      <div className="absolute top-[10%] left-0 right-0 text-center z-30">
          <h1 className="text-7xl md:text-9xl text-red-600 font-bloody tracking-widest drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]" 
              style={{ textShadow: '0 0 10px rgba(150, 0, 0, 0.8), 2px 2px 0px black' }}>
            SLENDRINA
          </h1>
          <h2 className="text-3xl md:text-5xl text-gray-400 font-serif mt-2 tracking-[0.5em] opacity-80"
              style={{ textShadow: '2px 2px 5px black' }}>
            THE CELLAR
          </h2>
      </div>

      {/* MENU ITEMS */}
      <div className="absolute inset-0 z-40 pointer-events-none">
          
          {/* PLAY BUTTON (Left Wall) */}
          <button 
             onClick={onStart}
             className="absolute top-[55%] left-[10%] md:left-[15%] pointer-events-auto transform -rotate-6 hover:scale-110 transition-transform duration-200 group"
          >
             <span className="text-6xl md:text-8xl text-red-600 font-horror drop-shadow-[0_0_10px_black] group-hover:text-red-500 group-hover:drop-shadow-[0_0_20px_red]">
               PLAY
             </span>
          </button>

          {/* HELP BUTTON (Right Wall) */}
          <button 
             onClick={() => setShowHelp(true)}
             className="absolute top-[55%] right-[10%] md:right-[15%] pointer-events-auto transform rotate-6 hover:scale-110 transition-transform duration-200 group"
          >
             <span className="text-6xl md:text-8xl text-red-600 font-horror drop-shadow-[0_0_10px_black] group-hover:text-red-500 group-hover:drop-shadow-[0_0_20px_red]">
               HELP
             </span>
          </button>

          {/* QUIT BUTTON (Bottom Center) */}
          <button 
             onClick={handleQuit}
             className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 pointer-events-auto hover:scale-110 transition-transform duration-200 group"
          >
             <span className="text-5xl md:text-7xl text-red-800 font-horror drop-shadow-[0_0_10px_black] group-hover:text-red-600 group-hover:drop-shadow-[0_0_15px_red]">
               QUIT
             </span>
          </button>
      </div>

      {/* HELP OVERLAY */}
      {showHelp && (
        <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-8">
            <div className="max-w-2xl text-center border-2 border-red-900 p-8 rounded-lg bg-[#110000]">
                <h2 className="text-5xl text-red-600 mb-6 font-bloody">INSTRUCTIONS</h2>
                <ul className="text-2xl text-gray-300 space-y-4 font-serif text-left list-disc pl-10">
                    <li>Find 8 old books to break the curse.</li>
                    <li>Find keys to unlock doors.</li>
                    <li>Use <span className="text-yellow-500">WASD</span> to move and Mouse to look.</li>
                    <li>Click or press E to interact.</li>
                    <li><span className="text-red-500 font-bold">DO NOT LOOK AT HER</span> for too long.</li>
                    <li>If she screams, TURN AROUND immediately.</li>
                </ul>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="mt-10 px-8 py-2 border border-red-600 text-red-500 text-3xl hover:bg-red-900 hover:text-white transition"
                >
                  BACK
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;