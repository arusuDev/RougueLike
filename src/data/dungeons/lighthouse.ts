// 東の大灯台 - 中級者向けダンジョン

import type { DungeonDefinition } from './types';

export const LIGHTHOUSE_DUNGEON: DungeonDefinition = {
    id: 'lighthouse',
    name: '東の大灯台',
    description: '海を見渡す古い灯台。中級者向けの挑戦が待つ。',
    floors: 10,
    difficulty: 3,
    recommendedDP: 100,
    enemyScaling: 1.5,
    expMultiplier: 1.5,
    unlocked: true,
    spawnConfig: [
        { floor: 1, enemies: ['bat', 'goblin'] },
        { floor: 3, enemies: ['bat', 'goblin', 'skeleton'] },
        { floor: 5, enemies: ['goblin', 'skeleton', 'salamander'] },
        { floor: 8, enemies: ['skeleton', 'salamander', 'zombie'] },
    ],
};
