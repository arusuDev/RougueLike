// ダンジョン型定義

import type { EnemyKind } from '../../types';

export type DungeonId = 'cave' | 'lighthouse' | 'church';

// 階層別モンスター出現設定
export interface FloorSpawnConfig {
    floor: number;              // この階から出現
    enemies: EnemyKind[];       // 出現するモンスター
}

// ダンジョン定義
export interface DungeonDefinition {
    id: DungeonId;
    name: string;
    description: string;
    floors: number;
    difficulty: 1 | 2 | 3 | 4 | 5;
    recommendedDP: number;
    enemyScaling: number;       // 敵ステータス倍率
    expMultiplier: number;      // 経験値倍率
    unlocked: boolean;          // 将来の拡張用
    spawnConfig: FloorSpawnConfig[];  // 階層別出現モンスター
}

// ダンジョンリスト（表示順）
export const DUNGEON_LIST: DungeonId[] = ['cave', 'lighthouse', 'church'];
