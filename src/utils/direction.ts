// 方向ユーティリティ

import type { Direction, Position } from '../types';

/**
 * 各方向に対応する移動差分
 */
export const DIRECTION_DELTA: Record<Direction, Position> = {
    'up':         { x:  0, y: -1 },
    'down':       { x:  0, y:  1 },
    'left':       { x: -1, y:  0 },
    'right':      { x:  1, y:  0 },
    'up-left':    { x: -1, y: -1 },
    'up-right':   { x:  1, y: -1 },
    'down-left':  { x: -1, y:  1 },
    'down-right': { x:  1, y:  1 },
};

/**
 * 全方向の差分ベクトル配列（AI等のイテレーション用）
 */
export const ALL_DIRECTION_DELTAS: ReadonlyArray<Position> = Object.values(DIRECTION_DELTA);

/**
 * Direction → {dx, dy} 変換
 */
export function directionToDelta(direction: Direction): Position {
    return DIRECTION_DELTA[direction];
}

/**
 * {dx, dy} → Direction 変換
 * 該当なしの場合はfallbackを返す（デフォルト: 'down'）
 */
export function deltaToDirection(dx: number, dy: number, fallback: Direction = 'down'): Direction {
    // dx, dy を -1〜1 に正規化
    const nx = Math.sign(dx);
    const ny = Math.sign(dy);

    for (const [dir, delta] of Object.entries(DIRECTION_DELTA)) {
        if (delta.x === nx && delta.y === ny) {
            return dir as Direction;
        }
    }
    return fallback;
}
