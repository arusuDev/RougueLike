// メインアプリケーション

import { useEffect } from 'react';
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

  // キーボード入力ハンドリング
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
