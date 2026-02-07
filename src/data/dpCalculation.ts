// DP計算ユーティリティ

import type { Player, Item } from '../types';

// アイテムのDP価値定義
export const ITEM_DP_VALUES: Record<string, number> = {
    potion: 5,      // 回復薬
    scroll: 20,     // 巻物
    weapon: 10,     // 武器
};

// DP計算結果
export interface DPCalculationResult {
    expDP: number;           // 経験値からのDP
    itemDP: number;          // アイテムからのDP
    totalDP: number;         // 合計DP
    itemBreakdown: {         // アイテム内訳
        name: string;
        count: number;
        dpValue: number;
    }[];
}

// 経験値からDPを計算（経験値 ÷ 10、端数切り捨て）
export function calculateExpDP(player: Player): number {
    return Math.floor(player.exp / 10);
}

// アイテムからDPを計算
export function calculateItemDP(inventory: Item[]): { totalDP: number; breakdown: DPCalculationResult['itemBreakdown'] } {
    const itemCounts: Record<string, { count: number; name: string }> = {};

    for (const item of inventory) {
        if (!itemCounts[item.kind]) {
            itemCounts[item.kind] = { count: 0, name: item.name };
        }
        itemCounts[item.kind].count++;
    }

    const breakdown: DPCalculationResult['itemBreakdown'] = [];
    let totalDP = 0;

    for (const [kind, { count, name }] of Object.entries(itemCounts)) {
        const dpPerItem = ITEM_DP_VALUES[kind] || 5;
        const dpValue = dpPerItem * count;
        totalDP += dpValue;
        breakdown.push({ name, count, dpValue });
    }

    return { totalDP, breakdown };
}

// 総合DP計算
export function calculateTotalDP(player: Player): DPCalculationResult {
    const expDP = calculateExpDP(player);
    const { totalDP: itemDP, breakdown } = calculateItemDP(player.inventory);

    return {
        expDP,
        itemDP,
        totalDP: expDP + itemDP,
        itemBreakdown: breakdown,
    };
}
