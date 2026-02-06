// 32x32 ピクセルアート定義
// 0: 透明, 1: メイン色, 2: サブ色/目

import {
    slime,
    goblin,
    skeleton,
    zombie,
    bat,
    salamander,
    gigaSalamander
} from './sprites/enemies';

export const ENEMY_SPRITES: Record<string, number[][]> = {
    slime,
    goblin,
    skeleton,
    zombie,
    bat,
    salamander,
    gigaSalamander
};
