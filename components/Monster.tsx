import React, { useEffect, useState } from 'react';
import { GameState } from '../types';

interface MonsterProps {
  gameState: GameState;
}

const Monster: React.FC<MonsterProps> = ({ gameState }) => {
  const [jolt, setJolt] = useState({ x: 0, y: 0, scale: 0.5, opacity: 0 });

  useEffect(() => {
    if (gameState !== GameState.GAME_OVER) {
        setJolt({ x: 0, y: 0, scale: 0.5, opacity: 0 });
        return;
    }

    // Jumpscare Animation on Death
    let frameId: number;
    let time = 0;
    
    // Initial lunge - Big and Fast
    setJolt(prev => ({ ...prev, scale: 2.5, opacity: 1 }));

    const animate = () => {
        time += 0.2;
        // Violent shaking with random spikes
        setJolt(prev => ({
            x: (Math.random() - 0.5) * 60,
            y: (Math.random() - 0.5) * 60,
            scale: 2.0 + Math.sin(time * 20) * 0.2, // Pulse size rapidly
            opacity: 1
        }));
        frameId = requestAnimationFrame(animate);
    };
    
    // Slight delay to sync with screen fade
    const timeout = setTimeout(animate, 20);
    return () => {
        clearTimeout(timeout);
        cancelAnimationFrame(frameId);
    };
  }, [gameState]);

  if (gameState !== GameState.GAME_OVER) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black overflow-hidden pointer-events-none">
      
      {/* Background Darkness */}
      <div className="absolute inset-0 bg-[#020202] z-0"></div>
      
      {/* Monster Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center transition-transform duration-50 z-10 ease-out"
        style={{ 
            transform: `translate(${jolt.x}px, ${jolt.y}px) scale(${jolt.scale})`,
            opacity: jolt.opacity 
        }}
      >
        {/* The Monster Face - Horror Style (DVloper style: Pale, White Eyes, No Pupils) */}
        <div className="relative w-[600px] h-[800px] flex flex-col items-center filter contrast-125 brightness-110">
            
            {/* Hair Back */}
            <div className="absolute top-[0px] w-[500px] h-[900px] bg-[#000] rounded-t-[100px] blur-sm z-0"></div>

            {/* Face Base - Dead Pale */}
            <div className="absolute top-[100px] w-[320px] h-[450px] bg-[#e0e0e0] rounded-[100px_100px_120px_120px] z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.6)]"></div>

            {/* Hair Strands (Messy) */}
            <div className="absolute top-[50px] left-[80px] w-[120px] h-[800px] bg-black z-30 -rotate-3 skew-x-6"></div>
            <div className="absolute top-[50px] right-[80px] w-[120px] h-[800px] bg-black z-30 rotate-3 -skew-x-6"></div>
            <div className="absolute top-[80px] w-[350px] h-[100px] bg-black z-30 rounded-[50%] blur-[2px]"></div>

            {/* EYES - SOLID WHITE (No Pupils) */}
            <div className="absolute top-[220px] w-full flex justify-center gap-16 z-20">
                {/* Left Eye */}
                <div className="relative w-[70px] h-[55px] bg-white rounded-[50%] overflow-hidden shadow-[0_0_15px_white]">
                    <div className="absolute top-0 w-full h-full shadow-[inset_0_0_8px_rgba(0,0,0,0.5)]"></div>
                </div>
                {/* Right Eye */}
                <div className="relative w-[70px] h-[55px] bg-white rounded-[50%] overflow-hidden shadow-[0_0_15px_white]">
                    <div className="absolute top-0 w-full h-full shadow-[inset_0_0_8px_rgba(0,0,0,0.5)]"></div>
                </div>
            </div>

            {/* Dark circles/Shadows around eyes */}
            <div className="absolute top-[210px] left-[130px] w-[80px] h-[70px] bg-black opacity-50 blur-lg z-20"></div>
            <div className="absolute top-[210px] right-[130px] w-[80px] h-[70px] bg-black opacity-50 blur-lg z-20"></div>

            {/* Nose */}
            <div className="absolute top-[300px] w-[30px] h-[60px] bg-black opacity-30 blur-md z-20"></div>

            {/* MOUTH - Huge, gaping, bloody black void */}
            <div className="absolute top-[380px] w-[160px] h-[220px] bg-[#0a0000] rounded-[40%_40%_50%_50%] z-20 border-4 border-[#300] shadow-[0_0_30px_#500]">
                {/* Upper Teeth hints */}
                <div className="absolute top-2 left-4 w-[20px] h-[20px] bg-[#ccc] opacity-50 skew-x-12"></div>
                <div className="absolute top-2 right-4 w-[20px] h-[20px] bg-[#ccc] opacity-50 -skew-x-12"></div>
                
                {/* Blood Drips */}
                <div className="absolute bottom-[-40px] left-[30px] w-[15px] h-[80px] bg-[#600] rounded-b-full opacity-90 blur-[1px]"></div>
                <div className="absolute bottom-[-60px] right-[40px] w-[10px] h-[100px] bg-[#700] rounded-b-full opacity-90 blur-[1px]"></div>
            </div>
            
            {/* Blood Spatter on Face */}
            <div className="absolute top-[400px] left-[120px] w-[50px] h-[80px] bg-[#600] opacity-60 blur-md z-20 rotate-12"></div>

        </div>
      </div>

      {/* Screen Blood Vignette (Foreground Overlay) - More Intense */}
      <div className="absolute inset-0 z-50 pointer-events-none" style={{
          background: 'radial-gradient(circle, transparent 0%, rgba(150,0,0,0.2) 40%, rgba(80,0,0,0.95) 90%)',
          boxShadow: 'inset 0 0 200px rgba(0,0,0,1)'
      }}></div>
    </div>
  );
};

export default Monster;