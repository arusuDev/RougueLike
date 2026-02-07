// 始まりの洞窟 - 初心者向けダンジョン

import type { DungeonDefinition } from './types';

export const CAVE_DUNGEON: DungeonDefinition = {
    id: 'cave',
    name: '始まりの洞窟',
    description: '冒険者の登竜門。初心者でも挑戦しやすい洞窟。',
    floors: 6,
    difficulty: 1,
    recommendedDP: 0,
    enemyScaling: 1.0,
    expMultiplier: 1.0,
    unlocked: true,
    spawnConfig: [
        { floor: 1, enemies: ['slime'] },
        { floor: 2, enemies: ['slime', 'bat'] },
        { floor: 4, enemies: ['slime', 'bat', 'goblin'] },
    ],
};
