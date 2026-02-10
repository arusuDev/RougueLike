// ダンジョン生成アルゴリズム（BSP + ランダム接続）

import type { Tile, Room, DungeonFloor, Position } from '../types';
import { TileType } from '../types';
import { MAP_WIDTH, MAP_HEIGHT, DUNGEON_PARAMS } from '../constants';
import { randomInt } from '../utils/random';

// 空のマップを生成（全て壁）
function createEmptyMap(): Tile[][] {
    const tiles: Tile[][] = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        tiles[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            tiles[y][x] = {
                type: TileType.Wall,
                visible: false,
                explored: false,
            };
        }
    }
    return tiles;
}

// 部屋を掘る
function carveRoom(tiles: Tile[][], room: Room): void {
    for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
            if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) {
                tiles[y][x].type = TileType.Floor;
            }
        }
    }
}

// 水平通路を掘る
function carveHorizontalTunnel(tiles: Tile[][], x1: number, x2: number, y: number): void {
    const startX = Math.min(x1, x2);
    const endX = Math.max(x1, x2);
    for (let x = startX; x <= endX; x++) {
        if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) {
            tiles[y][x].type = TileType.Floor;
        }
    }
}

// 垂直通路を掘る
function carveVerticalTunnel(tiles: Tile[][], y1: number, y2: number, x: number): void {
    const startY = Math.min(y1, y2);
    const endY = Math.max(y1, y2);
    for (let y = startY; y <= endY; y++) {
        if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) {
            tiles[y][x].type = TileType.Floor;
        }
    }
}

// 2つの部屋を接続
function connectRooms(tiles: Tile[][], room1: Room, room2: Room): void {
    const x1 = room1.centerX;
    const y1 = room1.centerY;
    const x2 = room2.centerX;
    const y2 = room2.centerY;

    // 50%の確率でL字の向きを変える
    if (Math.random() < 0.5) {
        carveHorizontalTunnel(tiles, x1, x2, y1);
        carveVerticalTunnel(tiles, y1, y2, x2);
    } else {
        carveVerticalTunnel(tiles, y1, y2, x1);
        carveHorizontalTunnel(tiles, x1, x2, y2);
    }
}

// 部屋が重なっているかチェック
function roomsOverlap(room1: Room, room2: Room, padding: number = 1): boolean {
    return (
        room1.x - padding < room2.x + room2.width + padding &&
        room1.x + room1.width + padding > room2.x - padding &&
        room1.y - padding < room2.y + room2.height + padding &&
        room1.y + room1.height + padding > room2.y - padding
    );
}

// 部屋を生成
function generateRooms(): Room[] {
    const rooms: Room[] = [];
    const { minRoomSize, maxRoomSize, maxRooms } = DUNGEON_PARAMS;

    for (let i = 0; i < maxRooms * 3; i++) {
        if (rooms.length >= maxRooms) break;

        const width = randomInt(minRoomSize, maxRoomSize);
        const height = randomInt(minRoomSize, maxRoomSize);
        const x = randomInt(1, MAP_WIDTH - width - 1);
        const y = randomInt(1, MAP_HEIGHT - height - 1);

        const newRoom: Room = {
            x,
            y,
            width,
            height,
            centerX: Math.floor(x + width / 2),
            centerY: Math.floor(y + height / 2),
        };

        // 他の部屋と重ならないかチェック
        let overlaps = false;
        for (const room of rooms) {
            if (roomsOverlap(newRoom, room, 2)) {
                overlaps = true;
                break;
            }
        }

        if (!overlaps) {
            rooms.push(newRoom);
        }
    }

    return rooms;
}

// ダンジョンフロアを生成
export function generateDungeon(floorNumber: number): DungeonFloor {
    const tiles = createEmptyMap();
    const rooms = generateRooms();

    // 部屋を掘る
    for (const room of rooms) {
        carveRoom(tiles, room);
    }

    // 部屋を接続（隣接する部屋同士を接続）
    for (let i = 1; i < rooms.length; i++) {
        connectRooms(tiles, rooms[i - 1], rooms[i]);
    }

    // 階段を最後の部屋に配置
    const lastRoom = rooms[rooms.length - 1];
    const stairsPosition: Position = {
        x: lastRoom.centerX,
        y: lastRoom.centerY,
    };
    tiles[stairsPosition.y][stairsPosition.x].type = TileType.Stairs;

    return {
        level: floorNumber,
        tiles,
        rooms,
        stairsPosition,
    };
}

// 部屋内のランダムな床位置を取得
export function getRandomFloorPosition(floor: DungeonFloor): Position | null {
    const floorTiles: Position[] = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (floor.tiles[y][x].type === TileType.Floor) {
                floorTiles.push({ x, y });
            }
        }
    }

    if (floorTiles.length === 0) return null;
    return floorTiles[randomInt(0, floorTiles.length - 1)];
}

// 特定の部屋内のランダムな床位置を取得
export function getRandomPositionInRoom(_floor: DungeonFloor, room: Room): Position {
    const x = randomInt(room.x + 1, room.x + room.width - 2);
    const y = randomInt(room.y + 1, room.y + room.height - 2);
    return { x, y };
}

// プレイヤーのスタート位置を取得（最初の部屋の中央）
export function getPlayerStartPosition(floor: DungeonFloor): Position {
    const firstRoom = floor.rooms[0];
    return {
        x: firstRoom.centerX,
        y: firstRoom.centerY,
    };
}
