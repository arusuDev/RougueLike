// 敵ターン処理ロジック

import type {
    GameState,
    Player,
    Enemy,
    Direction,
    Position,
} from '../types';
import { decideEnemyAction } from '../ai/enemyAI';
import { deltaToDirection } from '../utils/direction';

export interface EnemyTurnResult {
    player: Player;
    enemies: Enemy[];
    messages: string[];
    attackEffects: Array<{ position: Position; direction: Direction }>;
    gameOver: boolean;
}

/**
 * 全敵のターンを処理する（純粋ロジック）
 */
export function processEnemyActions(state: GameState): EnemyTurnResult | null {
    if (!state.player || !state.floor) return null;

    const { player, floor, enemies } = state;
    let currentPlayer = { ...player };
    const updatedEnemies = [...enemies];
    const messages: string[] = [];
    const attackEffects: Array<{ position: Position; direction: Direction }> = [];

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
                    Math.abs(enemy.position.y - currentPlayer.position.y),
                );

                if (dist === 1) {
                    attackCount++;
                    // 敵の攻撃方向を計算
                    const atkDx = currentPlayer.position.x - enemy.position.x;
                    const atkDy = currentPlayer.position.y - enemy.position.y;
                    const atkDir = deltaToDirection(atkDx, atkDy);

                    attackEffects.push({ position: currentPlayer.position, direction: atkDir });

                    if (state.godMode) {
                        messages.push(`${enemy.name}の攻撃を無効化！`);
                    } else {
                        const damage = Math.max(1, enemy.attack - currentPlayer.defense);
                        currentPlayer.hp -= damage;
                        messages.push(`${enemy.name}から${damage}のダメージを受けた！`);
                    }

                    if (currentPlayer.hp <= 0) {
                        currentPlayer.hp = 0;
                        messages.push('力尽きた...');
                        return {
                            player: currentPlayer,
                            enemies: updatedEnemies,
                            messages,
                            attackEffects,
                            gameOver: true,
                        };
                    }
                }
            } else {
                // 移動
                const dx = newPos.x - enemy.position.x;
                const dy = newPos.y - enemy.position.y;
                enemy.direction = deltaToDirection(dx, dy, enemy.direction);
                enemy.position = newPos;
            }
        }
    }

    return {
        player: currentPlayer,
        enemies: updatedEnemies,
        messages,
        attackEffects,
        gameOver: false,
    };
}
