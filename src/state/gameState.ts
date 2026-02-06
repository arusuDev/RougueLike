// ゲーム状態管理（Zustand）

import { create } from 'zustand';
import type {
    GameState,
    Player,
    Enemy,
    Item,
    Direction,
    Position,
    EnemyKind,
    ItemKind,
} from '../types';
import { TileType } from '../types';
import {
    INITIAL_PLAYER_STATS,
    ENEMY_STATS,
    ITEM_STATS,
    DUNGEON_PARAMS,
    MAX_MESSAGES,
    EXP_TABLE,
    LEVEL_UP_BONUS,
    MAP_WIDTH,
    MAP_HEIGHT,
} from '../constants';
import { generateDungeon, getPlayerStartPosition, getRandomFloorPosition } from '../dungeon/generator';
import { computeVisibility } from '../dungeon/visibility';
import { decideEnemyAction } from '../ai/enemyAI';

// ユニークID生成
let entityIdCounter = 0;
function generateId(): string {
    return `entity_${++entityIdCounter}`;
}

// 乱数ヘルパー
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface GameStore {
    state: GameState;

    // ゲーム制御
    startGame: () => void;
    resetGame: () => void;

    // プレイヤー操作
    movePlayer: (direction: Direction) => void;
    useItem: (itemIndex: number) => void;
    toggleInventory: () => void;

    // 内部処理
    processEnemyTurn: () => void;
    generateNewFloor: () => void;
    addMessage: (message: string) => void;

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
};

