// ダンジョンデータ統合エクスポート

export * from './types';
export { CAVE_DUNGEON } from './cave';
export { LIGHTHOUSE_DUNGEON } from './lighthouse';
export { CHURCH_DUNGEON } from './church';

import type { DungeonId, DungeonDefinition } from './types';
import type { EnemyKind } from '../../types';
import { CAVE_DUNGEON } from './cave';
import { LIGHTHOUSE_DUNGEON } from './lighthouse';
import { CHURCH_DUNGEON } from './church';

// 全ダンジョンのマップ
export const DUNGEONS: Record<DungeonId, DungeonDefinition> = {
    cave: CAVE_DUNGEON,
    lighthouse: LIGHTHOUSE_DUNGEON,
    church: CHURCH_DUNGEON,
};

// ダンジョン取得ヘルパー
export function getDungeon(id: DungeonId): DungeonDefinition {
    return DUNGEONS[id];
}

// 特定階層で出現するモンスターを取得
export function getAvailableEnemies(dungeon: DungeonDefinition, floor: number): EnemyKind[] {
    // floorNumber以下で最も近いspawnConfigを探す
    let availableEnemies: EnemyKind[] = [];

    for (const config of dungeon.spawnConfig) {
        if (config.floor <= floor) {
            availableEnemies = config.enemies;
        }
    }

    // デフォルトでスライムを返す
    return availableEnemies.length > 0 ? availableEnemies : ['slime'];
}
