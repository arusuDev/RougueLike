// メインゲームキャンバス（ピクセルアート風描画）

import { useRef, useEffect } from 'react';
import { useGameStore } from '../state/gameState';
import { useDebugStore } from '../state/debugState';
import {
    MAP_WIDTH,
    MAP_HEIGHT,
    TILE_SIZE,
    TILE_COLORS,
    ENTITY_COLORS,
} from '../constants';
import type { TileType } from '../types';
import { TileType as TileTypeValue } from '../types';

export function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { state } = useGameStore();
    const { debug } = useDebugStore();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // ピクセルアート用の設定
        ctx.imageSmoothingEnabled = false;

        // 背景クリア
        ctx.fillStyle = TILE_COLORS.unexplored;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!state.floor || !state.player) return;

        const { floor, player, enemies, items } = state;

        // マップを描画（プレイヤー中心にスクロール）
        const offsetX = Math.floor(canvas.width / 2) - player.position.x * TILE_SIZE - TILE_SIZE / 2;
        const offsetY = Math.floor(canvas.height / 2) - player.position.y * TILE_SIZE - TILE_SIZE / 2;

        // タイルを描画
        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                const tile = floor.tiles[y][x];
                const screenX = x * TILE_SIZE + offsetX;
                const screenY = y * TILE_SIZE + offsetY;

                // 画面外はスキップ
                if (
                    screenX + TILE_SIZE < 0 ||
                    screenX > canvas.width ||
                    screenY + TILE_SIZE < 0 ||
                    screenY > canvas.height
                ) {
                    continue;
                }

                if (debug.showFullMap) {
                    // デバッグモード：全表示（明るく表示）
                    drawTile(ctx, tile.type, screenX, screenY, false);

                    // 座標表示
                    if (debug.showCoordinates && x % 5 === 0 && y % 5 === 0) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        ctx.font = '10px monospace';
                        ctx.fillText(`${x},${y}`, screenX + 2, screenY + 12);
                    }
                } else {
                    if (!tile.explored) {
                        // 未探索
                        ctx.fillStyle = TILE_COLORS.unexplored;
                        ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                    } else if (!tile.visible) {
                        // 探索済みだが視界外（暗く表示）
                        drawTile(ctx, tile.type, screenX, screenY, true);
                    } else {
                        // 視界内
                        drawTile(ctx, tile.type, screenX, screenY, false);
                    }
                }
            }
        }

        // アイテムを描画（視界内のみ）
        for (const item of items) {
            const tile = floor.tiles[item.position.y][item.position.x];
            if (!tile.visible) continue;

            const screenX = item.position.x * TILE_SIZE + offsetX;
            const screenY = item.position.y * TILE_SIZE + offsetY;
            drawItem(ctx, screenX, screenY);
        }

        // 敵を描画（視界内のみ）
        for (const enemy of enemies) {
            const tile = floor.tiles[enemy.position.y][enemy.position.x];
            if (!tile.visible) continue;

            const screenX = enemy.position.x * TILE_SIZE + offsetX;
            const screenY = enemy.position.y * TILE_SIZE + offsetY;
            drawEnemy(ctx, enemy.kind, screenX, screenY);
        }

        // プレイヤーを描画
        const playerScreenX = player.position.x * TILE_SIZE + offsetX;
        const playerScreenY = player.position.y * TILE_SIZE + offsetY;
        drawPlayer(ctx, playerScreenX, playerScreenY);
    }, [state, debug]);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={560}
            className="game-canvas"
        />
    );
}

