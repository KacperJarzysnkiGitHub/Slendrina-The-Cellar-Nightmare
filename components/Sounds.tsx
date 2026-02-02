import React, { useEffect, useRef } from 'react';
import { GameState } from '../types';
import { SOUNDS } from '../constants';

interface SoundsProps {
  gameState: GameState;
  books: number;
  keys: number;
  health: number;
}

const Sounds: React.FC<SoundsProps> = ({ gameState, books, keys, health }) => {
  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const heartbeatRef = useRef<HTMLAudioElement | null>(null);
  
  // Previous states to detect changes
  const prevBooks = useRef(books);
  const prevKeys = useRef(keys);
  const prevHealth = useRef(health);

  // Initialize Audio Objects
  useEffect(() => {
    ambienceRef.current = new Audio(SOUNDS.AMBIENCE);
    ambienceRef.current.loop = true;
    ambienceRef.current.volume = 0.5;

    heartbeatRef.current = new Audio(SOUNDS.HEARTBEAT);
    heartbeatRef.current.loop = true;
    heartbeatRef.current.volume = 0.8;

    return () => {
        ambienceRef.current?.pause();
        heartbeatRef.current?.pause();
    };
  }, []);

  // Handle Ambience (Play only in Menu and Playing)
  useEffect(() => {
    if (!ambienceRef.current) return;
    
    if (gameState === GameState.MENU || gameState === GameState.PLAYING || gameState === GameState.PAUSED) {
        if (ambienceRef.current.paused) {
            ambienceRef.current.play().catch(e => console.log("Audio autoplay prevented", e));
        }
    } else {
        ambienceRef.current.pause();
    }
  }, [gameState]);

  // Handle Heartbeat (Low Health)
  useEffect(() => {
      if (!heartbeatRef.current) return;
      if (gameState === GameState.PLAYING && health < 50 && health > 0) {
          if (heartbeatRef.current.paused) heartbeatRef.current.play().catch(() => {});
          // Increase speed/volume as health drops
          heartbeatRef.current.playbackRate = 1 + (50 - health) / 50; 
      } else {
          heartbeatRef.current.pause();
          heartbeatRef.current.currentTime = 0;
      }
  }, [health, gameState]);

  // Collection Sounds
  useEffect(() => {
      if (books > prevBooks.current) {
          const audio = new Audio(SOUNDS.PAGE);
          audio.volume = 0.7;
          audio.play().catch(() => {});
      }
      prevBooks.current = books;
  }, [books]);

  useEffect(() => {
      if (keys > prevKeys.current) {
          const audio = new Audio(SOUNDS.KEY);
          audio.volume = 0.6;
          audio.play().catch(() => {});
      }
      prevKeys.current = keys;
  }, [keys]);

  // Game Over Scream
  useEffect(() => {
      if (gameState === GameState.GAME_OVER) {
          const audio = new Audio(SOUNDS.SCREAM);
          audio.volume = 1.0;
          audio.play().catch(() => {});
      }
  }, [gameState]);

  // Damage Grunt/Gasp
  useEffect(() => {
      if (health < prevHealth.current && health > 0) {
          // Play a gasp or impact sound occasionally
          if (Math.random() > 0.5) {
             const audio = new Audio(SOUNDS.GASP);
             audio.volume = 0.5;
             audio.play().catch(() => {});
          }
      }
      prevHealth.current = health;
  }, [health]);

  return null; // Invisible component
};

export default Sounds;