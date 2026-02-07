// 封印された教会 - 上級者向けダンジョン

import type { DungeonDefinition } from './types';

export const CHURCH_DUNGEON: DungeonDefinition = {
    id: 'church',
    name: '封印された教会',
    description: '禁忌の力が封じられた廃教会。上級者のみが生還できる。',
    floors: 14,
    difficulty: 5,
    recommendedDP: 300,
    enemyScaling: 2.0,
    expMultiplier: 2.0,
    unlocked: true,
    spawnConfig: [
        { floor: 1, enemies: ['skeleton', 'zombie'] },
        { floor: 4, enemies: ['skeleton', 'zombie', 'salamander'] },
        { floor: 7, enemies: ['zombie', 'salamander', 'gigaSalamander'] },
        { floor: 10, enemies: ['salamander', 'gigaSalamander', 'zombie'] },
        { floor: 13, enemies: ['gigaSalamander'] },
    ],
};
