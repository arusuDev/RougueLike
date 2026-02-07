// 永続データ管理（DP、スキルツリー、ダンジョン進捗）

import { create } from 'zustand';
import { loadSaveData, saveSaveData, clearSaveData } from '../data/saveData';
import type { SaveData, DungeonProgress } from '../data/saveData';
import type { DungeonId } from '../data/dungeons/index';

interface PersistentStore {
    // State
    saveData: SaveData;
    isLoaded: boolean;

    // Actions
    loadData: () => void;
    saveDataToStorage: () => void;

    // DP操作
    addDP: (amount: number) => void;
    spendDP: (amount: number) => boolean;  // 成功/失敗を返す

    // スキル操作
    unlockSkill: (skillId: string) => void;
    isSkillUnlocked: (skillId: string) => boolean;

    // ダンジョン進捗
    markDungeonCleared: (dungeonId: DungeonId) => void;
    isDungeonCleared: (dungeonId: DungeonId) => boolean;

    // 統計
    incrementClears: () => void;
    incrementDeaths: () => void;

    // データ管理
    resetAllData: () => void;
}

export const usePersistentStore = create<PersistentStore>((set, get) => ({
    saveData: loadSaveData(),
    isLoaded: false,

    loadData: () => {
        const data = loadSaveData();
        set({ saveData: data, isLoaded: true });
    },

    saveDataToStorage: () => {
        saveSaveData(get().saveData);
    },

    addDP: (amount: number) => {
        set((state) => {
            const newData: SaveData = {
                ...state.saveData,
                currentDP: state.saveData.currentDP + amount,
                totalDP: state.saveData.totalDP + amount,
            };
            saveSaveData(newData);
            return { saveData: newData };
        });
    },

    spendDP: (amount: number) => {
        const { saveData } = get();
        if (saveData.currentDP < amount) {
            return false;
        }
        set((state) => {
            const newData: SaveData = {
                ...state.saveData,
                currentDP: state.saveData.currentDP - amount,
            };
            saveSaveData(newData);
            return { saveData: newData };
        });
        return true;
    },

    unlockSkill: (skillId: string) => {
        set((state) => {
            if (state.saveData.unlockedSkills.includes(skillId)) {
                return state;
            }
            const newData: SaveData = {
                ...state.saveData,
                unlockedSkills: [...state.saveData.unlockedSkills, skillId],
            };
            saveSaveData(newData);
            return { saveData: newData };
        });
    },

    isSkillUnlocked: (skillId: string) => {
        return get().saveData.unlockedSkills.includes(skillId);
    },

    markDungeonCleared: (dungeonId: DungeonId) => {
        set((state) => {
            const progress: DungeonProgress = {
                ...state.saveData.dungeonProgress[dungeonId],
                cleared: true,
            };
            const newData: SaveData = {
                ...state.saveData,
                dungeonProgress: {
                    ...state.saveData.dungeonProgress,
                    [dungeonId]: progress,
                },
            };
            saveSaveData(newData);
            return { saveData: newData };
        });
    },

    isDungeonCleared: (dungeonId: DungeonId) => {
        return get().saveData.dungeonProgress[dungeonId]?.cleared ?? false;
    },

    incrementClears: () => {
        set((state) => {
            const newData: SaveData = {
                ...state.saveData,
                statistics: {
                    ...state.saveData.statistics,
                    totalClears: state.saveData.statistics.totalClears + 1,
                },
            };
            saveSaveData(newData);
            return { saveData: newData };
        });
    },

    incrementDeaths: () => {
        set((state) => {
            const newData: SaveData = {
                ...state.saveData,
                statistics: {
                    ...state.saveData.statistics,
                    totalDeaths: state.saveData.statistics.totalDeaths + 1,
                },
            };
            saveSaveData(newData);
            return { saveData: newData };
        });
    },

    resetAllData: () => {
        clearSaveData();
        const freshData = loadSaveData();
        set({ saveData: freshData });
    },
}));
