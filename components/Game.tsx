import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { CellType, GameState, Item, Entity, Difficulty } from '../types';
import { generateLevel, TEXTURES, MOVEMENT_SPEED, INTERACTION_DIST, SOUNDS } from '../constants';

interface GameProps {
  onGameOver: () => void;
  onVictory: () => void;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setBooksCollected: (count: number) => void;
  setKeysCollected: (count: number) => void;
  setHealth: (hp: number) => void;
  difficulty: Difficulty;
  level: number;
}

const Game: React.FC<GameProps> = ({ 
  onGameOver, 
  onVictory, 
  gameState, 
  setGameState,
  setBooksCollected,
  setKeysCollected,
  setHealth,
  difficulty,
  level
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // Game Logic Refs
  const mapRef = useRef<number[][]>([]);
  const itemsRef = useRef<Item[]>([]);
  const keysRef = useRef<number>(0);
  const booksRef = useRef<number>(0);
  const hpRef = useRef<number>(100);
  const endingStartTimeRef = useRef<number>(0);
  
  // Three.js Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const floorMeshRef = useRef<THREE.Mesh | null>(null);
  const ceilingMeshRef = useRef<THREE.Mesh | null>(null);
  
  // Model Refs
  const slendrinaGroupRef = useRef<THREE.Group | null>(null);
  
  const slendrinaDataRef = useRef<Entity>({ x: 10, y: 10, active: false, texture: '', lastSeenTime: 0, spawnTime: 0, isJumpscaring: false });
  const nextSpawnTimeRef = useRef<number>(0);
  const itemMeshesRef = useRef<{ [key: string]: THREE.Object3D }>({});
  const doorMeshesRef = useRef<{ [key: string]: THREE.Mesh }>({});
  const wallsRef = useRef<THREE.Mesh[]>([]);
  
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  
  // Audio Refs
  const footstepsRef = useRef<HTMLAudioElement | null>(null);
  
  // Input State
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const playDoorSound = (locked: boolean) => {
     const url = locked ? SOUNDS.DOOR_UNLOCK : SOUNDS.DOOR_OPEN;
     const audio = new Audio(url);
     audio.volume = 0.5;
     audio.play().catch(() => {});
  };

  // --- 3D MODEL GENERATION ---

  const createBookModel = (id: string, x: number, y: number) => {
      const group = new THREE.Group();
      group.position.set(x, 1.0, y);
      group.rotation.y = Math.random() * Math.PI * 2;
      group.rotation.z = Math.PI / 6; 

      const coverMat = new THREE.MeshStandardMaterial({ color: 0xaa0000, roughness: 0.5, metalness: 0.1 });
      const pageMat = new THREE.MeshStandardMaterial({ color: 0xe6dbc8, roughness: 0.9 });

      const spine = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.09), coverMat);
      spine.position.x = -0.16;
      group.add(spine);

      const front = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.52, 0.02), coverMat);
      front.position.set(0.01, 0, 0.045);
      group.add(front);

      const back = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.52, 0.02), coverMat);
      back.position.set(0.01, 0, -0.045);
      group.add(back);

      const pages = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.48, 0.07), pageMat);
      pages.position.set(0.01, 0, 0);
      group.add(pages);

      group.userData = { id, type: 'book', pickup: true };
      return group;
  };

  const createKeyModel = (id: string, x: number, y: number) => {
      const group = new THREE.Group();
      group.position.set(x, 1.0, y);
      group.scale.set(0.5, 0.5, 0.5); 
      group.rotation.x = Math.PI / 4;

      const metalMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7, metalness: 0.6 });

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 1.4, 8), metalMat);
      shaft.rotation.z = Math.PI / 2;
      group.add(shaft);

      const head = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.08, 8, 8), metalMat);
      head.position.x = -0.7; 
      head.rotation.y = Math.PI / 2;
      group.add(head);

      const teeth = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.05), metalMat);
      teeth.position.set(0.5, -0.15, 0);
      group.add(teeth);

      const teeth2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.05), metalMat);
      teeth2.position.set(0.3, -0.1, 0);
      group.add(teeth2);

      group.userData = { id, type: 'key', pickup: true };
      return group;
  };

  const createSlendrinaModel = () => {
      const pivot = new THREE.Group();
      const group = new THREE.Group();
      group.name = "bodyGroup";
      pivot.add(group);

      // MATERIALS - DVloper Style (Pale, White Eyes)
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.3, metalness: 0.0 }); // Very pale dead skin
      const dressMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1.0 }); 
      // Dirty white dress
      dressMat.color.setHex(0xf0f0f0);
      
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9 });
      const faceFeatureMat = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Black void mouth
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // SOLID WHITE EYES (No pupils)

      // 1. BODY
      const bodyGeo = new THREE.CylinderGeometry(0.12, 0.45, 1.5, 12);
      const body = new THREE.Mesh(bodyGeo, dressMat);
      body.position.y = 0.75;
      group.add(body);

      // 2. NECK
      const neckGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.25, 8);
      const neck = new THREE.Mesh(neckGeo, skinMat);
      neck.position.y = 1.55;
      group.add(neck);

      // 3. HEAD GROUP
      const headGroup = new THREE.Group();
      headGroup.position.y = 1.7; 
      headGroup.name = "headGroup";

      const headGeo = new THREE.SphereGeometry(0.17, 16, 16);
      headGeo.scale(0.85, 1.25, 0.9);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.set(0, 0.1, 0);
      headGroup.add(head);

      // 4. HAIR (Long black hair)
      const hairGroup = new THREE.Group();
      const hairBackGeo = new THREE.SphereGeometry(0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const hairBack = new THREE.Mesh(hairBackGeo, hairMat);
      hairBack.rotation.x = Math.PI;
      hairBack.position.set(0, 0.12, 0);
      hairGroup.add(hairBack);
      
      // Long Side Hair
      const sideHairGeo = new THREE.BoxGeometry(0.1, 0.9, 0.14);
      const hairL = new THREE.Mesh(sideHairGeo, hairMat);
      hairL.position.set(-0.14, -0.1, 0.08);
      hairL.rotation.z = 0.05;
      hairL.rotation.y = -0.1;
      hairGroup.add(hairL);
      
      const hairR = new THREE.Mesh(sideHairGeo, hairMat);
      hairR.position.set(0.14, -0.1, 0.08);
      hairR.rotation.z = -0.05;
      hairR.rotation.y = 0.1;
      hairGroup.add(hairR);
      
      headGroup.add(hairGroup);

      // 5. FACE (White Eyes, No Pupils)
      const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8); // Slightly larger eyes
      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(-0.055, 0.12, 0.16); // Pushed forward slightly
      headGroup.add(eyeL);
      
      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(0.055, 0.12, 0.16);
      headGroup.add(eyeR);

      // Dark Sockets (Behind the eyes for depth)
      const eyeSocketGeo = new THREE.CircleGeometry(0.06, 8);
      const eyeSocketMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const socketL = new THREE.Mesh(eyeSocketGeo, eyeSocketMat);
      socketL.position.set(-0.055, 0.12, 0.15);
      socketL.rotation.y = -0.2;
      headGroup.add(socketL);
      const socketR = new THREE.Mesh(eyeSocketGeo, eyeSocketMat);
      socketR.position.set(0.055, 0.12, 0.15);
      socketR.rotation.y = 0.2;
      headGroup.add(socketR);

      // Gaping Mouth (Black Void)
      const mouthGeo = new THREE.CapsuleGeometry(0.05, 0.15, 4, 8);
      const mouth = new THREE.Mesh(mouthGeo, faceFeatureMat);
      mouth.position.set(0, -0.06, 0.15);
      mouth.scale.set(1, 1, 0.5); 
      mouth.name = "mouth";
      headGroup.add(mouth);

      // Blood Stain under mouth
      const bloodGeo = new THREE.BoxGeometry(0.02, 0.2, 0.01);
      const bloodMat = new THREE.MeshBasicMaterial({ color: 0x550000 });
      const blood = new THREE.Mesh(bloodGeo, bloodMat);
      blood.position.set(0, -0.18, 0.16);
      headGroup.add(blood);

      group.add(headGroup);

      // 6. ARMS
      const armGeo = new THREE.CylinderGeometry(0.035, 0.03, 1.0, 8); 
      const handGeo = new THREE.SphereGeometry(0.05, 8, 8);
      
      const armLGroup = new THREE.Group();
      armLGroup.position.set(-0.25, 1.45, 0);
      armLGroup.name = "armL";
      const armLMesh = new THREE.Mesh(armGeo, skinMat);
      armLMesh.rotation.x = -Math.PI / 2; 
      armLMesh.position.z = 0.5;
      const handL = new THREE.Mesh(handGeo, skinMat);
      handL.position.set(0, 0, 1.0);
      armLGroup.add(armLMesh);
      armLGroup.add(handL);
      armLGroup.rotation.x = Math.PI / 2.5; 
      armLGroup.rotation.y = -0.1;
      group.add(armLGroup);

      const armRGroup = new THREE.Group();
      armRGroup.position.set(0.25, 1.45, 0);
      armRGroup.name = "armR";
      const armRMesh = new THREE.Mesh(armGeo, skinMat);
      armRMesh.rotation.x = -Math.PI / 2;
      armRMesh.position.z = 0.5;
      const handR = new THREE.Mesh(handGeo, skinMat);
      handR.position.set(0, 0, 1.0);
      armRGroup.add(armRMesh);
      armRGroup.add(handR);
      armRGroup.rotation.x = Math.PI / 2.5;
      armRGroup.rotation.y = 0.1;
      group.add(armRGroup);
      
      const shadowGeo = new THREE.CircleGeometry(0.5, 32);
      const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6 });
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.02; 
      pivot.add(shadow);

      return pivot;
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    if (!mountRef.current) return;
    
    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505); 
    scene.fog = new THREE.FogExp2(0x050505, 0.15); 
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.rotation.order = 'YXZ'; 
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace; 
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); 
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffee, 8, 30, Math.PI / 4, 0.4, 1);
    spotLight.position.set(0, 0, 0);
    spotLight.target.position.set(0, 0, -1);
    camera.add(spotLight);
    camera.add(spotLight.target);
    scene.add(camera);

    const playerLight = new THREE.PointLight(0xffaa00, 0.4, 6);
    camera.add(playerLight);
    scene.add(camera);

    // Audio
    footstepsRef.current = new Audio(SOUNDS.FOOTSTEPS);
    footstepsRef.current.loop = true;
    footstepsRef.current.volume = 0.4;

    const handleResize = () => {
        if (!cameraRef.current || !rendererRef.current) return;
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
        renderer.dispose();
        if (footstepsRef.current) footstepsRef.current.pause();
    };
  }, []);

  // --- LEVEL LOADING ---
  useEffect(() => {
    if(!sceneRef.current) return;
    const scene = sceneRef.current;

    wallsRef.current.forEach(mesh => {
        scene.remove(mesh);
        if(mesh.geometry) mesh.geometry.dispose();
    });
    wallsRef.current = [];
    
    Object.values(doorMeshesRef.current).forEach(mesh => scene.remove(mesh));
    doorMeshesRef.current = {};
    Object.values(itemMeshesRef.current).forEach(mesh => scene.remove(mesh));
    itemMeshesRef.current = {};
    if(floorMeshRef.current) scene.remove(floorMeshRef.current);
    if(ceilingMeshRef.current) scene.remove(ceilingMeshRef.current);
    if(slendrinaGroupRef.current) scene.remove(slendrinaGroupRef.current);

    const levelData = generateLevel(level);
    mapRef.current = levelData.map;
    itemsRef.current = JSON.parse(JSON.stringify(levelData.items)); 
    
    if (cameraRef.current) {
        cameraRef.current.position.set(levelData.startPlayer.x, 1.6, levelData.startPlayer.y);
        cameraRef.current.rotation.set(0, levelData.startPlayer.dir, 0);
    }

    const loader = new THREE.TextureLoader();
    const wallTexUrl = level === 3 ? TEXTURES.BOOKSHELF : TEXTURES.WALL;
    const wallTex = loader.load(wallTexUrl);
    const doorTex = loader.load(TEXTURES.DOOR);
    const doorLockedTex = loader.load(TEXTURES.DOOR_LOCKED);
    const exitTex = loader.load(TEXTURES.EXIT);
    const floorTex = loader.load(TEXTURES.FLOOR);
    const ceilingTex = loader.load(TEXTURES.CEILING);
    
    [wallTex, doorTex, doorLockedTex, exitTex, floorTex, ceilingTex].forEach(t => { 
        t.colorSpace = THREE.SRGBColorSpace;
        t.magFilter = THREE.NearestFilter; 
        t.minFilter = THREE.NearestFilter; 
    });

    const mapH = mapRef.current.length;
    const mapW = mapRef.current[0].length;
    floorTex.wrapS = THREE.RepeatWrapping; floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(mapW / 2, mapH / 2);
    ceilingTex.wrapS = THREE.RepeatWrapping; ceilingTex.wrapT = THREE.RepeatWrapping;
    ceilingTex.repeat.set(mapW / 4, mapH / 4);

    const wallGeo = new THREE.BoxGeometry(1, 3, 1);
    const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.8, metalness: 0.1 });
    
    const floorGeo = new THREE.PlaneGeometry(mapW, mapH);
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9, metalness: 0.1 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(mapW/2, 0, mapH/2);
    scene.add(floorMesh);
    floorMeshRef.current = floorMesh;

    const ceilingMat = new THREE.MeshStandardMaterial({ map: ceilingTex, roughness: 1.0, color: 0x888888 });
    const ceilingMesh = new THREE.Mesh(floorGeo, ceilingMat);
    ceilingMesh.rotation.x = Math.PI / 2;
    ceilingMesh.position.set(mapW/2, 3, mapH/2);
    scene.add(ceilingMesh);
    ceilingMeshRef.current = ceilingMesh;

    for (let z = 0; z < mapH; z++) {
        for (let x = 0; x < mapW; x++) {
            const cell = mapRef.current[z][x];
            const posX = x + 0.5; const posZ = z + 0.5;
            
            if (cell === CellType.WALL) {
                const mesh = new THREE.Mesh(wallGeo, wallMat);
                mesh.position.set(posX, 1.5, posZ);
                scene.add(mesh);
                wallsRef.current.push(mesh);
            } else if (cell === CellType.DOOR || cell === CellType.DOOR_LOCKED || cell === CellType.EXIT) {
                const dGeo = new THREE.BoxGeometry(1, 2.8, 0.1);
                let map = doorTex;
                if (cell === CellType.DOOR_LOCKED) map = doorLockedTex;
                if (cell === CellType.EXIT) map = exitTex;
                
                const mat = new THREE.MeshStandardMaterial({ map: map, roughness: 0.5 });
                const dMesh = new THREE.Mesh(dGeo, mat);
                dMesh.position.set(posX, 1.4, posZ);
                const left = (x > 0) ? mapRef.current[z][x-1] : 0;
                const right = (x < mapW - 1) ? mapRef.current[z][x+1] : 0;
                if (!(left === CellType.WALL || right === CellType.WALL)) dMesh.rotation.y = Math.PI / 2;
                
                const initialRot = dMesh.rotation.y;
                const initialPos = dMesh.position.clone();
                dMesh.userData = { type: 'door', x, z, state: cell, initialRot, initialPos };

                doorMeshesRef.current[`${x},${z}`] = dMesh;
                scene.add(dMesh);
            }
        }
    }

    itemsRef.current.forEach(item => {
        let mesh;
        if (item.type === 'book') mesh = createBookModel(item.id, item.x, item.y);
        else mesh = createKeyModel(item.id, item.x, item.y);
        itemMeshesRef.current[item.id] = mesh;
        scene.add(mesh);
    });

    const slendrinaGroup = createSlendrinaModel();
    slendrinaGroup.visible = false;
    slendrinaGroupRef.current = slendrinaGroup;
    scene.add(slendrinaGroup);

  }, [level]);

  // --- GAME LOOP & LOGIC ---

  useEffect(() => {
    const onLockChange = () => {
        if (document.pointerLockElement === null && gameState === GameState.PLAYING) {
            if (hpRef.current > 0) {
                setGameState(GameState.PAUSED);
            }
        }
    };
    document.addEventListener('pointerlockchange', onLockChange);
    return () => document.removeEventListener('pointerlockchange', onLockChange);
  }, [gameState, setGameState]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
        if (document.pointerLockElement === mountRef.current?.querySelector('canvas') && gameState === GameState.PLAYING) {
            if (cameraRef.current) {
                cameraRef.current.rotation.y -= e.movementX * 0.002;
                cameraRef.current.rotation.x -= e.movementY * 0.002;
                cameraRef.current.rotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, cameraRef.current.rotation.x));
            }
        }
    };
    const handleClick = () => {
        if (gameState === GameState.PLAYING) {
            if (hpRef.current <= 0) return;
            const canvas = mountRef.current?.querySelector('canvas');
            if (canvas && document.pointerLockElement !== canvas) {
                canvas.requestPointerLock();
            }
        }
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('click', handleClick);
    return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('click', handleClick);
    };
  }, [gameState]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
        keysPressed.current[e.code] = down;
        if (down && e.code === 'KeyE') handleInteract();
    };
    window.addEventListener('keydown', (e) => onKey(e, true));
    window.addEventListener('keyup', (e) => onKey(e, false));
    return () => { window.removeEventListener('keydown', () => {}); window.removeEventListener('keyup', () => {}); };
  }, [gameState]);

  useEffect(() => {
      if (gameState === GameState.ENDING) {
          document.exitPointerLock();
          endingStartTimeRef.current = performance.now();
          const audio = new Audio(SOUNDS.SCREAM);
          audio.volume = 1.0;
          audio.play().catch(() => {});
      }
  }, [gameState]);

  const handleInteract = () => {
      if (hpRef.current <= 0) return;
      if (gameState !== GameState.PLAYING || !cameraRef.current || !sceneRef.current) return;
      
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), cameraRef.current);
      
      const interactables: THREE.Object3D[] = [];
      Object.values(doorMeshesRef.current).forEach(m => interactables.push(m));
      Object.values(itemMeshesRef.current).forEach(m => { if (m.visible) interactables.push(m); });
      
      const intersects = raycaster.intersectObjects(interactables, true);
      
      if (intersects.length > 0) {
          const hit = intersects[0];
          if (hit.distance < INTERACTION_DIST + 0.5) {
              let obj = hit.object;
              while (obj.parent && obj.parent !== sceneRef.current && !obj.userData.type) {
                  obj = obj.parent;
              }

              if (obj.userData.type === 'door') {
                  const { x, z, state } = obj.userData;
                  if (state === CellType.DOOR) {
                      playDoorSound(false);
                      openDoor(x, z, obj as THREE.Mesh);
                  }
                  else if (state === CellType.DOOR_LOCKED && keysRef.current > 0) { 
                      keysRef.current--; 
                      setKeysCollected(keysRef.current); 
                      playDoorSound(true);
                      openDoor(x, z, obj as THREE.Mesh); 
                  }
                  else if (state === CellType.EXIT) {
                      if (booksRef.current >= 8) {
                          openDoor(x, z, obj as THREE.Mesh);
                          setGameState(GameState.ENDING);
                      } else {
                          playDoorSound(true);
                      }
                  }
              } else if (obj.userData.pickup) { 
                  const { id, type } = obj.userData;
                  obj.visible = false;
                  
                  const itemData = itemsRef.current.find(i => i.id === id);
                  if (itemData && !itemData.collected) {
                      itemData.collected = true;
                      if (type === 'book') { booksRef.current++; setBooksCollected(booksRef.current); }
                      else { keysRef.current++; setKeysCollected(keysRef.current); }
                  }
              }
          }
      }
  };

  const openDoor = (x: number, z: number, mesh: THREE.Mesh) => {
      mapRef.current[z][x] = CellType.DOOR_OPEN;
      mesh.userData.state = CellType.DOOR_OPEN;
      mesh.rotation.y += Math.PI / 2;
      mesh.position.add(new THREE.Vector3(0.4, 0, 0.4));
  };

  const animate = useCallback((time: number) => {
    if (gameState !== GameState.PLAYING && gameState !== GameState.ENDING) {
        lastTimeRef.current = 0;
        requestRef.current = requestAnimationFrame(animate);
        return;
    }
    if (lastTimeRef.current === 0) lastTimeRef.current = time;
    const dt = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;
    if (dt > 0.1) { requestRef.current = requestAnimationFrame(animate); return; }

    const cam = cameraRef.current;
    
    if (cam && gameState === GameState.PLAYING) {
        const moveSpeed = MOVEMENT_SPEED * dt;
        const forward = new THREE.Vector3(); const right = new THREE.Vector3();
        cam.getWorldDirection(forward); forward.y = 0; forward.normalize();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
        let moveVec = new THREE.Vector3();
        
        if (hpRef.current > 0) {
            if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) moveVec.add(forward);
            if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) moveVec.sub(forward);
            if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) moveVec.add(right);
            if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) moveVec.sub(right);
        }

        let moved = false;
        if (moveVec.length() > 0) {
            moveVec.normalize().multiplyScalar(moveSpeed);
            cam.position.y = 1.6 + Math.sin(time * 0.015) * 0.05; 
            
            const oldPos = cam.position.clone();
            const newPos = oldPos.clone().add(moveVec);
            
            const padding = 0.3;
            let checkX = Math.floor(newPos.x + Math.sign(moveVec.x) * padding);
            let checkZ = Math.floor(oldPos.z);
            let row = mapRef.current[checkZ];
            if (row && (row[checkX] <= 0 || row[checkX] === CellType.DOOR_OPEN)) {
                cam.position.x = newPos.x;
            }
            
            checkX = Math.floor(cam.position.x);
            checkZ = Math.floor(newPos.z + Math.sign(moveVec.z) * padding);
            row = mapRef.current[checkZ];
            if (row && (row[checkX] <= 0 || row[checkX] === CellType.DOOR_OPEN)) {
                cam.position.z = newPos.z;
            }

            if (cam.position.distanceToSquared(oldPos) > 0.000001) {
                moved = true;
            }
        } else {
             cam.position.y = THREE.MathUtils.lerp(cam.position.y, 1.6, 0.1);
        }

        if (moved && hpRef.current > 0) {
            if (footstepsRef.current?.paused) {
                footstepsRef.current.play().catch(() => {});
            }
        } else {
            if (footstepsRef.current && !footstepsRef.current.paused) {
                footstepsRef.current.pause();
                footstepsRef.current.currentTime = 0;
            }
        }
    }

    Object.values(itemMeshesRef.current).forEach(obj => {
        if (obj.visible) {
            obj.rotation.y += dt; 
            obj.position.y = 1.0 + Math.sin(time * 0.002) * 0.1; 
        }
    });

    if (gameState === GameState.ENDING && cam) {
        const pivot = slendrinaGroupRef.current;
        if (pivot) {
             pivot.visible = true;
             const bodyGroup = pivot.getObjectByName("bodyGroup");
             if(bodyGroup) bodyGroup.rotation.x = 0; 

             const forward = new THREE.Vector3();
             cam.getWorldDirection(forward);
             forward.y = 0; forward.normalize();
             
             const targetPos = cam.position.clone().add(forward.multiplyScalar(1.2));
             pivot.position.copy(targetPos);
             pivot.position.y = 0;
             pivot.lookAt(cam.position);
             
             const shake = 0.1;
             pivot.position.x += (Math.random() - 0.5) * shake;
             pivot.position.z += (Math.random() - 0.5) * shake;

             if (bodyGroup) {
                 const mouth = bodyGroup.getObjectByName("mouth");
                 if (mouth) mouth.scale.y = 6 + Math.sin(time * 0.1);
                 
                 const head = bodyGroup.getObjectByName("headGroup");
                 if (head) {
                     head.rotation.z = (Math.random() - 0.5) * 0.8; 
                 }
                 
                 const armL = bodyGroup.getObjectByName("armL");
                 const armR = bodyGroup.getObjectByName("armR");
                 if (armL) armL.rotation.x = -Math.PI / 1.5; 
                 if (armR) armR.rotation.x = -Math.PI / 1.5;
             }
        }
    } else {
        updateSlendrina(dt, time);
    }
    
    rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
    requestRef.current = requestAnimationFrame(animate);
  }, [gameState]);

  const updateSlendrina = (dt: number, time: number) => {
      const s = slendrinaDataRef.current;
      const pivot = slendrinaGroupRef.current; 
      const cam = cameraRef.current;
      if (!pivot || !cam) return;
      
      const bodyGroup = pivot.getObjectByName("bodyGroup");
      if (!bodyGroup) return;

      if (!s.active) {
          if (time >= nextSpawnTimeRef.current) {
              const mapH = mapRef.current.length; 
              const mapW = mapRef.current[0].length;
              let spawned = false;

              // Spawn logic
              for(let i=0; i<8; i++) {
                  const angle = Math.random() * Math.PI * 2;
                  const dist = 5 + Math.random() * 8; 
                  const tx = cam.position.x + Math.cos(angle) * dist;
                  const tz = cam.position.z + Math.sin(angle) * dist;
                  const mx = Math.floor(tx);
                  const mz = Math.floor(tz);

                  if (mx >= 0 && mx < mapW && mz >= 0 && mz < mapH) {
                      const cell = mapRef.current[mz][mx];
                      if (cell === CellType.EMPTY || cell === CellType.DOOR_OPEN) {
                          const camDir = new THREE.Vector3();
                          cam.getWorldDirection(camDir);
                          camDir.y = 0; camDir.normalize();
                          const toSpawn = new THREE.Vector3(tx - cam.position.x, 0, tz - cam.position.z).normalize();
                          const dot = camDir.dot(toSpawn);
                          
                          // Spawn mainly if not looking directly or if behind
                          if (dot < 0.6 || (level === 2 && Math.random() > 0.7)) {
                              s.x = tx; s.y = tz; s.active = true; s.spawnTime = time; s.isJumpscaring = false;
                              
                              // Reset Seen state on new spawn
                              s.lastSeenTime = 0;

                              pivot.position.set(tx, 0, tz); 
                              pivot.visible = true; 
                              spawned = true; 
                              pivot.lookAt(cam.position.x, 0, cam.position.z);
                              
                              // Level 2 Crawling
                              if (level === 2 && Math.random() < 0.3) {
                                  bodyGroup.rotation.x = -Math.PI / 2.5; 
                                  bodyGroup.position.y = 0.3; 
                              } else {
                                  bodyGroup.rotation.x = 0;
                                  bodyGroup.position.y = 0;
                              }
                              break;
                          }
                      }
                  }
              }
              
              if (spawned) nextSpawnTimeRef.current = time + 12000 + Math.random() * 8000;
              else nextSpawnTimeRef.current = time + 1000; 
          }
      } else {
          // --- ACTIVE SLENDRINA LOGIC ---
          const toModel = new THREE.Vector3().subVectors(pivot.position, cam.position);
          const dist = toModel.length();
          toModel.normalize();
          const camDir = new THREE.Vector3();
          cam.getWorldDirection(camDir);
          const dot = camDir.dot(toModel); 
          
          let visible = false;
          // In tunnels (narrow), visibility is easier
          // dot > 0.55 means roughly within 60 degree FOV
          if (dot > 0.55) visible = true; 

          // Raycast check for walls - Slendrina cannot be seen through walls
          if (visible) {
             const raycaster = new THREE.Raycaster(cam.position, toModel, 0, dist);
             const intersects = raycaster.intersectObjects(wallsRef.current, false);
             if (intersects.length > 0) {
                 // Blocked by wall
                 visible = false;
             }
          }

          // ALWAYS FACE PLAYER
          pivot.lookAt(cam.position.x, 0, cam.position.z);
          
          const headGroup = bodyGroup.getObjectByName("headGroup");
          if (headGroup) {
              // Ensure head looks at camera vertically (pitch)
              // This makes her stare directly into your soul
              headGroup.rotation.y = 0; // Lock Y
              headGroup.rotation.z = 0; 
              
              // Simple pitch calculation roughly
              const dy = cam.position.y - (pivot.position.y + 1.7); // Head height approx 1.7
              const pitch = -Math.atan2(dy, dist);
              headGroup.rotation.x = pitch; 
          }

          const armL = bodyGroup.getObjectByName("armL");
          const armR = bodyGroup.getObjectByName("armR");
          const mouth = bodyGroup.getObjectByName("mouth");
          
          const isCrawling = level === 2 && bodyGroup.rotation.x < -0.5;

          if (!isCrawling) {
             bodyGroup.position.y = Math.sin(time * 0.002) * 0.05; 
          } else {
             bodyGroup.position.y = 0.3 + Math.abs(Math.sin(time * 0.01)) * 0.05;
          }

          if (visible) {
              // PLAYER SEES HER
              s.lastSeenTime = time; // Mark as currently seen

              // Player is looking at her
              if (!s.isJumpscaring && dist < 12) { // Increased distance slightly
                   s.isJumpscaring = true;
              }
              if (s.isJumpscaring) {
                 const vibration = 0.08;
                 pivot.position.x += (Math.random() - 0.5) * vibration;
                 pivot.position.z += (Math.random() - 0.5) * vibration;
                 pivot.translateZ(dt * 1.5); 
              }

              let damageRate = 20;
              if (difficulty === Difficulty.EASY) damageRate = 12.5;
              if (difficulty === Difficulty.MEDIUM) damageRate = 20;
              if (difficulty === Difficulty.HARD) damageRate = 50;

              if (!isCrawling) {
                  hpRef.current -= damageRate * dt; 
                  setHealth(hpRef.current);
                  
                  if (hpRef.current <= 0) {
                      document.exitPointerLock();
                      onGameOver();
                  }
              }
              
              if (armL) armL.rotation.x = -Math.PI / 2 + Math.sin(time * 10) * 0.2;
              if (armR) armR.rotation.x = -Math.PI / 2 + Math.cos(time * 10) * 0.2;
              if (mouth) mouth.scale.y = 5 + Math.random();

          } else {
              // PLAYER TURNED AROUND (Not Looking)
              
              // DESPAWN MECHANIC:
              // If she was seen (lastSeenTime > 0) and now player has turned away quickly, 
              // she should disappear.
              // We give a tiny grace period (200ms) to allow for quick glitches/mouse flicks 
              // without accidental despawns, but effectively "Turning Around Fast" triggers this.
              
              if (s.lastSeenTime > 0 && (time - s.lastSeenTime > 200)) {
                  // Despawn
                  s.active = false;
                  pivot.visible = false;
                  s.isJumpscaring = false;
                  // Set next spawn to happen in 5-10 seconds
                  nextSpawnTimeRef.current = time + 5000 + Math.random() * 5000;
                  s.lastSeenTime = 0; 
              }
              
              // Reset pose if waiting to be seen or in grace period
              if (headGroup) {
                  headGroup.rotation.x = 0;
              }
              if (armL) armL.rotation.x = Math.PI / 2.5;
              if (armR) armR.rotation.x = Math.PI / 2.5;
              if (mouth) mouth.scale.y = 1;
          }

          // Timeout if active too long without interaction
          if (time - s.spawnTime > 20000 || dist > 35) {
              s.active = false; pivot.visible = false; s.isJumpscaring = false;
              s.lastSeenTime = 0;
          }
      }
  };

  useEffect(() => { requestRef.current = requestAnimationFrame(animate); return () => cancelAnimationFrame(requestRef.current); }, [animate]);
  
  useEffect(() => {
      if (gameState === GameState.MENU) {
          keysRef.current = 0; booksRef.current = 0; hpRef.current = 100;
          slendrinaDataRef.current.active = false; slendrinaDataRef.current.isJumpscaring = false;
          nextSpawnTimeRef.current = performance.now() + 10000;
          
          Object.values(itemMeshesRef.current).forEach(mesh => mesh.visible = true);
          Object.values(doorMeshesRef.current).forEach(mesh => {
              const { x, z } = mesh.userData;
              mesh.userData.state = mapRef.current[z][x];
              if (mesh.userData.initialPos) mesh.position.copy(mesh.userData.initialPos);
              if (mesh.userData.initialRot !== undefined) mesh.rotation.y = mesh.userData.initialRot;
          });
          if (slendrinaGroupRef.current) slendrinaGroupRef.current.visible = false;
      }
  }, [gameState]);

  return <div ref={mountRef} className="fixed inset-0 w-full h-full" />;
};

export default Game;