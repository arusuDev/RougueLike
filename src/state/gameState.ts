// ゲーム状態管理（Zustand）
// 各ロジックは logic/ 配下のモジュールに委譲

import { create } from 'zustand';
import type {
    GameState,
    Direction,
    Position,
    AttackEffect,
    GamePhase,
} from '../types';
import { TileType } from '../types';
import { MAX_MESSAGES } from '../constants';
import { getDungeon, type DungeonId } from '../data/dungeons/index';
import { generateFloorData } from '../logic/floorGeneration';
import { processPlayerMove } from '../logic/playerMovement';
import { processEnemyActions } from '../logic/enemyTurn';
import { processItemUse } from '../logic/itemUsage';

// ユニークID生成
let entityIdCounter = 0;
function generateId(): string {
    return `entity_${++entityIdCounter}`;
}

interface GameStore {
    state: GameState;
    currentDungeonId: DungeonId | null;

    // ゲーム制御
    startGame: (dungeonId: DungeonId) => void;
    resetGame: () => void;
    setPhase: (phase: GamePhase) => void;

    // プレイヤー操作
    movePlayer: (direction: Direction) => void;
    useItem: (itemIndex: number) => void;
    toggleInventory: () => void;

    // 内部処理
    processEnemyTurn: () => void;
    generateNewFloor: () => void;
    addMessage: (message: string) => void;
    addAttackEffect: (position: Position, direction: Direction) => void;

    // デバッグアクション
    toggleGodMode: () => void;
    fullHeal: () => void;
    nextFloor: () => void;
}

// 初期状態
const initialState: GameState = {
    phase: 'title',
    floor: null,
    floorNumber: 0,
    player: null,
    enemies: [],
    items: [],
    messages: [],
    turnCount: 0,
    godMode: false,
    attackEffects: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
    state: initialState,
    currentDungeonId: null,

    startGame: (dungeonId: DungeonId) => {
        const store = get();
        set({ currentDungeonId: dungeonId });
        store.generateNewFloor();
        set((s) => ({
            state: { ...s.state, phase: 'playing' },
        }));
        const dungeon = getDungeon(dungeonId);
        store.addMessage(`『${dungeon.name}』に足を踏み入れた！`);
    },

    resetGame: () => {
        entityIdCounter = 0;
        set({ state: initialState, currentDungeonId: null });
    },

    setPhase: (phase: GamePhase) => {
        set((s) => ({
            state: { ...s.state, phase },
        }));
    },

    generateNewFloor: () => {
        const { state, currentDungeonId } = get();
        const result = generateFloorData(
            state.player,
            state.floorNumber,
            currentDungeonId,
            generateId,
        );

        set({
            state: {
                ...get().state,
                floor: result.floor,
                floorNumber: result.floorNumber,
                player: result.player,
                enemies: result.enemies,
                items: result.items,
                turnCount: 0,
            },
        });

        if (result.floorNumber > 1) {
            get().addMessage(`${result.floorNumber}階に到着した！`);
        }
    },

    movePlayer: (direction: Direction) => {
        const { state, processEnemyTurn, addMessage, addAttackEffect } = get();
        if (state.phase !== 'playing') return;

        const result = processPlayerMove(direction, state);
        if (!result) return;

        // エフェクトとメッセージを適用
        for (const effect of result.attackEffects) {
            addAttackEffect(effect.position, effect.direction);
        }
        for (const msg of result.messages) {
            addMessage(msg);
        }

        // 状態を更新
        set((s) => ({
            state: {
                ...s.state,
                player: result.player,
                enemies: result.enemies,
                items: result.items,
            },
        }));

        // 敵のターンを処理
        processEnemyTurn();

        // ターンカウント増加
        set((s) => ({
            state: {
                ...s.state,
                turnCount: s.state.turnCount + 1,
            },
        }));
    },

    processEnemyTurn: () => {
        const { state, addMessage, addAttackEffect } = get();
        const result = processEnemyActions(state);
        if (!result) return;

        // エフェクトとメッセージを適用
        for (const effect of result.attackEffects) {
            addAttackEffect(effect.position, effect.direction);
        }
        for (const msg of result.messages) {
            addMessage(msg);
        }

        if (result.gameOver) {
            set((s) => ({
                state: {
                    ...s.state,
                    phase: 'gameover',
                    player: result.player,
                    enemies: result.enemies,
                },
            }));
        } else {
            set((s) => ({
                state: {
                    ...s.state,
                    player: result.player,
                    enemies: result.enemies,
                },
            }));
        }
    },

    useItem: (itemIndex: number) => {
        const { state, addMessage } = get();
        const result = processItemUse(itemIndex, state);
        if (!result) return;

        for (const msg of result.messages) {
            addMessage(msg);
        }

        set((s) => ({
            state: {
                ...s.state,
                player: result.player,
                enemies: result.enemies,
            },
        }));
    },

    toggleInventory: () => {
        const { state } = get();
        if (state.phase === 'playing') {
            set({ state: { ...state, phase: 'inventory' } });
        } else if (state.phase === 'inventory') {
            set({ state: { ...state, phase: 'playing' } });
        }
    },

    addMessage: (message: string) => {
        set((s) => ({
            state: {
                ...s.state,
                messages: [...s.state.messages.slice(-MAX_MESSAGES + 1), message],
            },
        }));
    },

    addAttackEffect: (position: Position, direction: Direction) => {
        const effect: AttackEffect = {
            id: generateId(),
            position,
            direction,
            timestamp: Date.now(),
        };
        set((s) => ({
            state: {
                ...s.state,
                attackEffects: [...s.state.attackEffects, effect],
            },
        }));
    },

    toggleGodMode: () => {
        set((s) => ({
            state: {
                ...s.state,
                godMode: !s.state.godMode,
            },
        }));
        get().addMessage(`無敵モード: ${!get().state.godMode ? 'OFF' : 'ON'}`);
    },

    fullHeal: () => {
        const { state, addMessage } = get();
        if (state.player) {
            set((s) => ({
                state: {
                    ...s.state,
                    player: {
                        ...s.state.player!,
                        hp: s.state.player!.maxHp,
                    },
                },
            }));
            addMessage('HPを全回復しました！');
        }
    },

    nextFloor: () => {
        const { generateNewFloor, addMessage } = get();
        addMessage('次のフロアへ強制移動します...');
        generateNewFloor();
    },
}));

// 階段を降りる処理
export function descendStairs() {
    const store = useGameStore.getState();
    const { state, generateNewFloor, addMessage, currentDungeonId } = store;

    if (!state.player || !state.floor) return;

    const { x, y } = state.player.position;
    if (state.floor.tiles[y][x].type !== TileType.Stairs) return;

    // 最終階チェック
    if (currentDungeonId) {
        const dungeon = getDungeon(currentDungeonId);
        if (state.floorNumber >= dungeon.floors) {
            addMessage('ダンジョンから脱出した！');
            useGameStore.setState((s) => ({
                state: {
                    ...s.state,
                    phase: 'result',
                },
            }));
            return;
        }
    }

    addMessage('階段を降りた...');
    generateNewFloor();
}
