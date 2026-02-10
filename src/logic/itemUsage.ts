// アイテム使用ロジック

import type {
    GameState,
    Player,
    Enemy,
} from '../types';

export interface ItemUseResult {
    player: Player;
    enemies: Enemy[];
    messages: string[];
}

/**
 * アイテムを使用する（純粋ロジック）
 */
export function processItemUse(
    itemIndex: number,
    state: GameState,
): ItemUseResult | null {
    if (!state.player) return null;

    const { player, enemies } = state;
    const item = player.inventory[itemIndex];
    if (!item) return null;

    const messages: string[] = [];
    const newInventory = player.inventory.filter((_, i) => i !== itemIndex);

    switch (item.kind) {
        case 'potion': {
            const healAmount = Math.min(item.effect, player.maxHp - player.hp);
            const newHp = player.hp + healAmount;
            messages.push(`${item.name}を使った！HPが${healAmount}回復した！`);

            return {
                player: { ...player, hp: newHp, inventory: newInventory },
                enemies,
                messages,
            };
        }

        case 'scroll': {
            // 炎の巻物：周囲の敵にダメージ
            let hitCount = 0;
            const newEnemies = enemies
                .map((e) => {
                    const dist =
                        Math.abs(e.position.x - player.position.x) +
                        Math.abs(e.position.y - player.position.y);
                    if (dist <= 3) {
                        hitCount++;
                        return { ...e, hp: e.hp - item.effect };
                    }
                    return e;
                })
                .filter((e) => e.hp > 0);

            messages.push(
                `${item.name}を使った！${hitCount}体の敵に${item.effect}のダメージ！`,
            );

            return {
                player: { ...player, inventory: newInventory },
                enemies: newEnemies,
                messages,
            };
        }

        default:
            return null;
    }
}