export const useGameStore = create<GameStore>((set, get) => ({
    state: initialState,

    startGame: () => {
        const store = get();
        store.generateNewFloor();
        set((s) => ({
            state: {
                ...s.state,
                phase: 'playing',
            },
        }));
        store.addMessage('ダンジョンに足を踏み入れた！');
    },

    resetGame: () => {
        entityIdCounter = 0;
        set({ state: initialState });
    },

    generateNewFloor: () => {
        const { state } = get();
        const newFloorNumber = state.floorNumber + 1;
        const floor = generateDungeon(newFloorNumber);

        // プレイヤー生成または位置更新
        const startPos = getPlayerStartPosition(floor);
        let player: Player;

        if (state.player) {
            player = {
                ...state.player,
                position: startPos,
            };
        } else {
            player = {
                id: generateId(),
                type: 'player',
                position: startPos,
                ...INITIAL_PLAYER_STATS,
                inventory: [],
                direction: 'down',
            };
        }

        // 敵を生成
        const enemies: Enemy[] = [];
        const enemyCount = randomInt(
            DUNGEON_PARAMS.minEnemiesPerFloor,
            DUNGEON_PARAMS.maxEnemiesPerFloor
        );

        for (let i = 0; i < enemyCount; i++) {
            let pos = getRandomFloorPosition(floor);
            if (!pos) continue;

            // プレイヤーの近くには配置しない
            while (
                pos &&
                Math.abs(pos.x - startPos.x) + Math.abs(pos.y - startPos.y) < 5
            ) {
                pos = getRandomFloorPosition(floor);
            }
            if (!pos) continue;

            // 階層に応じた敵を選択
            // Floor 1: Slime
            // Floor 2-4: Slime, Bat, Goblin
            // Floor 5-6: Slime, Bat, Goblin, Skeleton
            // Floor 7+: All including Zombie

            const available: EnemyKind[] = ['slime'];
            if (newFloorNumber >= 2) available.push('bat');
            if (newFloorNumber >= 3) available.push('goblin');
            if (newFloorNumber >= 5) available.push('skeleton');
            if (newFloorNumber >= 7) available.push('zombie');
            if (newFloorNumber >= 5) available.push('salamander');
            if (newFloorNumber >= 8) available.push('gigaSalamander');

            const kind = available[randomInt(0, available.length - 1)];
            const stats = ENEMY_STATS[kind];

            enemies.push({
                id: generateId(),
                type: 'enemy',
                position: pos,
                kind,
                name: stats.name,
                hp: stats.hp,
                maxHp: stats.hp,
                attack: stats.attack,
                defense: stats.defense,
                expReward: stats.expReward,
                speed: stats.speed,
                maxAttacks: stats.maxAttacks,
                direction: 'down',
            });
        }

        // アイテムを生成
        const items: Item[] = [];
        const itemCount = randomInt(
            DUNGEON_PARAMS.minItemsPerFloor,
            DUNGEON_PARAMS.maxItemsPerFloor
        );
        const itemKinds: ItemKind[] = ['potion', 'potion', 'potion', 'scroll']; // 回復薬多め

        for (let i = 0; i < itemCount; i++) {
            const pos = getRandomFloorPosition(floor);
            if (!pos) continue;

            const kind = itemKinds[randomInt(0, itemKinds.length - 1)];
            const stats = ITEM_STATS[kind];

            items.push({
                id: generateId(),
                type: 'item',
                position: pos,
                kind,
                name: stats.name,
                effect: stats.effect,
            });
        }

        // 視界を計算
        computeVisibility(floor, player.position);

        set({
            state: {
                ...get().state,
                floor,
                floorNumber: newFloorNumber,
                player,
                enemies,
                items,
                turnCount: 0,
            },
        });

        if (newFloorNumber > 1) {
            get().addMessage(`${newFloorNumber}階に到着した！`);
        }
    },

    movePlayer: (direction: Direction) => {
        const { state, processEnemyTurn, addMessage } = get();
        if (state.phase !== 'playing' || !state.player || !state.floor) return;

        const { player, floor, enemies, items } = state;
        const { x, y } = player.position;

        // 移動先を計算
        let newX = x;
        let newY = y;
        switch (direction) {
            case 'up':
                newY--;
                break;
            case 'down':
                newY++;
                break;
            case 'left':
                newX--;
                break;
            case 'right':
                newX++;
                break;
            case 'up-left':
                newX--;
                newY--;
                break;
            case 'up-right':
                newX++;
                newY--;
                break;
            case 'down-left':
                newX--;
                newY++;
                break;
            case 'down-right':
                newX++;
                newY++;
                break;
        }

        // 範囲チェック
        if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) {
            return;
        }

        // 壁チェック
        if (floor.tiles[newY][newX].type === TileType.Wall) {
            return;
        }

        // 敵がいるかチェック
        const targetEnemy = enemies.find(
            (e) => e.position.x === newX && e.position.y === newY
        );

        if (targetEnemy) {
            // 攻撃
            const damage = Math.max(1, player.attack - targetEnemy.defense);
            targetEnemy.hp -= damage;
            // 攻撃時もその方向を向く
            set({
                state: {
                    ...state,
                    player: { ...player, direction },
                }
            });
            addMessage(`${targetEnemy.name}に${damage}のダメージ！`);

            if (targetEnemy.hp <= 0) {
                // 敵を倒した
                addMessage(`${targetEnemy.name}を倒した！`);

                // 経験値獲得
                const newExp = player.exp + targetEnemy.expReward;
                let newPlayer = { ...player, exp: newExp };

                // レベルアップチェック
                if (
                    newPlayer.level < EXP_TABLE.length &&
                    newExp >= EXP_TABLE[newPlayer.level]
                ) {
                    newPlayer.level++;
                    newPlayer.maxHp += LEVEL_UP_BONUS.hp;
                    newPlayer.hp = newPlayer.maxHp;
                    newPlayer.attack += LEVEL_UP_BONUS.attack;
                    newPlayer.defense += LEVEL_UP_BONUS.defense;
                    newPlayer.expToNext =
                        EXP_TABLE[newPlayer.level] || EXP_TABLE[EXP_TABLE.length - 1];
                    addMessage(`レベルアップ！レベル${newPlayer.level}になった！`);
                }

                set({
                    state: {
                        ...state,
                        player: newPlayer,
                        enemies: enemies.filter((e) => e.id !== targetEnemy.id),
                    },
                });
            } else {
                set({
                    state: {
                        ...state,
                        enemies: enemies.map((e) =>
                            e.id === targetEnemy.id ? targetEnemy : e
                        ),
                    },
                });
            }
        } else {
            // 移動
            const newPosition: Position = { x: newX, y: newY };
            const newPlayer = { ...player, position: newPosition, direction };

            // アイテムを拾う
            const pickedItem = items.find(
                (i) => i.position.x === newX && i.position.y === newY
            );
            if (pickedItem) {
                newPlayer.inventory.push(pickedItem);
                addMessage(`${pickedItem.name}を拾った！`);
                set({
                    state: {
                        ...state,
                        player: newPlayer,
                        items: items.filter((i) => i.id !== pickedItem.id),
                    },
                });
            } else {
                set({
                    state: {
                        ...state,
                        player: newPlayer,
                    },
                });
            }

            // 階段チェック
            if (floor.tiles[newY][newX].type === TileType.Stairs) {
                addMessage('階段を降りますか？（Enterキー）');
            }

            // 視界を更新
            computeVisibility(floor, newPosition);
        }

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
        const { state, addMessage } = get();
        if (!state.player || !state.floor) return;

        const { player, floor, enemies } = state;
        let currentPlayer = { ...player };
        const updatedEnemies = [...enemies];

        for (const enemy of updatedEnemies) {
            // 倍速モンスターは1ターンに speed 回行動
            const speed = enemy.speed || 1;
            const maxAttacks = enemy.maxAttacks || 1;
            let attackCount = 0;

            for (let step = 0; step < speed; step++) {
                // 攻撃回数が上限に達したら追加行動しない
                if (attackCount >= maxAttacks) break;

                // 敵の行動を決定
                const newPos = decideEnemyAction(enemy, currentPlayer.position, floor, updatedEnemies);

                if (newPos === null) {
                    // プレイヤーに隣接していれば攻撃（チェビシェフ距離：斜め隣接も1）
                    const dist = Math.max(
                        Math.abs(enemy.position.x - currentPlayer.position.x),
                        Math.abs(enemy.position.y - currentPlayer.position.y)
                    );

                    if (dist === 1) {
                        attackCount++;
                        if (state.godMode) {
                            addMessage(`${enemy.name}の攻撃を無効化！`);
                        } else {
                            const damage = Math.max(1, enemy.attack - currentPlayer.defense);
                            currentPlayer.hp -= damage;
                            addMessage(`${enemy.name}から${damage}のダメージを受けた！`);
                        }

                        if (currentPlayer.hp <= 0) {
                            currentPlayer.hp = 0;
                            set({
                                state: {
                                    ...state,
                                    phase: 'gameover',
                                    player: currentPlayer,
                                },
                            });
                            addMessage('力尽きた...');
                            return;
                        }
                    }
                } else {
                    // 移動
                    const dx = newPos.x - enemy.position.x;
                    const dy = newPos.y - enemy.position.y;
                    let newDir = enemy.direction;

                    if (dx === 0 && dy === -1) newDir = 'up';
                    else if (dx === 0 && dy === 1) newDir = 'down';
                    else if (dx === -1 && dy === 0) newDir = 'left';
                    else if (dx === 1 && dy === 0) newDir = 'right';
                    else if (dx === -1 && dy === -1) newDir = 'up-left';
                    else if (dx === 1 && dy === -1) newDir = 'up-right';
                    else if (dx === -1 && dy === 1) newDir = 'down-left';
                    else if (dx === 1 && dy === 1) newDir = 'down-right';

                    enemy.direction = newDir;
                    enemy.position = newPos;
                }
            }
        }

        set({
            state: {
                ...state,
                player: currentPlayer,
                enemies: updatedEnemies,
            },
        });
    },

    useItem: (itemIndex: number) => {
        const { state, addMessage } = get();
        if (!state.player) return;

        const { player } = state;
        const item = player.inventory[itemIndex];
        if (!item) return;

        switch (item.kind) {
            case 'potion': {
                const healAmount = Math.min(item.effect, player.maxHp - player.hp);
                const newHp = player.hp + healAmount;
                addMessage(`${item.name}を使った！HPが${healAmount}回復した！`);
                set({
                    state: {
                        ...state,
                        player: {
                            ...player,
                            hp: newHp,
                            inventory: player.inventory.filter((_, i) => i !== itemIndex),
                        },
                    },
                });
                break;
            }

            case 'scroll': {
                // 炎の巻物：周囲の敵にダメージ
                const { enemies } = state;
                let hitCount = 0;
                const newEnemies = enemies
                    .map((e) => {
                        const dist =
                            Math.abs(e.position.x - player.position.x) +
                            Math.abs(e.position.y - player.position.y);
                        if (dist <= 3) {
                            e.hp -= item.effect;
                            hitCount++;
                        }
                        return e;
                    })
                    .filter((e) => e.hp > 0);

                addMessage(
                    `${item.name}を使った！${hitCount}体の敵に${item.effect}のダメージ！`
                );
                set({
                    state: {
                        ...state,
                        enemies: newEnemies,
                        player: {
                            ...player,
                            inventory: player.inventory.filter((_, i) => i !== itemIndex),
                        },
                    },
                });
                break;
            }
        }
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

    toggleGodMode: () => {
        set((s) => ({
            state: {
                ...s.state,
                godMode: !s.state.godMode,
            },
        }));
        // set内でstate更新予約したが、ここではメッセージ出すだけ
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
    const { state, generateNewFloor, addMessage } = store;

    if (!state.player || !state.floor) return;

    const { x, y } = state.player.position;
    if (state.floor.tiles[y][x].type === TileType.Stairs) {
        addMessage('階段を降りた...');
        generateNewFloor();
    }
}
