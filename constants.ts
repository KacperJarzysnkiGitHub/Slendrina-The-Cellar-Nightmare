import { CellType, Item } from './types';

export const MAP_SIZE = 60;
export const TILE_SIZE = 64;
export const FOV = 60 * (Math.PI / 180);
export const MOVEMENT_SPEED = 3.5; 
export const ROTATION_SPEED = 2.5; 
export const INTERACTION_DIST = 1.0;

export const SOUNDS = {
  // UI Click
  CLICK: 'https://files.catbox.moe/8tpg64.wav',
  
  // Main Menu Music
  MENU_MUSIC: 'https://lambda.vgmtreasurechest.com/soundtracks/slendrina-the-cellar-android-gamerip-2014/fruzmlvs/04.%20Slendrina%20The%20Cellar%20Menu%20Music.mp3',
  // Level 1 Music (Dark Drone)
  AMBIENCE: 'https://lambda.vgmtreasurechest.com/soundtracks/slendrina-the-cellar-android-gamerip-2014/lqtvwvpm/01.%20Music%20Cellar1.mp3',
  // Level 2 Music (Hollow Wind/Atmosphere)
  LEVEL_2_MUSIC: 'https://lambda.vgmtreasurechest.com/soundtracks/slendrina-the-cellar-android-gamerip-2014/okjnndcb/02.%20Music%20Cellar2.mp3',
  // Level 3 Music (Creepy Piano/Music Box for Library)
  LEVEL_3_MUSIC: 'https://lambda.vgmtreasurechest.com/soundtracks/slendrina-the-cellar-android-gamerip-2014/bchezirl/03.%20Music%20Cellar3.mp3',
  
  // High pitched scream
  SCREAM: 'https://static.wikia.nocookie.net/granny/images/0/01/SlendrinaScream2.ogg/revision/latest?cb=20231015130800',
  // Paper rustle / Book Pickup
  BOOK_PICKUP: 'https://files.catbox.moe/olwzz4.wav',
  // Old Page flip (keeping for reference if needed, but using BOOK_PICKUP for collection)
  PAGE: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_34b7a1d7f6.mp3?filename=page-flip-4-19253.mp3',
  // Keys jingle
  KEY: 'https://files.catbox.moe/jqg9fh.wav', // Using unlock sound for pickup
  // Door creak
  DOOR_OPEN: 'https://files.catbox.moe/5z5i0p.wav',
  // Unlock click
  DOOR_UNLOCK: 'https://files.catbox.moe/tsy8te.wav',
  // Heartbeat for low health
  HEARTBEAT: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_6d20355152.mp3?filename=heartbeat-sound-effect-22687.mp3',
  // Gasp
  GASP: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d167195d29.mp3?filename=gasp-6253.mp3',
  // Footsteps on stone/concrete
  FOOTSTEPS: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_0ec9f78d63.mp3?filename=footsteps-on-stone-floor-38765.mp3'
};

// Improved Texture Generation
const createTexture = (type: 'brick' | 'wood' | 'metal' | 'exit' | 'floor' | 'ceiling' | 'bookshelf', color: string): string => {
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
      // Old Wood Planks or Concrete
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
  } else if (type === 'bookshelf') {
      // Dark Wood background
      ctx.fillStyle = '#2d1b0e';
      ctx.fillRect(0,0,128,128);
      
      // Shelf Shadows
      ctx.fillStyle = '#0f0502';
      for(let y=20; y<128; y+=40) {
          ctx.fillRect(0, y, 128, 6); // Shelf thickness/shadow
      }

      // Books
      for(let y=26; y<128; y+=40) { // Iterate shelves
          let x = 4;
          while(x < 124) {
              // Random book dimensions and colors
              const width = 8 + Math.random() * 10;
              const height = 28 + Math.random() * 6;
              const lean = (Math.random() - 0.5) * 4;
              
              // Earthy/Old book colors
              const hue = 360 * Math.random(); 
              const sat = 20 + Math.random() * 40;
              const lig = 15 + Math.random() * 30;
              
              ctx.fillStyle = `hsl(${hue}, ${sat}%, ${lig}%)`;
              
              // Draw book spine
              ctx.save();
              ctx.translate(x + width/2, y + 34);
              ctx.rotate(lean * Math.PI / 180);
              ctx.fillRect(-width/2, -height, width, height);
              
              // Spine detail (lines)
              ctx.fillStyle = `rgba(255,255,255,0.2)`;
              ctx.fillRect(-width/2 + 2, -height + 4, width - 4, 2);
              ctx.fillRect(-width/2 + 2, -height + height - 6, width - 4, 2);
              
              ctx.restore();
              
              x += width + 2;
          }
      }
      
      // Vertical Wood Frame separators
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(60, 0, 8, 128);
      
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
  BOOKSHELF: createTexture('bookshelf', '#3e2723'),
  DOOR: createTexture('wood', '#3e2723'),
  DOOR_LOCKED: createTexture('metal', '#37474f'),
  EXIT: createTexture('exit', '#ffffff'),
  FLOOR: createTexture('floor', '#222222'),
  CEILING: createTexture('ceiling', '#111111'),
};

