import { CellType } from './types';

export const MAP_SIZE = 60;
export const TILE_SIZE = 64;
export const FOV = 60 * (Math.PI / 180);
export const MOVEMENT_SPEED = 3.5; 
export const ROTATION_SPEED = 2.5; 
export const INTERACTION_DIST = 1.0;

export const SOUNDS = {
  // Scary dark ambience loop
  AMBIENCE: 'https://cdn.pixabay.com/download/audio/2022/10/16/audio_1001968d6d.mp3?filename=dark-drone-horror-ambience-12496.mp3',
  // High pitched scream
  SCREAM: 'https://static.wikia.nocookie.net/granny/images/0/01/SlendrinaScream2.ogg/revision/latest?cb=20231015130800',
  // Paper rustle
  PAGE: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_34b7a1d7f6.mp3?filename=page-flip-4-19253.mp3',
  // Keys jingle
  KEY: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2756616019.mp3?filename=keys-unlocking-door-22345.mp3', // Using unlock sound for pickup
  // Door creak
  DOOR_OPEN: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_6b91176b6b.mp3?filename=door-creak-12154.mp3',
  // Unlock click
  DOOR_UNLOCK: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2756616019.mp3?filename=keys-unlocking-door-22345.mp3',
  // Heartbeat for low health
  HEARTBEAT: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_6d20355152.mp3?filename=heartbeat-sound-effect-22687.mp3',
  // Gasp
  GASP: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d167195d29.mp3?filename=gasp-6253.mp3',
  // Footsteps on stone/concrete
  FOOTSTEPS: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_0ec9f78d63.mp3?filename=footsteps-on-stone-floor-38765.mp3'
};

// Improved Texture Generation
const createTexture = (type: 'brick' | 'wood' | 'metal' | 'exit' | 'floor' | 'ceiling', color: string): string => {
  const canvas = document.createElement('canvas');
  // Higher resolution for better quality
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Base
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 128, 128);

  // General Noise (Grain)
  for (let i = 0; i < 2000; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.15})`;
    ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }

  if (type === 'brick') {
    // Slendrina Style: Grey Bricks
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 3;
    
    // Bricks
    const brickH = 32;
    const brickW = 64;
    for(let y=0; y<128; y+=brickH) {
        // Offset every other row
        const offset = (y % (brickH*2) === 0) ? 0 : brickW/2;
        
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(128, y); // Horizontal mortar
        ctx.stroke();

        for(let x= -brickW/2; x<128; x+=brickW) {
             ctx.beginPath();
             ctx.moveTo(x + offset, y);
             ctx.lineTo(x + offset, y + brickH);
             ctx.stroke();
             
             // Add shading to brick for 3D feel
             ctx.fillStyle = 'rgba(255,255,255,0.05)';
             ctx.fillRect(x + offset + 2, y + 2, brickW - 4, 4); // Highlight top
             ctx.fillStyle = 'rgba(0,0,0,0.1)';
             ctx.fillRect(x + offset + 2, y + brickH - 6, brickW - 4, 4); // Shadow bottom
        }
    }
  } else if (type === 'floor') {
      // Stone Tiles
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 2;
      const tileS = 64;
      for(let y=0; y<128; y+=tileS) {
          for(let x=0; x<128; x+=tileS) {
              ctx.strokeRect(x,y,tileS,tileS);
              // Cracked look
              if(Math.random() > 0.5) {
                  ctx.beginPath();
                  ctx.moveTo(x+10, y+10);
                  ctx.lineTo(x+30 + Math.random()*20, y+30 + Math.random()*20);
                  ctx.stroke();
              }
          }
      }
  } else if (type === 'ceiling') {
      // Old Wood Planks
      ctx.fillStyle = '#1a1a1a'; // Very dark
      ctx.fillRect(0,0,128,128);
      ctx.strokeStyle = '#0a0a0a';
      ctx.lineWidth = 4;
      for(let x=0; x<128; x+=32) {
          ctx.beginPath();
          ctx.moveTo(x, 0); ctx.lineTo(x, 128);
          ctx.stroke();
      }
  } else if (type === 'wood') {
     ctx.strokeStyle = 'rgba(30, 20, 10, 0.5)';
     ctx.lineWidth = 2;
     for(let i=0; i<8; i++) {
         const x = i * 16;
         ctx.beginPath();
         ctx.moveTo(x, 0); ctx.lineTo(x, 128);
         ctx.stroke();
     }
     // Frame
     ctx.strokeStyle = '#221100';
     ctx.lineWidth = 8;
     ctx.strokeRect(0,0,128,128);
     
     // Knob
     ctx.fillStyle = '#aa8800';
     ctx.beginPath();
     ctx.arc(100, 64, 6, 0, Math.PI*2);
     ctx.fill();
  } else if (type === 'exit') {
     // White/Grey Wooden Planks (Matches reference image)
     ctx.fillStyle = '#dcdcdc'; 
     ctx.fillRect(0,0,128,128);
     
     // Vertical Planks lines
     ctx.strokeStyle = '#999999';
     ctx.lineWidth = 2;
     for(let i=0; i<8; i++) {
         const x = i * 16;
         ctx.beginPath();
         ctx.moveTo(x, 0); ctx.lineTo(x, 128);
         ctx.stroke();
     }
     
     // Heavy Grunge/Dirt
     for (let i = 0; i < 1000; i++) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`;
        ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
     }
     
     // Frame
     ctx.strokeStyle = '#555';
     ctx.lineWidth = 4;
     ctx.strokeRect(0,0,128,128);
     
     // TEXT "EXIT" in Red Serif
     ctx.fillStyle = '#cc0000'; 
     ctx.font = 'bold 36px serif'; 
     ctx.textAlign = 'center';
     ctx.textBaseline = 'middle';
     ctx.fillText('EXIT', 64, 50);
     
     // Small Handle
     ctx.fillStyle = '#111';
     ctx.beginPath();
     ctx.arc(110, 64, 4, 0, Math.PI*2);
     ctx.fill();
  }
  
  return canvas.toDataURL();
};