// タイル描画
function drawTile(
    ctx: CanvasRenderingContext2D,
    type: TileType,
    x: number,
    y: number,
    dim: boolean
) {
    const size = TILE_SIZE;
    const padding = 1;

    switch (type) {
        case TileTypeValue.Wall:
            ctx.fillStyle = dim ? darken(TILE_COLORS.wall) : TILE_COLORS.wall;
            ctx.fillRect(x, y, size, size);
            // 壁のハイライト
            ctx.fillStyle = dim ? darken(TILE_COLORS.wallBorder) : TILE_COLORS.wallBorder;
            ctx.fillRect(x, y, size, padding);
            ctx.fillRect(x, y, padding, size);
            break;

        case TileTypeValue.Floor:
            ctx.fillStyle = dim ? darken(TILE_COLORS.floor) : TILE_COLORS.floor;
            ctx.fillRect(x, y, size, size);
            // 床のドットパターン
            ctx.fillStyle = dim ? darken(TILE_COLORS.floorDark) : TILE_COLORS.floorDark;
            ctx.fillRect(x + size / 2 - 1, y + size / 2 - 1, 2, 2);
            break;

        case TileTypeValue.Stairs:
            // 床を描く
            ctx.fillStyle = dim ? darken(TILE_COLORS.floor) : TILE_COLORS.floor;
            ctx.fillRect(x, y, size, size);
            // 階段アイコン
            ctx.fillStyle = dim ? darken(TILE_COLORS.stairs) : TILE_COLORS.stairs;
            ctx.fillRect(x + 2, y + size - 6, size - 4, 4);
            ctx.fillRect(x + 4, y + size - 10, size - 6, 4);
            ctx.fillRect(x + 6, y + size - 14, size - 8, 4);
            // グロー効果
            if (!dim) {
                ctx.shadowColor = TILE_COLORS.stairsGlow;
                ctx.shadowBlur = 10;
                ctx.fillStyle = TILE_COLORS.stairs;
                ctx.fillRect(x + 4, y + size - 10, size - 8, 2);
                ctx.shadowBlur = 0;
            }
            break;
    }
}

// プレイヤー描画
function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const size = TILE_SIZE;
    const padding = 3;

    // グロー効果
    ctx.shadowColor = ENTITY_COLORS.player;
    ctx.shadowBlur = 8;

    // 本体
    ctx.fillStyle = ENTITY_COLORS.player;
    ctx.fillRect(x + padding, y + padding, size - padding * 2, size - padding * 2);

    // 輪郭
    ctx.strokeStyle = ENTITY_COLORS.playerBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + padding, y + padding, size - padding * 2, size - padding * 2);

    ctx.shadowBlur = 0;
}

// 敵描画
function drawEnemy(
    ctx: CanvasRenderingContext2D,
    kind: string,
    x: number,
    y: number
) {
    const size = TILE_SIZE;
    const padding = 3;

    const color = ENTITY_COLORS[kind as keyof typeof ENTITY_COLORS] || '#ff0000';

    // 敵の形（丸みを帯びた四角）
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(
        x + size / 2,
        y + size / 2,
        (size - padding * 2) / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // 目
    ctx.fillStyle = '#000';
    ctx.fillRect(x + size / 2 - 4, y + size / 2 - 2, 2, 2);
    ctx.fillRect(x + size / 2 + 2, y + size / 2 - 2, 2, 2);
}

// アイテム描画
function drawItem(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const size = TILE_SIZE;
    const padding = 5;

    // グロー
    ctx.shadowColor = ENTITY_COLORS.itemGlow;
    ctx.shadowBlur = 6;

    // ひし形
    ctx.fillStyle = ENTITY_COLORS.item;
    ctx.beginPath();
    ctx.moveTo(x + size / 2, y + padding);
    ctx.lineTo(x + size - padding, y + size / 2);
    ctx.lineTo(x + size / 2, y + size - padding);
    ctx.lineTo(x + padding, y + size / 2);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
}

// 色を暗くするヘルパー
function darken(color: string): string {
    // 簡易的に暗くする（rgba形式で透明度を下げるのが本来は良い）
    const match = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (!match) return color;

    const r = Math.floor(parseInt(match[1], 16) * 0.4);
    const g = Math.floor(parseInt(match[2], 16) * 0.4);
    const b = Math.floor(parseInt(match[3], 16) * 0.4);

    return `rgb(${r},${g},${b})`;
}
