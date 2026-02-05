// メインアプリケーション

import { useEffect, useRef } from 'react';
import { useGameStore, descendStairs } from './state/gameState';
import { TitleScreen } from './components/TitleScreen';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { MessageLog } from './components/MessageLog';
import { Inventory } from './components/Inventory';
import { GameOverScreen } from './components/GameOverScreen';
import { DebugPanel } from './components/DebugPanel';
import { useDebugStore } from './state/debugState';
import type { Direction } from './types';

function App() {
  const { state, movePlayer, toggleInventory, toggleGodMode, fullHeal, nextFloor } = useGameStore();
  const { debug, toggleDebug, toggleFullMap } = useDebugStore();
  const { phase } = state;

  // 押下中のキーを追跡（Ctrl+方向キーの斜め移動用）
  const heldKeysRef = useRef<Set<string>>(new Set());

  // キーボード入力ハンドリング
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      heldKeysRef.current.add(e.code);
      // デバッグショートカット
      if (e.key === 'F3') {
        e.preventDefault();
        toggleDebug();
        return;
      }

      if (debug.enabled) {
        if (e.key === 'm' || e.key === 'M') {
          toggleFullMap();
          return;
        }
        if (e.key === 'g' || e.key === 'G') {
          toggleGodMode();
          return;
        }
        if (e.key === 'n' || e.key === 'N') {
          nextFloor();
          return;
        }
        if (e.key === 'h' || e.key === 'H') {
          fullHeal();
          return;
        }
      }

      // インベントリ画面
      if (phase === 'inventory') {
        if (e.key === 'i' || e.key === 'I' || e.key === 'Escape') {
          toggleInventory();
        }
        return;
      }

      // ゲームプレイ中
      if (phase !== 'playing') return;

      let direction: Direction | null = null;

      // Ctrl+方向キーの組み合わせで斜め移動
      if (e.ctrlKey) {
        const held = heldKeysRef.current;
        const up = held.has('ArrowUp') || held.has('KeyW');
        const down = held.has('ArrowDown') || held.has('KeyS');
        const left = held.has('ArrowLeft') || held.has('KeyA');
        const right = held.has('ArrowRight') || held.has('KeyD');

        if (up && left) direction = 'up-left';
        else if (up && right) direction = 'up-right';
        else if (down && left) direction = 'down-left';
        else if (down && right) direction = 'down-right';

        if (direction) {
          e.preventDefault();
          movePlayer(direction);
          return;
        }
      }

      // 矢印キー
      switch (e.key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        // WASD
        case 'w':
        case 'W':
          direction = 'up';
          break;
        case 's':
        case 'S':
          direction = 'down';
          break;
        case 'a':
        case 'A':
          direction = 'left';
          break;
        case 'd':
        case 'D':
          direction = 'right';
          break;
        // テンキー斜め移動
        case '7':
          direction = 'up-left';
          break;
        case '9':
          direction = 'up-right';
          break;
        case '1':
          direction = 'down-left';
          break;
        case '3':
          direction = 'down-right';
          break;
        // vi風斜め移動
        case 'y':
        case 'Y':
          direction = 'up-left';
          break;
        case 'u':
        case 'U':
          direction = 'up-right';
          break;
        case 'b':
        case 'B':
          direction = 'down-left';
          break;
        case 'n':
        case 'N':
          direction = 'down-right';
          break;
        // インベントリ
        case 'i':
        case 'I':
          toggleInventory();
          return;
        // 階段を降りる
        case 'Enter':
          descendStairs();
          return;
      }

      if (direction) {
        e.preventDefault();
        movePlayer(direction);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      heldKeysRef.current.delete(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [phase, movePlayer, toggleInventory, debug.enabled, toggleDebug, toggleFullMap, toggleGodMode, fullHeal, nextFloor]);

  return (
    <div className="app">
      {phase === 'title' && <TitleScreen />}

      {(phase === 'playing' || phase === 'inventory') && (
        <div className="game-screen">
          <div className="game-main">
            <div className="game-canvas-container">
              <GameCanvas />
            </div>
            <HUD />
          </div>
          <MessageLog />
          {phase === 'inventory' && <Inventory />}
        </div>
      )}

      {phase === 'gameover' && <GameOverScreen />}

      <DebugPanel />
    </div>
  );
}

export default App;
