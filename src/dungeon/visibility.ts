// 視界計算（部屋全体表示 + 通路はレイキャスティング）

import type { DungeonFloor, Position, Room } from '../types';
import { TileType } from '../types';
import { MAP_WIDTH, MAP_HEIGHT, SIGHT_RANGE } from '../constants';

// 視界をリセット
export function resetVisibility(floor: DungeonFloor): void {
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            floor.tiles[y][x].visible = false;
        }
    }
}

// タイルを可視化
function setVisible(floor: DungeonFloor, x: number, y: number): void {
    if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
        floor.tiles[y][x].visible = true;
        floor.tiles[y][x].explored = true;
    }
}

// 壁かどうかチェック
function isBlocking(floor: DungeonFloor, x: number, y: number): boolean {
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) {
        return true;
    }
    return floor.tiles[y][x].type === TileType.Wall;
}

// 距離計算
function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// プレイヤーがどの部屋にいるかを判定
function findPlayerRoom(floor: DungeonFloor, playerPos: Position): Room | null {
    for (const room of floor.rooms) {
        // 部屋の範囲内（壁を含む）かチェック
        if (
            playerPos.x >= room.x &&
            playerPos.x < room.x + room.width &&
            playerPos.y >= room.y &&
            playerPos.y < room.y + room.height
        ) {
            return room;
        }
    }
    return null;
}

// 部屋全体を可視化（壁も含む）
function revealRoom(floor: DungeonFloor, room: Room): void {
    // 部屋の内部を可視化
    for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
            setVisible(floor, x, y);
        }
    }

    // 部屋の周囲の壁も可視化（部屋を囲む壁を見せる）
    for (let x = room.x - 1; x <= room.x + room.width; x++) {
        setVisible(floor, x, room.y - 1); // 上の壁
        setVisible(floor, x, room.y + room.height); // 下の壁
    }
    for (let y = room.y - 1; y <= room.y + room.height; y++) {
        setVisible(floor, room.x - 1, y); // 左の壁
        setVisible(floor, room.x + room.width, y); // 右の壁
    }
}

// 視界計算：部屋にいる場合は部屋全体、通路ではレイキャスティング
export function computeVisibility(floor: DungeonFloor, playerPos: Position): void {
    resetVisibility(floor);

    const { x: px, y: py } = playerPos;

    // プレイヤーの位置は常に見える
    setVisible(floor, px, py);

    // プレイヤーが部屋の中にいるかチェック
    const currentRoom = findPlayerRoom(floor, playerPos);

    if (currentRoom) {
        // 部屋の中にいる場合：部屋全体を表示
        revealRoom(floor, currentRoom);

        // 部屋の入り口（通路との接続部分）から少し先も見えるようにする
        // 通路方向へのレイキャスティング
        castRaysFromRoom(floor, currentRoom);
    }

    // 通常のレイキャスティング（通路にいる場合や、部屋から出口を見る場合）
    castRays(floor, playerPos);
}

// 部屋の出口から通路方向へのレイキャスティング
function castRaysFromRoom(floor: DungeonFloor, room: Room): void {
    // 部屋の四辺をスキャンして、通路（床）につながっている場所を見つける
    const exits: Position[] = [];

    // 上辺
    for (let x = room.x; x < room.x + room.width; x++) {
        if (room.y - 1 >= 0 && floor.tiles[room.y - 1][x].type !== TileType.Wall) {
            exits.push({ x, y: room.y - 1 });
        }
    }
    // 下辺
    for (let x = room.x; x < room.x + room.width; x++) {
        if (room.y + room.height < MAP_HEIGHT && floor.tiles[room.y + room.height][x].type !== TileType.Wall) {
            exits.push({ x, y: room.y + room.height });
        }
    }
    // 左辺
    for (let y = room.y; y < room.y + room.height; y++) {
        if (room.x - 1 >= 0 && floor.tiles[y][room.x - 1].type !== TileType.Wall) {
            exits.push({ x: room.x - 1, y });
        }
    }
    // 右辺
    for (let y = room.y; y < room.y + room.height; y++) {
        if (room.x + room.width < MAP_WIDTH && floor.tiles[y][room.x + room.width].type !== TileType.Wall) {
            exits.push({ x: room.x + room.width, y });
        }
    }

    // 各出口から少し先を可視化
    for (const exit of exits) {
        setVisible(floor, exit.x, exit.y);

        // 出口から外向きにレイを飛ばす
        const dx = exit.x < room.x ? -1 : exit.x >= room.x + room.width ? 1 : 0;
        const dy = exit.y < room.y ? -1 : exit.y >= room.y + room.height ? 1 : 0;

        for (let i = 1; i <= 3; i++) {
            const nx = exit.x + dx * i;
            const ny = exit.y + dy * i;

            if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) break;

            setVisible(floor, nx, ny);

            if (isBlocking(floor, nx, ny)) break;
        }
    }
}

// 通常のレイキャスティング
function castRays(floor: DungeonFloor, playerPos: Position): void {
    const { x: px, y: py } = playerPos;

    // 360度をスキャン
    const rayCount = 360;
    for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * 2 * Math.PI;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);

        // レイを伸ばす
        for (let dist = 1; dist <= SIGHT_RANGE; dist++) {
            const x = Math.round(px + dx * dist);
            const y = Math.round(py + dy * dist);

            if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) {
                break;
            }

            // 視界範囲内かチェック
            if (distance(px, py, x, y) > SIGHT_RANGE) {
                break;
            }

            setVisible(floor, x, y);

            // 壁に当たったら止まる
            if (isBlocking(floor, x, y)) {
                break;
            }
        }
    }
}

// 位置が視界内かチェック
export function isVisible(floor: DungeonFloor, pos: Position): boolean {
    if (pos.x < 0 || pos.x >= MAP_WIDTH || pos.y < 0 || pos.y >= MAP_HEIGHT) {
        return false;
    }
    return floor.tiles[pos.y][pos.x].visible;
}

// 位置が探索済みかチェック
export function isExplored(floor: DungeonFloor, pos: Position): boolean {
    if (pos.x < 0 || pos.x >= MAP_WIDTH || pos.y < 0 || pos.y >= MAP_HEIGHT) {
        return false;
    }
    return floor.tiles[pos.y][pos.x].explored;
}
