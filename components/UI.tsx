import React, { useState, useEffect } from 'react';
import { GameState, Difficulty } from '../types';
import MainMenu from './MainMenu';
import GameOver from './GameOver';
import Levels from './Levels';
import DifficultySelect from './Difficulty';
import { SOUNDS } from '../constants';

interface UIProps {
  gameState: GameState;
  books: number;
  keys: number;
  health: number;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
  onSelectLevel?: (level: number) => void;
  onSelectDifficulty?: (diff: Difficulty) => void;
  onBackToMenu?: () => void;
  onBackToLevels?: () => void;
}

const UI: React.FC<UIProps> = ({ 
  gameState, 
  books, 
  keys, 
  health, 
  onStart, 
  onResume, 
  onRestart,
  onSelectLevel,
  onSelectDifficulty,
  onBackToMenu,
  onBackToLevels
}) => {
  const [inSettings, setInSettings] = useState(false);
  
  const playClick = () => {
    const audio = new Audio(SOUNDS.CLICK);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  // Reset settings view when menu is closed
  useEffect(() => {
    if (gameState !== GameState.PAUSED) {
      setInSettings(false);
    }
  }, [gameState]);

  // Auto-restart after Game Over
  useEffect(() => {
    if (gameState === GameState.GAME_OVER) {
        const timer = setTimeout(() => {
            onRestart();
        }, 5000);
        return () => clearTimeout(timer);
    }
  }, [gameState, onRestart]);

  // Handle Ending Sequence Timer
  useEffect(() => {
    if (gameState === GameState.ENDING) {
        // Wait 4.5 seconds (scream animation) then go to menu
        const timer = setTimeout(() => {
            onRestart();
        }, 4500);
        return () => clearTimeout(timer);
    }
  }, [gameState, onRestart]);

  // Blood Overlay (screen reddening)
  const bloodOpacity = (100 - health) / 100;
  
  const handleResumeClick = () => {
    playClick();
    const canvas = document.querySelector('canvas');
    if (canvas) {
        try {
            const promise = canvas.requestPointerLock() as unknown as Promise<void> | undefined;
            if (promise && typeof promise.catch === 'function') {
                promise.catch(() => {});
            }
        } catch (e) {}
    }
    onResume();
  };

  const handleSettingsClick = () => {
    playClick();
    setInSettings(true);
  };

  const handleMainMenuClick = () => {
    playClick();
    onRestart();
  };

  const handleBackFromSettings = () => {
    playClick();
    setInSettings(false);
  };

  const getHealthColor = (hp: number) => {
      // 120 is Green, 0 is Red
      const hue = Math.max(0, Math.min(120, hp * 1.2));
      return `hsl(${hue}, 100%, 40%)`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {/* Heavy Vignette (Flashlight effect) */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.95) 100%)'
        }}
      />

      {/* Blood Effect - Only when playing, otherwise it obscures the Jumpscare */}
      {gameState !== GameState.GAME_OVER && gameState !== GameState.MENU && gameState !== GameState.LEVEL_SELECT && gameState !== GameState.DIFFICULTY_SELECT && gameState !== GameState.ENDING && (
        <div 
          className="absolute inset-0 z-10 transition-opacity duration-100 ease-in-out"
          style={{
              background: `radial-gradient(circle, transparent 50%, rgba(180,0,0,0.8) 100%)`,
              opacity: bloodOpacity * 0.8, // Slightly reduced so health bar is visible
              boxShadow: `inset 0 0 ${bloodOpacity * 100}px rgba(100,0,0,0.9)`
          }}
        />
      )}

      {/* HUD */}
      {gameState === GameState.PLAYING && (
        <div className="absolute inset-0 z-20">
          {/* Top Center Books - Handwriting Font */}
          <div className="absolute top-4 left-0 right-0 flex justify-center">
             <span className="text-4xl text-gray-200" style={{fontFamily: 'serif', textShadow: '2px 2px 4px black'}}>
                Books &nbsp; {books} / 8
             </span>
          </div>

          {/* Top Right Keys */}
          {keys > 0 && (
            <div className="absolute top-4 right-8">
               <span className="text-4xl text-yellow-500" style={{fontFamily: 'serif', textShadow: '2px 2px 4px black'}}>
                  {/* Simple Key Icon */}
                  <span className="text-5xl">🗝️</span> {keys}
               </span>
            </div>
          )}

          {/* Settings Icon */}
          <div className="absolute top-4 left-4">
             <span className="text-4xl text-gray-400">⚙️</span>
          </div>

          {/* HEALTH BAR (Left Side) */}
          <div className="absolute top-20 left-4 w-48 flex flex-col gap-1">
             <div className="flex justify-between items-end px-1">
                <span className="text-gray-300 font-serif text-lg tracking-widest drop-shadow-md">HEALTH</span>
                <span className="text-gray-400 font-serif text-sm">{Math.ceil(health)}%</span>
             </div>
             <div className="w-full h-4 bg-gray-900/90 border border-gray-600 rounded-sm overflow-hidden backdrop-blur-sm relative">
                {/* Background Stripe Pattern */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 10px)' }}></div>
                
                {/* Fill */}
                <div 
                   className="h-full transition-all duration-300 ease-out relative"
                   style={{ 
                       width: `${Math.max(0, health)}%`, 
                       backgroundColor: getHealthColor(health),
                       boxShadow: `0 0 15px ${getHealthColor(health)}`
                   }}
                >
                    {/* Gloss Effect */}
                    <div className="absolute top-0 left-0 right-0 h-[50%] bg-white/20"></div>
                </div>
             </div>
          </div>

          {/* Hint for Controls */}
          <div className="absolute bottom-4 left-0 right-0 text-center text-gray-500 text-sm opacity-50">
             WASD to Move &middot; Mouse to Look &middot; Esc to Pause
          </div>
        </div>
      )}

      {/* PAUSE MENU */}
      {gameState === GameState.PAUSED && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white pointer-events-auto">
          <h2 className="text-5xl font-serif text-gray-300 mb-10 tracking-widest border-b border-gray-600 pb-2">
            {inSettings ? 'SETTINGS' : 'PAUSED'}
          </h2>
          
          {!inSettings ? (
            <div className="flex flex-col space-y-4 w-64">
              <button 
                onClick={handleResumeClick}
                className="px-6 py-3 bg-transparent border border-gray-500 hover:bg-white/10 text-white font-serif text-xl transition"
              >
                RESUME
              </button>
              <button 
                onClick={handleSettingsClick}
                className="px-6 py-3 bg-transparent border border-gray-500 hover:bg-white/10 text-white font-serif text-xl transition"
              >
                SETTINGS
              </button>
              <button 
                onClick={handleMainMenuClick}
                className="px-6 py-3 bg-transparent border border-red-900 hover:bg-red-900/30 text-red-200 font-serif text-xl transition"
              >
                MAIN MENU
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-6 w-80">
              {/* Fake Settings for Visuals */}
              <div className="flex flex-col space-y-2">
                <label className="text-gray-400 font-serif text-lg">Mouse Sensitivity</label>
                <input type="range" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
              </div>
              <div className="flex flex-col space-y-2">
                 <label className="text-gray-400 font-serif text-lg">Volume</label>
                 <input type="range" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
              </div>
              
              <button 
                onClick={handleBackFromSettings}
                className="mt-8 px-6 py-3 bg-transparent border border-gray-500 hover:bg-white/10 text-white font-serif text-xl transition"
              >
                BACK
              </button>
            </div>
          )}
        </div>
      )}

      {/* MAIN MENU */}
      {gameState === GameState.MENU && (
        <div className="absolute inset-0 z-50 pointer-events-auto">
          <MainMenu onStart={onStart} />
        </div>
      )}

      {/* LEVEL SELECTION */}
      {gameState === GameState.LEVEL_SELECT && onSelectLevel && onBackToMenu && (
        <div className="absolute inset-0 z-50 pointer-events-auto">
          <Levels onSelectLevel={onSelectLevel} onBack={onBackToMenu} />
        </div>
      )}

      {/* DIFFICULTY SELECTION */}
      {gameState === GameState.DIFFICULTY_SELECT && onSelectDifficulty && onBackToLevels && (
        <div className="absolute inset-0 z-50 pointer-events-auto">
          <DifficultySelect onSelectDifficulty={onSelectDifficulty} onBack={onBackToLevels} />
        </div>
      )}

      {/* GAME OVER */}
      {gameState === GameState.GAME_OVER && (
        <GameOver books={books} />
      )}

      {/* ENDING SEQUENCE */}
      {gameState === GameState.ENDING && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-center animate-pulse">
            <h1 
              className="text-4xl md:text-6xl text-red-600 font-horror tracking-wider font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,1)]"
              style={{
                  textShadow: '0 0 10px red'
              }}
            >
              Congratulations!
            </h1>
            <p className="text-2xl md:text-4xl text-red-400 font-serif mt-4">
               You managed to find all the missing books.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UI;