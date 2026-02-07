import React, { useEffect, useRef } from 'react';
import { GameState } from '../types';
import { SOUNDS } from '../constants';

interface SoundsProps {
  gameState: GameState;
  books: number;
  keys: number;
  health: number;
  level: number;
}

const Sounds: React.FC<SoundsProps> = ({ gameState, books, keys, health, level }) => {
  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const heartbeatRef = useRef<HTMLAudioElement | null>(null);
  
  // Previous states to detect changes
  const prevHealth = useRef(health);

  // Initialize Audio Objects
  useEffect(() => {
    // Determine initial track based on level, but default to MENU_MUSIC
    ambienceRef.current = new Audio(SOUNDS.MENU_MUSIC);
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

  // Handle Music Track Switching
  useEffect(() => {
    if (!ambienceRef.current) return;

    // Determine which track should be playing
    let targetSrc = SOUNDS.MENU_MUSIC; 

    if (gameState === GameState.MENU || gameState === GameState.LEVEL_SELECT || gameState === GameState.DIFFICULTY_SELECT) {
        targetSrc = SOUNDS.MENU_MUSIC;
    } else {
        // In-Game Logic
        if (level === 2) targetSrc = SOUNDS.LEVEL_2_MUSIC;
        else if (level === 3) targetSrc = SOUNDS.LEVEL_3_MUSIC;
        else targetSrc = SOUNDS.AMBIENCE; // Level 1
    }

    // If source is different, swap tracks
    if (ambienceRef.current.src !== targetSrc) {
        const wasPlaying = !ambienceRef.current.paused;
        
        ambienceRef.current.pause();
        ambienceRef.current.src = targetSrc;
        ambienceRef.current.loop = true;
        
        // Adjust volume for specific tracks if needed (e.g. music box might be loud)
        ambienceRef.current.volume = 0.5;

        // If we were playing, or if we just entered a state where we should be playing
        const shouldPlay = 
            gameState === GameState.MENU || 
            gameState === GameState.LEVEL_SELECT || 
            gameState === GameState.DIFFICULTY_SELECT || 
            gameState === GameState.PLAYING || 
            gameState === GameState.PAUSED;

        if (shouldPlay) {
            ambienceRef.current.play().catch(e => console.log("Track switch play failed", e));
        }
    }
  }, [level, gameState]);

  // Handle Play/Pause based on GameState
  useEffect(() => {
    if (!ambienceRef.current) return;
    
    // We play music in MENU, SELECT screens, PLAYING, and PAUSED.
    // We Stop music on GAME_OVER and ENDING (to let sound effects play/silence)
    const shouldPlay = 
        gameState === GameState.MENU || 
        gameState === GameState.LEVEL_SELECT || 
        gameState === GameState.DIFFICULTY_SELECT || 
        gameState === GameState.PLAYING || 
        gameState === GameState.PAUSED;

    if (shouldPlay) {
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