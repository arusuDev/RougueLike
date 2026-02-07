// ローカルストレージ セーブデータ管理

import type { DungeonId } from './dungeons';

const SAVE_KEY = 'rougulike_save_data';
const SAVE_VERSION = 1;

// ダンジョン進捗
export interface DungeonProgress {
    cleared: boolean;
    bestTime?: number;  // 将来用: 最速クリアタイム
}

// セーブデータ構造
export interface SaveData {
    version: number;
    totalDP: number;                           // 累計獲得DP
    currentDP: number;                         // 使用可能DP
    unlockedSkills: string[];                  // 解放済みスキルID一覧
    dungeonProgress: Partial<Record<DungeonId, DungeonProgress>>;
    statistics: {
        totalClears: number;
        totalDeaths: number;
        totalPlayTime: number;
    };
}

// デフォルトセーブデータ
function createDefaultSaveData(): SaveData {
    return {
        version: SAVE_VERSION,
        totalDP: 0,
        currentDP: 0,
        unlockedSkills: [],
        dungeonProgress: {},
        statistics: {
            totalClears: 0,
            totalDeaths: 0,
            totalPlayTime: 0,
        },
    };
}

// セーブデータ読み込み
export function loadSaveData(): SaveData {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) {
            return createDefaultSaveData();
        }

        const data = JSON.parse(raw) as SaveData;

        // バージョンマイグレーション（将来用）
        if (data.version < SAVE_VERSION) {
            return migrateSaveData(data);
        }

        return data;
    } catch (e) {
        console.error('Failed to load save data:', e);
        return createDefaultSaveData();
    }
}

// セーブデータ保存
export function saveSaveData(data: SaveData): void {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save data:', e);
    }
}

// セーブデータクリア
export function clearSaveData(): void {
    localStorage.removeItem(SAVE_KEY);
}

// バージョンマイグレーション
function migrateSaveData(oldData: SaveData): SaveData {
    // 現在はバージョン1のみなのでそのまま返す
    // 将来的にバージョン変更時はここでマイグレーション処理
    return {
        ...createDefaultSaveData(),
        ...oldData,
        version: SAVE_VERSION,
    };
}
