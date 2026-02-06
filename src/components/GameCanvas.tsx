// メインゲームキャンバス（ピクセルアート風描画）

import { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../state/gameState';
import { useDebugStore } from '../state/debugState';
import {
    MAP_WIDTH,
    MAP_HEIGHT,
    TILE_SIZE,
    TILE_COLORS,
    ENTITY_COLORS,
    SPRITE_CONFIG,
} from '../constants';
import type { TileType, Direction } from '../types';
import { TileType as TileTypeValue } from '../types';
import { ENEMY_SPRITES } from '../assets/sprites';

// 外部画像のキャッシュ
const imageCache: Record<string, HTMLImageElement | null> = {};
const imageCacheStatus: Record<string, 'loading' | 'loaded' | 'error'> = {};

// 透過色処理済み画像のキャッシュ
const processedImageCache: Record<string, HTMLCanvasElement> = {};

// 外部画像を読み込む関数
function loadExternalImage(kind: string): HTMLImageElement | null {
    const path = `/sprites/enemies/${kind}.png`;

    if (imageCacheStatus[kind] === 'loaded') {
        return imageCache[kind];
    }

    if (imageCacheStatus[kind] === 'loading') {
        return null;
    }

    if (imageCacheStatus[kind] === 'error') {
        return null;
    }

    // 画像の読み込みを開始
    imageCacheStatus[kind] = 'loading';
    const img = new Image();
    img.src = path;
    img.onload = () => {
        imageCache[kind] = img;
        imageCacheStatus[kind] = 'loaded';
        // 透過色処理を行う
        processImageWithTransparency(kind, img);
    };
    img.onerror = () => {
        imageCache[kind] = null;
        imageCacheStatus[kind] = 'error';
    };

    return null;
}

// 透過色処理を行う関数
function processImageWithTransparency(kind: string, img: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 透過色をRGBに変換
    const transparentColor = SPRITE_CONFIG.transparentColor;
    const tr = parseInt(transparentColor.slice(1, 3), 16);
    const tg = parseInt(transparentColor.slice(3, 5), 16);
    const tb = parseInt(transparentColor.slice(5, 7), 16);

    // 透過色のピクセルを透明にする
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] === tr && data[i + 1] === tg && data[i + 2] === tb) {
            data[i + 3] = 0; // アルファを0に
        }
    }

    ctx.putImageData(imageData, 0, 0);
    processedImageCache[kind] = canvas;
}

export function GameCanvas({ diagonalMode = false }: { diagonalMode?: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { state } = useGameStore();
    const { debug } = useDebugStore();
    const [tick, setTick] = useState(0);

    // 攻撃エフェクトのクリーンアップタイマー
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const currentState = useGameStore.getState().state;
            const effects = currentState.attackEffects;

            // エフェクトがある場合は再描画をトリガー
            if (effects.length > 0) {
                setTick(t => t + 1);
            }

            // 古いエフェクトを削除
            const expired = effects.filter(e => now - e.timestamp > 500);
            if (expired.length > 0) {
                useGameStore.setState((s) => ({
                    state: {
                        ...s.state,
                        attackEffects: s.state.attackEffects.filter(e => now - e.timestamp <= 500),
                    },
                }));
            }
        }, 30);
        return () => clearInterval(interval);
    }, []);

    // tickを依存配列に追加して再描画を強制
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
            drawEnemy(ctx, enemy.kind, screenX, screenY, enemy.direction);
        }

        // プレイヤーを描画
        const playerScreenX = player.position.x * TILE_SIZE + offsetX;
        const playerScreenY = player.position.y * TILE_SIZE + offsetY;
        drawPlayer(ctx, playerScreenX, playerScreenY, player.direction);

        // 斜め移動モード中は各角に矢印インジケーターを表示
        if (diagonalMode) {
            drawDiagonalArrows(ctx, playerScreenX, playerScreenY);
        }

        // 攻撃エフェクトを描画（ストアから直接読み取り）
        const currentEffects = useGameStore.getState().state.attackEffects;
        for (const effect of currentEffects) {
            const effectScreenX = effect.position.x * TILE_SIZE + offsetX;
            const effectScreenY = effect.position.y * TILE_SIZE + offsetY;
            drawAttackEffect(ctx, effectScreenX, effectScreenY, effect.direction);
        }
    }, [state, debug, diagonalMode, tick]);

    return (
        <canvas
            ref={canvasRef}
            width={1024}
            height={896}
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
function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, direction: Direction) {
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

    // 目を描画（方向によってずらす）
    ctx.fillStyle = '#004400';
    const eyeSize = 4;
    const eyeOffset = 6; // 中心からの距離
    let dx = 0;
    let dy = 0;

    // 方向によるオフセット
    if (direction.includes('up')) dy = -4;
    if (direction.includes('down')) dy = 4;
    if (direction.includes('left')) dx = -4;
    if (direction.includes('right')) dx = 4;

    // 中央の基本位置
    const centerX = x + size / 2;
    const centerY = y + size / 2;

    // 目を2つ描く
    ctx.fillRect(
        centerX - eyeOffset + dx - eyeSize / 2,
        centerY + dy - eyeSize / 2,
        eyeSize,
        eyeSize
    );
    ctx.fillRect(
        centerX + eyeOffset + dx - eyeSize / 2,
        centerY + dy - eyeSize / 2,
        eyeSize,
        eyeSize
    );
}

