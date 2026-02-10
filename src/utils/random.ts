// 乱数ユーティリティ

/**
 * min以上max以下の整数をランダムに返す
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
