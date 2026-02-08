// メインアプリケーション

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore, descendStairs } from './state/gameState';
import { TitleScreen } from './components/TitleScreen';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { MessageLog } from './components/MessageLog';
import { Inventory } from './components/Inventory';
import { GameOverScreen } from './components/GameOverScreen';
import { DebugPanel } from './components/DebugPanel';
import { DungeonSelect } from './components/DungeonSelect';
import { ResultScreen } from './components/ResultScreen';
import { SkillTreeScreen } from './components/SkillTreeScreen';
import { MobileDPad } from './components/MobileDPad';
import { useDebugStore } from './state/debugState';
import type { Direction } from './types';
import type { DungeonId } from './data/dungeons/index';

function App() {
  const { state, movePlayer, toggleInventory, toggleGodMode, fullHeal, nextFloor, startGame, setPhase } = useGameStore();
  const { debug, toggleDebug, toggleFullMap } = useDebugStore();
  const { phase } = state;

  // 押下中のキーを追跡（Shift+方向キーの斜め移動用）
  const heldKeysRef = useRef<Set<string>>(new Set());
  const [diagonalMode, setDiagonalMode] = useState(false);

  // キーボード入力ハンドリング
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      heldKeysRef.current.add(e.code);

      // Shift押下で斜め移動モード切替
      if (e.key === 'Shift') {
        setDiagonalMode(true);
      }

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

      // Shift+方向キーの組み合わせで斜め移動（斜めのみ許可）
      if (e.shiftKey) {
        const held = heldKeysRef.current;
        const up = held.has('ArrowUp') || held.has('KeyW');
        const down = held.has('ArrowDown') || held.has('KeyS');
        const left = held.has('ArrowLeft') || held.has('KeyA');
        const right = held.has('ArrowRight') || held.has('KeyD');

        if (up && left) direction = 'up-left';
        else if (up && right) direction = 'up-right';
        else if (down && left) direction = 'down-left';
        else if (down && right) direction = 'down-right';

        // 方向キーが押されている場合は斜めのみ（上下左右を無効化）
        if (up || down || left || right) {
          if (direction) {
            e.preventDefault();
            movePlayer(direction);
          }
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
      if (e.key === 'Shift') {
        setDiagonalMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [phase, movePlayer, toggleInventory, debug.enabled, toggleDebug, toggleFullMap, toggleGodMode, fullHeal, nextFloor]);

  // モバイルD-Pad操作ハンドラ
  const handleMobileDirection = useCallback((direction: Direction) => {
    if (phase === 'playing') {
      movePlayer(direction);
    }
  }, [phase, movePlayer]);

  const handleMobileAction = useCallback((action: 'stairs' | 'inventory') => {
    if (action === 'stairs') {
      descendStairs();
    } else if (action === 'inventory') {
      toggleInventory();
    }
  }, [toggleInventory]);

  // ダンジョン選択ハンドラ
  const handleSelectDungeon = (dungeonId: DungeonId) => {
    startGame(dungeonId);
  };

  // タイトルに戻るハンドラ
  const handleBackToTitle = () => {
    setPhase('title');
  };

  // スキルツリーへ
  const handleOpenSkillTree = () => {
    setPhase('skill-tree');
  };

  // ダンジョン選択へ戻る
  const handleBackToDungeonSelect = () => {
    setPhase('dungeon-select');
  };

  return (
    <div className="app">
      {phase === 'title' && <TitleScreen />}

      {phase === 'dungeon-select' && (
        <DungeonSelect
          onSelectDungeon={handleSelectDungeon}
          onBack={handleBackToTitle}
          onSkillTree={handleOpenSkillTree}
        />
      )}

      {phase === 'skill-tree' && (
        <SkillTreeScreen onBack={handleBackToDungeonSelect} />
      )}

      {(phase === 'playing' || phase === 'inventory') && (
        <div className="game-screen">
          <div className="game-main">
            <div className="game-canvas-container">
              <GameCanvas diagonalMode={diagonalMode} />
            </div>
            <HUD />
          </div>
          <MessageLog />
          <MobileDPad
            onDirection={handleMobileDirection}
            onAction={handleMobileAction}
          />
          {phase === 'inventory' && <Inventory />}
        </div>
      )}

      {phase === 'gameover' && <GameOverScreen />}

      {phase === 'result' && <ResultScreen />}

      <DebugPanel />
    </div>
  );
}

export default App;
