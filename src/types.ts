// ゲーム全体で使用する型定義

// 座標
export interface Position {
  x: number;
  y: number;
}

// 方向
export type Direction = 'up' | 'down' | 'left' | 'right';

// タイルの種類
export const TileType = {
  Wall: 0,
  Floor: 1,
  Stairs: 2,
} as const;

export type TileType = (typeof TileType)[keyof typeof TileType];

// マップタイル
export interface Tile {
  type: TileType;
  visible: boolean;   // 現在視界内か
  explored: boolean;  // 一度でも見たか
}

// エンティティの種類
export type EntityType = 'player' | 'enemy' | 'item';

// 基本エンティティ
export interface Entity {
  id: string;
  type: EntityType;
  position: Position;
}

// プレイヤー
export interface Player extends Entity {
  type: 'player';
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  level: number;
  exp: number;
  expToNext: number;
  inventory: Item[];
}

// 敵の種類
export type EnemyKind = 'slime' | 'goblin' | 'skeleton' | 'zombie' | 'bat';

// 敵
export interface Enemy extends Entity {
  type: 'enemy';
  kind: EnemyKind;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  expReward: number;
}

// アイテムの種類
export type ItemKind = 'potion' | 'weapon' | 'scroll';

// アイテム
export interface Item extends Entity {
  type: 'item';
  kind: ItemKind;
  name: string;
  effect: number; // 回復量や攻撃力など
}

// ダンジョンの部屋
export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

// ダンジョンフロア
export interface DungeonFloor {
  level: number;
  tiles: Tile[][];
  rooms: Room[];
  stairsPosition: Position;
}

// ゲームフェーズ
export type GamePhase = 'title' | 'playing' | 'inventory' | 'gameover';

// ゲーム全体の状態
export interface GameState {
  phase: GamePhase;
  floor: DungeonFloor | null;
  floorNumber: number;
  player: Player | null;
  enemies: Enemy[];
  items: Item[];
  messages: string[];
  turnCount: number;
  godMode: boolean;
}
