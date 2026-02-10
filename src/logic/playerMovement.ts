// プレイヤー移動・戦闘ロジック

import type {
    GameState,
    Player,
    Enemy,
    Item,
    Direction,
    Position,
} from '../types';
import { TileType } from '../types';
import {
    MAP_WIDTH,
    MAP_HEIGHT,
    EXP_TABLE,
    LEVEL_UP_BONUS,
} from '../constants';
import { computeVisibility } from '../dungeon/visibility';
import { directionToDelta } from '../utils/direction';

export interface MoveResult {
    player: Player;
    enemies: Enemy[];
    items: Item[];
    messages: string[];
    attackEffects: Array<{ position: Position; direction: Direction }>;
}

/**
 * プレイヤーの移動アクションを処理する（純粋ロジック）
 * 移動不可の場合はnullを返す
 */
export function processPlayerMove(
    direction: Direction,
    state: GameState,
): MoveResult | null {
    if (!state.player || !state.floor) return null;

    const { player, floor, enemies, items } = state;
    const { x, y } = player.position;

    // 移動先を計算
    const delta = directionToDelta(direction);
    const newX = x + delta.x;
    const newY = y + delta.y;

    // 範囲チェック
    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) {
        return null;
    }

    // 壁チェック
    if (floor.tiles[newY][newX].type === TileType.Wall) {
        return null;
    }

    const messages: string[] = [];
    const attackEffects: Array<{ position: Position; direction: Direction }> = [];

    // 敵がいるかチェック
    const targetEnemy = enemies.find(
        (e) => e.position.x === newX && e.position.y === newY,
    );

    if (targetEnemy) {
        return processAttack(player, targetEnemy, direction, enemies, items, messages, attackEffects);
    } else {
        return processMove(player, floor, enemies, items, direction, newX, newY, messages);
    }
}

function processAttack(
    player: Player,
    targetEnemy: Enemy,
    direction: Direction,
    enemies: Enemy[],
    items: Item[],
    messages: string[],
    attackEffects: Array<{ position: Position; direction: Direction }>,
): MoveResult {
    const damage = Math.max(1, player.attack - targetEnemy.defense);
    const updatedEnemy = { ...targetEnemy, hp: targetEnemy.hp - damage };

    attackEffects.push({ position: targetEnemy.position, direction });
    messages.push(`${targetEnemy.name}に${damage}のダメージ！`);

    if (updatedEnemy.hp <= 0) {
        // 敵を倒した
        messages.push(`${targetEnemy.name}を倒した！`);

        // 経験値獲得
        const newExp = player.exp + targetEnemy.expReward;
        let newPlayer = { ...player, exp: newExp, direction };

        // レベルアップチェック
        if (
            newPlayer.level < EXP_TABLE.length &&
            newExp >= EXP_TABLE[newPlayer.level]
        ) {
            newPlayer.level++;
            newPlayer.maxHp += LEVEL_UP_BONUS.hp;
            newPlayer.hp = newPlayer.maxHp;
            newPlayer.attack += LEVEL_UP_BONUS.attack;
            newPlayer.defense += LEVEL_UP_BONUS.defense;
            newPlayer.expToNext =
                EXP_TABLE[newPlayer.level] || EXP_TABLE[EXP_TABLE.length - 1];
            messages.push(`レベルアップ！レベル${newPlayer.level}になった！`);
        }

        return {
            player: newPlayer,
            enemies: enemies.filter((e) => e.id !== targetEnemy.id),
            items,
            messages,
            attackEffects,
        };
    } else {
        return {
            player: { ...player, direction },
            enemies: enemies.map((e) => (e.id === targetEnemy.id ? updatedEnemy : e)),
            items,
            messages,
            attackEffects,
        };
    }
}

function processMove(
    player: Player,
    floor: import('../types').DungeonFloor,
    enemies: Enemy[],
    items: Item[],
    direction: Direction,
    newX: number,
    newY: number,
    messages: string[],
): MoveResult {
    const newPosition: Position = { x: newX, y: newY };
    const newPlayer = { ...player, position: newPosition, direction };
    let newItems = items;

    // アイテムを拾う
    const pickedItem = items.find(
        (i) => i.position.x === newX && i.position.y === newY,
    );
    if (pickedItem) {
        newPlayer.inventory = [...newPlayer.inventory, pickedItem];
        messages.push(`${pickedItem.name}を拾った！`);
        newItems = items.filter((i) => i.id !== pickedItem.id);
    }

    // 階段チェック
    if (floor.tiles[newY][newX].type === TileType.Stairs) {
        messages.push('階段を降りますか？（Enterキー）');
    }

    // 視界を更新
    computeVisibility(floor, newPosition);

    return {
        player: newPlayer,
        enemies,
        items: newItems,
        messages,
        attackEffects: [],
    };
}
