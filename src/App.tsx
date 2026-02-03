// メインアプリケーション

import { useEffect } from 'react';
import { useGameStore, descendStairs } from './state/gameState';
import { TitleScreen } from './components/TitleScreen';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { MessageLog } from './components/MessageLog';
import { Inventory } from './components/Inventory';
import { GameOverScreen } from './components/GameOverScreen';
import type { Direction } from './types';

function App() {
  const { state, movePlayer, toggleInventory } = useGameStore();
  const { phase } = state;

  // キーボード入力ハンドリング
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [phase, movePlayer, toggleInventory]);

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
    </div>
  );
}

export default App;
