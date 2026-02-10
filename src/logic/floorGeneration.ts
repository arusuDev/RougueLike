// フロア生成ロジック

import type {
    Player,
    Enemy,
    Item,
    DungeonFloor,
    Position,
    EnemyKind,
    ItemKind,
} from '../types';
import {
    INITIAL_PLAYER_STATS,
    ENEMY_STATS,
    ITEM_STATS,
    DUNGEON_PARAMS,
} from '../constants';
import { generateDungeon, getPlayerStartPosition, getRandomFloorPosition } from '../dungeon/generator';
import { computeVisibility } from '../dungeon/visibility';
import { calculateStatBonuses } from '../data/skillTree';
import { usePersistentStore } from '../state/persistentState';
import { getDungeon, getAvailableEnemies, type DungeonId } from '../data/dungeons/index';
import { randomInt } from '../utils/random';

export interface FloorGenerationResult {
    floor: DungeonFloor;
    player: Player;
    enemies: Enemy[];
    items: Item[];
    floorNumber: number;
}

/**
 * 新しいフロアのデータを生成する（純粋なロジック）
 */
export function generateFloorData(
    currentPlayer: Player | null,
    currentFloorNumber: number,
    dungeonId: DungeonId | null,
    generateId: () => string,
): FloorGenerationResult {
    const newFloorNumber = currentFloorNumber + 1;
    const floor = generateDungeon(newFloorNumber);

    // プレイヤー生成または位置更新
    const startPos = getPlayerStartPosition(floor);
    let player: Player;

    if (currentPlayer) {
        player = {
            ...currentPlayer,
            position: startPos,
        };
    } else {
        // スキルツリーのボーナスを適用
        const persistentState = usePersistentStore.getState();
        const bonuses = calculateStatBonuses(persistentState.saveData.unlockedSkills);

        player = {
            id: generateId(),
            type: 'player',
            position: startPos,
            maxHp: INITIAL_PLAYER_STATS.maxHp + bonuses.hp,
            hp: INITIAL_PLAYER_STATS.maxHp + bonuses.hp,
            attack: INITIAL_PLAYER_STATS.attack + bonuses.attack,
            defense: INITIAL_PLAYER_STATS.defense + bonuses.defense,
            level: INITIAL_PLAYER_STATS.level,
            exp: INITIAL_PLAYER_STATS.exp,
            expToNext: INITIAL_PLAYER_STATS.expToNext,
            inventory: [],
            direction: 'down',
        };
    }

    // 敵を生成
    const enemies = spawnEnemies(floor, startPos, newFloorNumber, dungeonId, generateId);

    // アイテムを生成
    const items = spawnItems(floor, generateId);

    // 視界を計算
    computeVisibility(floor, player.position);

    return { floor, player, enemies, items, floorNumber: newFloorNumber };
}

function spawnEnemies(
    floor: DungeonFloor,
    startPos: Position,
    floorNumber: number,
    dungeonId: DungeonId | null,
    generateId: () => string,
): Enemy[] {
    const enemies: Enemy[] = [];
    const enemyCount = randomInt(
        DUNGEON_PARAMS.minEnemiesPerFloor,
        DUNGEON_PARAMS.maxEnemiesPerFloor,
    );

    const dungeon = dungeonId ? getDungeon(dungeonId) : null;

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
        const available = dungeon
            ? getAvailableEnemies(dungeon, floorNumber)
            : ['slime'] as EnemyKind[];

        const kind = available[randomInt(0, available.length - 1)];
        const stats = ENEMY_STATS[kind];

        // ダンジョンごとのスケーリングを適用
        const scaling = dungeon?.enemyScaling ?? 1;
        const expMul = dungeon?.expMultiplier ?? 1;

        enemies.push({
            id: generateId(),
            type: 'enemy',
            position: pos,
            kind,
            name: stats.name,
            hp: Math.round(stats.hp * scaling),
            maxHp: Math.round(stats.hp * scaling),
            attack: Math.round(stats.attack * scaling),
            defense: Math.round(stats.defense * scaling),
            expReward: Math.round(stats.expReward * expMul),
            speed: stats.speed,
            maxAttacks: stats.maxAttacks,
            direction: 'down',
        });
    }

    return enemies;
}

function spawnItems(
    floor: DungeonFloor,
    generateId: () => string,
): Item[] {
    const items: Item[] = [];
    const itemCount = randomInt(
        DUNGEON_PARAMS.minItemsPerFloor,
        DUNGEON_PARAMS.maxItemsPerFloor,
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

    return items;
}
