export enum GameState {
  MENU = 'MENU',
  LEVEL_SELECT = 'LEVEL_SELECT',
  DIFFICULTY_SELECT = 'DIFFICULTY_SELECT',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
  ENDING = 'ENDING'
}

export enum CellType {
  EMPTY = 0,
  WALL = 1,
  DOOR = 2,
  DOOR_OPEN = 3,
  DOOR_LOCKED = 4,
  EXIT = 9
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface Item {
  type: 'book' | 'key';
  x: number;
  y: number;
  id: string;
  collected: boolean;
}

export interface Player {
  x: number;
  y: number;
  dir: number; // Angle in radians
  plane: { x: number; y: number }; // Camera plane for FOV
}

export interface Entity {
  x: number;
  y: number;
  active: boolean;
  texture: string;
  lastSeenTime: number;
  spawnTime: number;
  isJumpscaring?: boolean;
}