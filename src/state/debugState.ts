// デバッグモード状態管理

import { create } from 'zustand';

interface DebugState {
    enabled: boolean;
    showFullMap: boolean;      // マップ全体を表示
    showEnemyInfo: boolean;    // 敵の詳細情報を表示
    showCoordinates: boolean;  // 座標を表示
    showPathfinding: boolean;  // パスファインディングを表示
}

interface DebugStore {
    debug: DebugState;
    toggleDebug: () => void;
    toggleFullMap: () => void;
    toggleEnemyInfo: () => void;
    toggleCoordinates: () => void;
}

const initialDebugState: DebugState = {
    enabled: false,
    showFullMap: false,
    showEnemyInfo: true,
    showCoordinates: true,
    showPathfinding: false,
};

export const useDebugStore = create<DebugStore>((set) => ({
    debug: initialDebugState,

    toggleDebug: () => {
        set((state) => ({
            debug: {
                ...state.debug,
                enabled: !state.debug.enabled,
            },
        }));
    },

    toggleFullMap: () => {
        set((state) => ({
            debug: {
                ...state.debug,
                showFullMap: !state.debug.showFullMap,
            },
        }));
    },

    toggleEnemyInfo: () => {
        set((state) => ({
            debug: {
                ...state.debug,
                showEnemyInfo: !state.debug.showEnemyInfo,
            },
        }));
    },

    toggleCoordinates: () => {
        set((state) => ({
            debug: {
                ...state.debug,
                showCoordinates: !state.debug.showCoordinates,
            },
        }));
    },
}));