export const generateLevel = (levelId: number) => {
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
    
    const items: Item[] = [];
    let startPlayer = { x: 4.5, y: 4.5, dir: Math.PI / 2 };

    if (levelId === 1) {
        // --- LEVEL 1: THE CELLAR ---
        
        // 1. Starting Area (Top Left)
        clearRect(2, 2, 8, 8); // Start Room
        clearRect(9, 5, 10, 3); // Corridor East

        // 2. Central Hub
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
            for(let c=47; c<57; c+=4) map[r][c] = CellType.WALL;
        }

        // 5. West Wing (The Archive Maze)
        clearRect(2, 30, 23, 4); // Connector Hall from Hub
        clearRect(2, 34, 20, 24); // Maze Area
        for(let r=36; r<56; r+=2) {
            for(let c=4; c<20; c+=2) {
                if(Math.random() > 0.25) map[r][c] = CellType.WALL;
            }
        }

        // 6. South Wing (Exit) - Locked
        clearRect(28, 37, 6, 18); // Hallway to Exit
        map[40][30] = CellType.DOOR_LOCKED;
        map[40][31] = CellType.DOOR_LOCKED;
        map[40][28] = CellType.WALL; map[40][29] = CellType.WALL;
        map[40][32] = CellType.WALL; map[40][33] = CellType.WALL;

        clearRect(20, 55, 22, 4); // Final Antechamber
        map[59][30] = CellType.EXIT;
        map[59][31] = CellType.EXIT;
        
        // ITEMS for Level 1
        items.push(
            { type: 'book', x: 24.5, y: 6.5, id: 'b1', collected: false },
            { type: 'book', x: 37.5, y: 21.5, id: 'b2', collected: false },
            { type: 'book', x: 50.5, y: 12.5, id: 'b3', collected: false },
            { type: 'book', x: 55.5, y: 50.5, id: 'b4', collected: false },
            { type: 'book', x: 5.5, y: 36.5, id: 'b5', collected: false },
            { type: 'book', x: 18.5, y: 53.5, id: 'b6', collected: false },
            { type: 'book', x: 30.5, y: 30.5, id: 'b7', collected: false },
            { type: 'book', x: 19.5, y: 15.5, id: 'b8', collected: false },
            { type: 'key', x: 37.5, y: 6.5, id: 'k1', collected: false },
            { type: 'key', x: 47.5, y: 30.5, id: 'k2', collected: false },
            { type: 'key', x: 10.5, y: 45.5, id: 'k3', collected: false }
        );

    } else if (levelId === 2) {
        // --- LEVEL 2: THE TUNNELS ---
        startPlayer = { x: 30.5, y: 5.5, dir: Math.PI }; 
        
        // 1. Main Spine Tunnel (Vertical)
        clearRect(29, 2, 3, 50); 
        
        // 2. Horizontal Cross Tunnels
        clearRect(5, 10, 50, 2); // Top Cross
        clearRect(5, 25, 50, 2); // Middle Cross
        clearRect(5, 40, 50, 2); // Bottom Cross

        // 3. Small Rooms at ends
        clearRect(2, 8, 6, 6); map[11][8] = CellType.DOOR;
        clearRect(52, 8, 6, 6); map[11][52] = CellType.DOOR;
        clearRect(2, 23, 6, 6); map[26][8] = CellType.DOOR;
        clearRect(52, 23, 6, 6); map[26][52] = CellType.DOOR;
        clearRect(2, 38, 6, 6); map[41][8] = CellType.DOOR;
        clearRect(52, 38, 6, 6); map[41][52] = CellType.DOOR;

        // 4. Hidden Back Corridors
        clearRect(8, 8, 2, 34); 
        clearRect(50, 8, 2, 34); 
        clearRect(4, 26, 4, 1);
        clearRect(52, 26, 4, 1);

        // 5. Exit Area
        clearRect(26, 52, 9, 6);
        map[52][30] = CellType.DOOR_LOCKED; // Gate
        map[58][30] = CellType.EXIT;

        // ITEMS for Level 2
        items.push(
            { type: 'book', x: 4.5, y: 10.5, id: 'b1', collected: false },
            { type: 'book', x: 55.5, y: 10.5, id: 'b2', collected: false },
            { type: 'book', x: 4.5, y: 40.5, id: 'b3', collected: false },
            { type: 'book', x: 55.5, y: 40.5, id: 'b4', collected: false },
            { type: 'book', x: 30.5, y: 25.5, id: 'b5', collected: false },
            { type: 'book', x: 9.0, y: 25.0, id: 'b6', collected: false },
            { type: 'book', x: 51.0, y: 25.0, id: 'b7', collected: false },
            { type: 'book', x: 30.5, y: 48.0, id: 'b8', collected: false },
            { type: 'key', x: 30.5, y: 2.5, id: 'k1', collected: false },
            { type: 'key', x: 55.5, y: 25.5, id: 'k2', collected: false },
            { type: 'key', x: 4.5, y: 25.5, id: 'k3', collected: false }
        );
    } else if (levelId === 3) {
        // --- LEVEL 3: THE LIBRARY ---
        // Bookshelves everywhere. 4 Main quadrants connected by a central cross.
        
        startPlayer = { x: 30.5, y: 3.5, dir: Math.PI }; // Start at Top of Cross

        // 1. The Cross (Safe Corridor)
        clearRect(28, 2, 4, 56); // Vert Spine (x=28-31)
        clearRect(2, 28, 56, 4); // Horz Spine (y=28-31)

        // 2. Quadrant 1 (Top Left) - Vertical Aisles
        // Area: x=2..26, y=2..26.
        // Wall boundary at x=27 and y=27
        clearRect(2, 2, 25, 25); // Clear Room
        // Add Bookshelves (Walls)
        for(let x=4; x<25; x+=4) {
            for(let y=4; y<24; y++) {
                if(y !== 15) map[y][x] = CellType.WALL; // Leave a center path at y=15
            }
        }
        // Door to Spine
        map[15][27] = CellType.DOOR;
        map[27][15] = CellType.DOOR;

        // 3. Quadrant 2 (Top Right) - Horizontal Aisles
        // Area: x=33..57, y=2..26
        clearRect(33, 2, 25, 25);
        for(let y=4; y<25; y+=4) {
             for(let x=35; x<55; x++) {
                 if(x !== 45) map[y][x] = CellType.WALL; // Leave center path x=45
             }
        }
        // Door to Spine
        map[15][32] = CellType.DOOR;
        map[27][45] = CellType.DOOR;

        // 4. Quadrant 3 (Bot Left) - Maze
        // Area: x=2..26, y=33..57
        clearRect(2, 33, 25, 25);
        for(let x=4; x<25; x+=4) {
            for(let y=35; y<55; y+=4) {
                // Random pillars
                if((x+y)%3 !== 0) {
                     map[y][x] = CellType.WALL;
                     map[y+1][x] = CellType.WALL;
                }
            }
        }
        // Door to Spine
        map[45][27] = CellType.DOOR;
        map[32][15] = CellType.DOOR;

        // 5. Quadrant 4 (Bot Right) - The Reading Room (Open)
        // Area: x=33..57, y=33..57
        clearRect(33, 33, 25, 25);
        // Central Block
        for(let x=40; x<50; x++) {
            for(let y=40; y<50; y++) {
                map[y][x] = CellType.WALL;
            }
        }
        // Door to Spine
        map[45][32] = CellType.DOOR;
        map[32][45] = CellType.DOOR;

        // Exit
        map[58][30] = CellType.EXIT;
        map[55][30] = CellType.DOOR_LOCKED; // Gate at bottom of spine

        // ITEMS
        items.push(
            { type: 'book', x: 4.5, y: 4.5, id: 'b1', collected: false }, // Q1 Top Left
            { type: 'book', x: 20.5, y: 20.5, id: 'b2', collected: false }, // Q1 Bot Right
            { type: 'book', x: 55.5, y: 4.5, id: 'b3', collected: false }, // Q2 Top Right
            { type: 'book', x: 35.5, y: 24.5, id: 'b4', collected: false }, // Q2 Bot Left
            { type: 'book', x: 4.5, y: 55.5, id: 'b5', collected: false },  // Q3 Bot Left
            { type: 'book', x: 22.5, y: 40.5, id: 'b6', collected: false }, // Q3 Inner
            { type: 'book', x: 55.5, y: 55.5, id: 'b7', collected: false }, // Q4 Bot Right
            { type: 'book', x: 44.5, y: 44.5, id: 'b8', collected: false }, // Q4 Center Block (Inside? No, make it accessible)
            
            { type: 'key', x: 30.5, y: 30.5, id: 'k1', collected: false }, // Cross Center
            { type: 'key', x: 15.5, y: 15.5, id: 'k2', collected: false }, // Q1 Center
            { type: 'key', x: 45.5, y: 15.5, id: 'k3', collected: false }  // Q2 Center
        );
        
        // Ensure b8 is accessible (it was inside the block x40-50, y40-50)
        // Let's move b8 to 35.5, 35.5 (Entrance to Q4)
        if (items[7]) {
            items[7].x = 35.5; 
            items[7].y = 35.5;
        }
    }

    return { map, items, startPlayer };
};