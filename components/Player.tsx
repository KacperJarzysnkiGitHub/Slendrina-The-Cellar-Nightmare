import React, { useEffect, useState } from 'react';
import { GameState } from '../types';

interface PlayerProps {
  gameState: GameState;
  health: number;
}

const Player: React.FC<PlayerProps> = ({ gameState, health }) => {
  const [sway, setSway] = useState({ x: 0, y: 0 });
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;
    
    let frameId: number;
    const start = Date.now();
    const animate = () => {
        const now = Date.now();
        const elapsed = now - start;
        
        // Base breathing
        let y = Math.sin(elapsed / 1000) * 8;
        let x = Math.cos(elapsed / 2000) * 4;

        // Fear/Damage Shake
        if (health < 100) {
            const trauma = (100 - health) / 100; // 0 to 1
            const shakeIntensity = trauma * 20; // Up to 20px shake
            x += (Math.random() - 0.5) * shakeIntensity;
            y += (Math.random() - 0.5) * shakeIntensity;
        }

        // Low Health Pulse
        let currentPulse = 0;
        if (health < 50) {
            const danger = (50 - health) / 50; // 0.0 to 1.0
            const freq = 0.004 + (danger * 0.006); // Faster when lower health (approx 60-120 BPM)
            // Sine wave for smooth pulsing (0 to 1)
            const wave = (Math.sin(elapsed * freq) + 1) / 2; 
            currentPulse = wave * danger * 0.6; // Max opacity 0.6
        }
        setPulse(currentPulse);

        setSway({ x, y });
        frameId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(frameId);
  }, [gameState, health]);

  if (gameState !== GameState.PLAYING) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Low Health Pulse Overlay */}
        <div 
            className="absolute inset-0 z-10 transition-opacity duration-75 ease-out"
            style={{
                opacity: pulse,
                background: 'radial-gradient(circle, transparent 30%, rgba(180, 0, 0, 0.5) 80%, rgba(100, 0, 0, 0.9) 100%)',
                boxShadow: 'inset 0 0 100px rgba(255, 0, 0, 0.4)',
                backdropFilter: pulse > 0.1 ? `blur(${pulse * 4}px)` : 'none',
            }}
        />

        {/* Flashlight Container at Bottom Right */}
        <div 
            className="absolute bottom-[-15%] right-[10%] w-[400px] h-[500px] transition-transform duration-75 ease-linear origin-bottom-right z-20"
            style={{ 
                transform: `translate(${sway.x}px, ${sway.y}px) rotate(-15deg) scale(0.8)` 
            }}
        >
            {/* The Flashlight Model */}
            <div className="relative w-full h-full">
                
                {/* Handle (Cylinder) */}
                <div className="absolute bottom-0 right-[25%] w-[30%] h-[75%] bg-gradient-to-r from-[#1a1a1a] via-[#333] to-[#1a1a1a] rounded-lg border-l border-[#444] shadow-2xl"></div>
                
                {/* Switch */}
                <div className="absolute bottom-[50%] right-[35%] w-[10%] h-[12%] bg-black rounded shadow-inner"></div>

                {/* Head (Conical/Cylinder) */}
                <div className="absolute top-[10%] right-[20%] w-[40%] h-[25%] bg-gradient-to-b from-[#222] to-[#111] rounded-sm shadow-xl border border-[#333]"></div>

                {/* Lens Light Source */}
                <div className="absolute top-[8%] right-[22%] w-[36%] h-[10%] bg-[#ffffe0] rounded-[100%] blur-[2px] opacity-90 shadow-[0_0_30px_rgba(255,255,220,0.8)]"></div>
                
                {/* Hand/Fingers (Skin Tone) */}
                {/* Finger 1 */}
                <div className="absolute bottom-[35%] right-[28%] w-[25%] h-[7%] bg-[#d7ccc8] rounded-full rotate-[-10deg] border-b border-[#a1887f] shadow-lg"></div>
                {/* Finger 2 */}
                <div className="absolute bottom-[43%] right-[28%] w-[25%] h-[7%] bg-[#d7ccc8] rounded-full rotate-[-10deg] border-b border-[#a1887f] shadow-lg"></div>
                {/* Finger 3 */}
                <div className="absolute bottom-[51%] right-[28%] w-[25%] h-[7%] bg-[#d7ccc8] rounded-full rotate-[-10deg] border-b border-[#a1887f] shadow-lg"></div>
                
                {/* Thumb */}
                <div className="absolute bottom-[50%] right-[48%] w-[12%] h-[18%] bg-[#d7ccc8] rounded-full rotate-[-20deg] border-r border-[#a1887f] shadow-lg"></div>
            </div>
        </div>
    </div>
  );
};

export default Player;