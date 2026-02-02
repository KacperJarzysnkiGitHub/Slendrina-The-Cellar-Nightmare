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
    
    // Initial lunge
    setJolt(prev => ({ ...prev, scale: 2.0, opacity: 1 }));

    const animate = () => {
        time += 0.2;
        // Violent shaking with random spikes
        setJolt(prev => ({
            x: (Math.random() - 0.5) * 40,
            y: (Math.random() - 0.5) * 40,
            scale: 1.5 + Math.sin(time) * 0.1, // Pulse size
            opacity: 1
        }));
        frameId = requestAnimationFrame(animate);
    };
    
    // Slight delay to sync with screen fade
    const timeout = setTimeout(animate, 50);
    return () => {
        clearTimeout(timeout);
        cancelAnimationFrame(frameId);
    };
  }, [gameState]);

  if (gameState !== GameState.GAME_OVER) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black overflow-hidden pointer-events-none">
      
      {/* Background Darkness */}
      <div className="absolute inset-0 bg-[#050505] z-0"></div>
      
      {/* Monster Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center transition-transform duration-75 z-10 ease-out"
        style={{ 
            transform: `translate(${jolt.x}px, ${jolt.y}px) scale(${jolt.scale})`,
            opacity: jolt.opacity 
        }}
      >
        {/* The Monster Figure */}
        <div className="relative w-[500px] h-[700px] flex flex-col items-center filter contrast-125 brightness-75">
            
            {/* Hair (Back Layer) */}
            <div className="absolute top-[50px] w-[450px] h-[800px] bg-[#020202] rounded-t-full blur-sm z-0"></div>

            {/* Neck */}
            <div className="absolute top-[350px] w-[100px] h-[100px] bg-[#999] z-10 shadow-inner"></div>

            {/* Shoulders/Dress */}
            <div className="absolute top-[420px] w-[500px] h-[400px] bg-[#ccc] rounded-t-[40%] z-10 shadow-[inset_0_10px_50px_rgba(0,0,0,0.8)] flex justify-center">
                 {/* Blood stains on dress */}
                 <div className="absolute top-[50px] left-[150px] w-[40px] h-[100px] bg-[#500] opacity-70 blur-[3px] rounded-full rotate-6"></div>
                 <div className="absolute top-[80px] right-[160px] w-[30px] h-[80px] bg-[#500] opacity-80 blur-[2px] rounded-full -rotate-3"></div>
            </div>

            {/* Face */}
            <div className="absolute top-[100px] w-[280px] h-[360px] bg-[#e0e0e0] rounded-[110px_110px_90px_90px] z-20 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]"></div>

            {/* Hair (Front Sides) */}
            <div className="absolute top-[60px] left-[50px] w-[90px] h-[700px] bg-[#020202] z-30 skew-x-[5deg] rotate-[2deg]"></div>
            <div className="absolute top-[60px] right-[50px] w-[90px] h-[700px] bg-[#020202] z-30 -skew-x-[5deg] -rotate-[2deg]"></div>

            {/* Facial Features Container */}
            <div className="absolute top-[100px] w-[280px] h-[360px] z-30">
                {/* Eyes - Pure White & Glowing */}
                <div className="absolute top-[120px] left-[50px] w-[60px] h-[45px] bg-white rounded-full shadow-[0_0_15px_white]"></div>
                <div className="absolute top-[120px] right-[50px] w-[60px] h-[45px] bg-white rounded-full shadow-[0_0_15px_white]"></div>
                
                {/* Nose Shadow */}
                <div className="absolute top-[180px] left-[130px] w-[20px] h-[50px] bg-black opacity-20 blur-md"></div>

                {/* Mouth (Gaping Scream) */}
                <div className="absolute top-[230px] left-[90px] w-[100px] h-[140px] bg-black rounded-[50%_50%_45%_45%] shadow-[inset_0_0_20px_#500] border-2 border-[#300] opacity-95"></div>
                
                {/* Blood Dripping from Mouth */}
                <div className="absolute top-[360px] left-[130px] w-[10px] h-[60px] bg-[#800] opacity-90 blur-[1px]"></div>
                <div className="absolute top-[360px] left-[150px] w-[8px] h-[40px] bg-[#900] opacity-90 blur-[1px]"></div>
            </div>

        </div>
      </div>

      {/* Screen Blood Vignette (Foreground Overlay) */}
      <div className="absolute inset-0 z-50 pointer-events-none" style={{
          background: 'radial-gradient(circle, transparent 10%, rgba(100,0,0,0.3) 50%, rgba(50,0,0,0.95) 90%)',
          boxShadow: 'inset 0 0 150px rgba(0,0,0,1)'
      }}></div>
    </div>
  );
};

export default Monster;