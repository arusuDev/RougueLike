// ゲーム定数

// マップサイズ
export const MAP_WIDTH = 50;
export const MAP_HEIGHT = 35;

// タイルサイズ（ピクセル）
export const TILE_SIZE = 20;

// プレイヤー視界範囲
export const SIGHT_RANGE = 6;

// 初期プレイヤーステータス
export const INITIAL_PLAYER_STATS = {
    hp: 30,
    maxHp: 30,
    attack: 5,
    defense: 2,
    level: 1,
    exp: 0,
    expToNext: 10,
};

// 敵のステータス定義
export const ENEMY_STATS = {
    slime: {
        name: 'スライム',
        hp: 8,
        attack: 3,
        defense: 0,
        expReward: 3,
    },
    goblin: {
        name: 'ゴブリン',
        hp: 15,
        attack: 5,
        defense: 1,
        expReward: 8,
    },
    skeleton: {
        name: 'スケルトン',
        hp: 20,
        attack: 7,
        defense: 2,
        expReward: 15,
    },
};

// アイテム定義
export const ITEM_STATS = {
    potion: {
        name: '回復薬',
        effect: 15,
    },
    weapon: {
        name: '短剣',
        effect: 3,
    },
    scroll: {
        name: '炎の巻物',
        effect: 20,
    },
};

// ダンジョン生成パラメータ
export const DUNGEON_PARAMS = {
    minRoomSize: 4,
    maxRoomSize: 10,
    maxRooms: 12,
    minEnemiesPerFloor: 3,
    maxEnemiesPerFloor: 8,
    minItemsPerFloor: 2,
    maxItemsPerFloor: 5,
};

// タイルカラー（ピクセルアート風）
export const TILE_COLORS = {
    wall: '#2d2d3a',
    wallBorder: '#1a1a24',
    floor: '#4a4a5e',
    floorDark: '#35354a',
    stairs: '#6b8e23',
    stairsGlow: '#9acd32',
    unexplored: '#0a0a10',
    foggy: 'rgba(10, 10, 16, 0.7)',
};

// エンティティカラー
export const ENTITY_COLORS = {
    player: '#00ff88',
    playerBorder: '#00cc66',
    slime: '#44aaff',
    goblin: '#ff6644',
    skeleton: '#e8e8e8',
    item: '#ffdd44',
    itemGlow: '#ffee88',
};

// メッセージ最大保持数
export const MAX_MESSAGES = 50;

// レベルアップに必要な経験値（レベルごと）
export const EXP_TABLE = [
    0,    // Lv1
    10,   // Lv2
    25,   // Lv3
    50,   // Lv4
    90,   // Lv5
    150,  // Lv6
    230,  // Lv7
    340,  // Lv8
    480,  // Lv9
    650,  // Lv10
];

// レベルアップ時のステータス上昇
export const LEVEL_UP_BONUS = {
    hp: 5,
    attack: 1,
    defense: 1,
};
