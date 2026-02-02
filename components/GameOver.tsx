import React, { useEffect, useState } from 'react';

interface GameOverProps {
  books: number;
}

const GameOver: React.FC<GameOverProps> = ({ books }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay the Game Over screen (blackout + text) by 1.5 seconds
    // to allow the Monster's jumpscare animation (which is rendered behind this z-index) to play fully visible.
    const timer = setTimeout(() => {
      setVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`absolute inset-0 z-[100] flex flex-col items-center justify-center cursor-none transition-colors duration-1000 ease-in ${visible ? 'bg-black' : 'bg-transparent pointer-events-none'}`}
    >
      
      <div className={`flex flex-col items-center transition-opacity duration-1000 delay-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Top Text: Books Count */}
        <div className="text-white text-5xl md:text-6xl font-hand tracking-wider opacity-90 mb-8">
           Books &nbsp; {books} / 8
        </div>

        {/* Center Text: Game Over */}
        <div className="relative">
            <h1 
              className="text-7xl md:text-9xl text-red-600 font-serif font-bold tracking-widest"
              style={{
                  textShadow: `
                      2px 2px 0px #300,
                      -1px -1px 0px #500,
                      1px -1px 0px #300,
                      -1px 1px 0px #300,
                      1px 1px 0px #300,
                      0 0 10px rgba(255, 0, 0, 0.5),
                      0 0 20px rgba(100, 0, 0, 0.8)
                  `,
                  background: '-webkit-linear-gradient(#ff3333, #990000)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0px 0px 5px black)'
              }}
            >
              Game Over
            </h1>
            
            {/* Subtle blood drip visual below text */}
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-full h-20 bg-gradient-to-b from-red-900/20 to-transparent blur-md opacity-50 pointer-events-none"></div>
        </div>
      </div>

    </div>
  );
};

export default GameOver;