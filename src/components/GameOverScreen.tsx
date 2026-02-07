// ゲームオーバー画面

import { useGameStore } from '../state/gameState';

export function GameOverScreen() {
    const { state, resetGame, setPhase } = useGameStore();
    const { floorNumber, turnCount } = state;

    const handleRetry = () => {
        resetGame();
        setPhase('dungeon-select');
    };

    const handleTitle = () => {
        resetGame();
    };

    return (
        <div className="gameover-overlay">
            <div className="gameover-panel">
                <h1 className="gameover-title">GAME OVER</h1>

                <div className="gameover-stats">
                    <div className="gameover-stat">
                        <span className="gameover-stat-label">到達フロア</span>
                        <span className="gameover-stat-value">{floorNumber}F</span>
                    </div>
                    <div className="gameover-stat">
                        <span className="gameover-stat-label">経過ターン</span>
                        <span className="gameover-stat-value">{turnCount}</span>
                    </div>
                </div>

                <div className="gameover-message">
                    ダンジョンで力尽きてしまった...
                </div>

                <div className="gameover-buttons">
                    <button className="gameover-button gameover-button-retry" onClick={handleRetry}>
                        リトライ
                    </button>
                    <button className="gameover-button gameover-button-title" onClick={handleTitle}>
                        タイトルへ
                    </button>
                </div>
            </div>
        </div>
    );
}
