export enum GameMode {
  MENU = 'MENU',
  PVP = 'PVP',     // Player vs Player
  PVC = 'PVC'      // Player vs Computer
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum PlayerColor {
  WHITE = 'w',
  BLACK = 'b'
}

export interface GameSettings {
  mode: GameMode;
  difficulty: Difficulty;
  timeControl: number; // in minutes
}

export interface GameState {
  winner: PlayerColor | 'draw' | null;
  gameOver: boolean;
  inCheck: boolean;
  turn: PlayerColor;
  history: string[];
}