// 敵描画（外部画像優先、なければ配列スプライト）
function drawEnemy(
    ctx: CanvasRenderingContext2D,
    kind: string,
    x: number,
    y: number,
    direction: Direction
) {
    // 外部画像があればそちらを使用（スライム以外）
    const externalImage = kind !== 'slime' ? loadExternalImage(kind) : null;
    if (externalImage && processedImageCache[kind]) {
        ctx.drawImage(processedImageCache[kind], x, y, TILE_SIZE, TILE_SIZE);
        return;
    }

    // 配列スプライトにフォールバック
    const sprite = ENEMY_SPRITES[kind];
    if (!sprite) return;

    const spriteSize = SPRITE_CONFIG.spriteSize;
    const pixelSize = TILE_SIZE / spriteSize;
    const baseColor = ENTITY_COLORS[kind as keyof typeof ENTITY_COLORS] || '#ff0000';

    // サブカラー（目など）の決定
    let subColor = '#ffffff';
    if (kind === 'zombie') subColor = ENTITY_COLORS.zombieEye || '#aa0000';
    else if (kind === 'bat') subColor = (ENTITY_COLORS as any).batEye || '#ff0000';
    else if (kind === 'slime') subColor = (ENTITY_COLORS as any).slimeEye || '#ffffff';
    else if (kind === 'goblin') subColor = (ENTITY_COLORS as any).goblinEye || '#ffff00';
    else if (kind === 'skeleton') subColor = (ENTITY_COLORS as any).skeletonEye || '#222222';
    else if (kind === 'salamander') subColor = (ENTITY_COLORS as any).salamanderEye || '#ffff00';
    else if (kind === 'gigaSalamander') subColor = (ENTITY_COLORS as any).gigaSalamanderEye || '#ffaa00';

    // 方向によるオフセット（目のピクセルをずらす）
    let offsetDx = 0;
    let offsetDy = 0;
    if (direction.includes('up')) offsetDy = -1;
    if (direction.includes('down')) offsetDy = 1;
    if (direction.includes('left')) offsetDx = -1;
    if (direction.includes('right')) offsetDx = 1;

    for (let dy = 0; dy < spriteSize; dy++) {
        for (let dx = 0; dx < spriteSize; dx++) {
            const pixel = sprite[dy]?.[dx];
            if (pixel === 0 || pixel === undefined) continue;

            let px = x + dx * pixelSize;
            let py = y + dy * pixelSize;

            // 目のピクセル（pixel === 2）は方向によってずらす
            if (pixel === 2) {
                px += offsetDx * pixelSize;
                py += offsetDy * pixelSize;
                ctx.fillStyle = subColor;
            } else if (pixel === 1) {
                ctx.fillStyle = baseColor;
            }
            ctx.fillRect(px, py, pixelSize, pixelSize);
        }
    }
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

// 斜め移動モード矢印描画
function drawDiagonalArrows(ctx: CanvasRenderingContext2D, playerX: number, playerY: number) {
    const size = TILE_SIZE;
    const arrowSize = 8;

    // 4つの斜め方向: [dx, dy] (タイル単位)
    const diagonals: [number, number][] = [
        [-1, -1], // 左上
        [1, -1],  // 右上
        [-1, 1],  // 左下
        [1, 1],   // 右下
    ];

    ctx.save();
    ctx.shadowColor = ENTITY_COLORS.player;
    ctx.shadowBlur = 6;

    for (const [dx, dy] of diagonals) {
        const tileX = playerX + dx * size;
        const tileY = playerY + dy * size;
        // 矢印の根元（プレイヤー寄り）と先端（外向き）
        const centerX = tileX + size / 2;
        const centerY = tileY + size / 2;

        ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
        ctx.beginPath();
        // 三角形の先端は斜め外側、底辺はプレイヤー側
        ctx.moveTo(centerX + dx * arrowSize, centerY + dy * arrowSize); // 先端
        ctx.lineTo(centerX - dx * arrowSize, centerY);                  // 底辺左
        ctx.lineTo(centerX, centerY - dy * arrowSize);                  // 底辺右
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
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

// 攻撃エフェクト描画
function drawAttackEffect(ctx: CanvasRenderingContext2D, x: number, y: number, _direction: Direction) {
    const size = TILE_SIZE;
    const centerX = x + size / 2;
    const centerY = y + size / 2;

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 15;
    ctx.lineCap = 'round';

    // X型のスラッシュを描画（より見やすい）
    const slashSize = size * 0.4;

    // 斜め線1 (\)
    ctx.beginPath();
    ctx.moveTo(centerX - slashSize, centerY - slashSize);
    ctx.lineTo(centerX + slashSize, centerY + slashSize);
    ctx.stroke();

    // 斜め線2 (/)
    ctx.beginPath();
    ctx.moveTo(centerX + slashSize, centerY - slashSize);
    ctx.lineTo(centerX - slashSize, centerY + slashSize);
    ctx.stroke();

    // 中心に衝撃波
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, slashSize * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

