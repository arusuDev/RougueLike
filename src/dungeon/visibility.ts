// 視界計算（Shadowcasting アルゴリズム）

import type { DungeonFloor, Position } from '../types';
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

// シンプルなレイキャスティングによる視界計算
export function computeVisibility(floor: DungeonFloor, playerPos: Position): void {
    resetVisibility(floor);

    const { x: px, y: py } = playerPos;

    // プレイヤーの位置は常に見える
    setVisible(floor, px, py);

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
