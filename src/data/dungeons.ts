// ダンジョン定義データ

export type DungeonId = 'cave' | 'lighthouse' | 'church';

export interface DungeonDefinition {
    id: DungeonId;
    name: string;
    description: string;
    floors: number;
    difficulty: 1 | 2 | 3 | 4 | 5;
    recommendedDP: number;
    enemyScaling: number;      // 敵ステータス倍率
    expMultiplier: number;     // 経験値倍率
    unlocked: boolean;         // 将来の拡張用
}

// ダンジョン定義
export const DUNGEONS: Record<DungeonId, DungeonDefinition> = {
    cave: {
        id: 'cave',
        name: '始まりの洞窟',
        description: '冒険者の登竜門。初心者でも挑戦しやすい洞窟。',
        floors: 6,
        difficulty: 1,
        recommendedDP: 0,
        enemyScaling: 1.0,
        expMultiplier: 1.0,
        unlocked: true,
    },
    lighthouse: {
        id: 'lighthouse',
        name: '東の大灯台',
        description: '海を見渡す古い灯台。中級者向けの挑戦が待つ。',
        floors: 10,
        difficulty: 3,
        recommendedDP: 100,
        enemyScaling: 1.5,
        expMultiplier: 1.5,
        unlocked: true,
    },
    church: {
        id: 'church',
        name: '封印された教会',
        description: '禁忌の力が封じられた廃教会。上級者のみが生還できる。',
        floors: 14,
        difficulty: 5,
        recommendedDP: 300,
        enemyScaling: 2.0,
        expMultiplier: 2.0,
        unlocked: true,
    },
};

// ダンジョンリスト（表示順）
export const DUNGEON_LIST: DungeonId[] = ['cave', 'lighthouse', 'church'];

// ダンジョン取得ヘルパー
export function getDungeon(id: DungeonId): DungeonDefinition {
    return DUNGEONS[id];
}
