// 敵AI（A*パスファインディング付き）

import type { Enemy, Position, DungeonFloor } from '../types';
import { TileType } from '../types';
import { MAP_WIDTH, MAP_HEIGHT } from '../constants';

// A*ノード
interface PathNode {
    x: number;
    y: number;
    g: number; // スタートからのコスト
    h: number; // ゴールまでの推定コスト
    f: number; // 総コスト
    parent: PathNode | null;
}

// マンハッタン距離
function heuristic(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
}

// 移動可能かチェック
function isWalkable(
    floor: DungeonFloor,
    x: number,
    y: number,
    enemies: Enemy[],
    playerPos: Position
): boolean {
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) {
        return false;
    }
    if (floor.tiles[y][x].type === TileType.Wall) {
        return false;
    }
    // プレイヤーの位置は通過可能（攻撃するため）
    if (x === playerPos.x && y === playerPos.y) {
        return true;
    }
    // 他の敵がいる場合は通過不可
    for (const enemy of enemies) {
        if (enemy.position.x === x && enemy.position.y === y) {
            return false;
        }
    }
    return true;
}

// A*パスファインディング
export function findPath(
    floor: DungeonFloor,
    start: Position,
    goal: Position,
    enemies: Enemy[]
): Position[] {
    const openList: PathNode[] = [];
    const closedSet = new Set<string>();

    const startNode: PathNode = {
        x: start.x,
        y: start.y,
        g: 0,
        h: heuristic(start.x, start.y, goal.x, goal.y),
        f: 0,
        parent: null,
    };
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);

    const directions = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
    ];

    while (openList.length > 0) {
        // 最小fのノードを選択
        openList.sort((a, b) => a.f - b.f);
        const current = openList.shift()!;
        const currentKey = `${current.x},${current.y}`;

        if (current.x === goal.x && current.y === goal.y) {
            // パスを再構築
            const path: Position[] = [];
            let node: PathNode | null = current;
            while (node) {
                path.unshift({ x: node.x, y: node.y });
                node = node.parent;
            }
            return path;
        }

        closedSet.add(currentKey);

        for (const dir of directions) {
            const nx = current.x + dir.x;
            const ny = current.y + dir.y;
            const neighborKey = `${nx},${ny}`;

            if (closedSet.has(neighborKey)) continue;
            if (!isWalkable(floor, nx, ny, enemies, goal)) continue;

            const g = current.g + 1;
            const h = heuristic(nx, ny, goal.x, goal.y);
            const f = g + h;

            const existingNode = openList.find((n) => n.x === nx && n.y === ny);
            if (existingNode) {
                if (g < existingNode.g) {
                    existingNode.g = g;
                    existingNode.f = f;
                    existingNode.parent = current;
                }
            } else {
                openList.push({
                    x: nx,
                    y: ny,
                    g,
                    h,
                    f,
                    parent: current,
                });
            }
        }
    }

    return []; // パスが見つからない
}

// 敵の行動を決定
export function decideEnemyAction(
    enemy: Enemy,
    playerPos: Position,
    floor: DungeonFloor,
    enemies: Enemy[]
): Position | null {
    const { x: ex, y: ey } = enemy.position;
    const { x: px, y: py } = playerPos;

    // プレイヤーとの距離
    const dist = Math.abs(px - ex) + Math.abs(py - ey);

    // 隣接していたら攻撃（移動しない）
    if (dist === 1) {
        return null; // 攻撃する（移動なし）
    }

    // 視界範囲内（8マス）ならプレイヤーを追跡
    if (dist <= 8) {
        const path = findPath(floor, enemy.position, playerPos, enemies);
        if (path.length > 1) {
            // path[0]は現在位置、path[1]が次の位置
            return path[1];
        }
    }

    // 視界外ならランダム移動
    const directions = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
    ];
    const shuffled = directions.sort(() => Math.random() - 0.5);

    for (const dir of shuffled) {
        const nx = ex + dir.x;
        const ny = ey + dir.y;
        if (isWalkable(floor, nx, ny, enemies, playerPos)) {
            // プレイヤーの位置には移動しない
            if (nx !== px || ny !== py) {
                return { x: nx, y: ny };
            }
        }
    }

    return null; // 移動不可
}