export const TEXTURES = {
  WALL: createTexture('brick', '#555555'),
  DOOR: createTexture('wood', '#3e2723'),
  DOOR_LOCKED: createTexture('metal', '#37474f'),
  EXIT: createTexture('exit', '#ffffff'),
  FLOOR: createTexture('floor', '#222222'),
  CEILING: createTexture('ceiling', '#111111'),
};

// Generates a large 60x60 map with distinct sections
const generateLevel = (): number[][] => {
    const W = 60;
    const H = 60;
    const map = Array.from({ length: H }, () => Array(W).fill(CellType.WALL));

    // Helper to clear an area
    const clearRect = (x: number, y: number, w: number, h: number) => {
        for(let r = y; r < y+h; r++) {
            for(let c = x; c < x+w; c++) {
                if(r>=1 && r<H-1 && c>=1 && c<W-1) map[r][c] = CellType.EMPTY;
            }
        }
    };

    // 1. Starting Area (Top Left)
    clearRect(2, 2, 8, 8); // Start Room
    clearRect(9, 5, 10, 3); // Corridor East

    // 2. Central Hub (The Crossroads)
    clearRect(25, 25, 12, 12);
    // Connect Start to Hub
    clearRect(18, 5, 3, 22); // Vertical down
    clearRect(18, 26, 8, 3); // Horizontal to Hub

    // 3. North Wing (Prison Block)
    clearRect(28, 2, 6, 23); // Main Hallway
    for(let i=0; i<4; i++) {
        // Left Cells
        clearRect(22, 4 + i*5, 5, 4);
        map[6 + i*5][27] = CellType.DOOR;
        // Right Cells
        clearRect(35, 4 + i*5, 5, 4);
        map[6 + i*5][34] = CellType.DOOR;
    }

    // 4. East Wing (Warehouse/Pillars)
    clearRect(37, 28, 20, 6); // Connector Hall
    clearRect(45, 10, 14, 45); // Huge Warehouse
    // Pillars
    for(let r=12; r<53; r+=4) {
        for(let c=47; c<57; c+=4) {
             map[r][c] = CellType.WALL;
        }
    }

    // 5. West Wing (The Archive Maze)
    clearRect(2, 30, 23, 4); // Connector Hall from Hub
    clearRect(2, 34, 20, 24); // Maze Area
    // Maze Walls
    for(let r=36; r<56; r+=2) {
        for(let c=4; c<20; c+=2) {
            if(Math.random() > 0.25) map[r][c] = CellType.WALL;
        }
    }

    // 6. South Wing (Exit) - Locked
    clearRect(28, 37, 6, 18); // Hallway to Exit
    map[40][30] = CellType.DOOR_LOCKED; // Gate 1
    map[40][31] = CellType.DOOR_LOCKED; // Gate 2 (Double door)
    
    // Ensure walls around the door so you can't walk around
    map[40][28] = CellType.WALL; map[40][29] = CellType.WALL;
    map[40][32] = CellType.WALL; map[40][33] = CellType.WALL;

    clearRect(20, 55, 22, 4); // Final Antechamber
    map[59][30] = CellType.EXIT; // THE EXIT
    map[59][31] = CellType.EXIT; 

    return map;
};

// 1: Wall, 0: Empty, 2: Door, 4: Locked Door, 9: Exit
export const LEVEL_MAP = generateLevel();

export const INITIAL_PLAYER = {
  x: 4.5,
  y: 4.5,
  dir: Math.PI / 2, 
};

export const INITIAL_ITEMS = [
  // BOOKS (8) - Spread across the wings
  { type: 'book', x: 24.5, y: 6.5, id: 'b1', collected: false }, // North Left Cell 1
  { type: 'book', x: 37.5, y: 21.5, id: 'b2', collected: false }, // North Right Cell 4
  { type: 'book', x: 50.5, y: 12.5, id: 'b3', collected: false }, // Warehouse Top
  { type: 'book', x: 55.5, y: 50.5, id: 'b4', collected: false }, // Warehouse Bottom
  { type: 'book', x: 5.5, y: 36.5, id: 'b5', collected: false }, // Maze Top
  { type: 'book', x: 18.5, y: 53.5, id: 'b6', collected: false }, // Maze Bottom
  { type: 'book', x: 30.5, y: 30.5, id: 'b7', collected: false }, // Central Hub
  { type: 'book', x: 19.5, y: 15.5, id: 'b8', collected: false }, // Vertical Connector Hall (Moved from 12.5, 15.5 which was inside a wall)

  // KEYS (3) - Critical for Exit and Shortcuts
  { type: 'key', x: 37.5, y: 6.5, id: 'k1', collected: false },  // North Right Cell 1
  { type: 'key', x: 47.5, y: 30.5, id: 'k2', collected: false }, // Warehouse Entrance
  { type: 'key', x: 10.5, y: 45.5, id: 'k3', collected: false }, // Deep Maze
];