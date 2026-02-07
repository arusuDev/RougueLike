// タイトル画面

import { useGameStore } from '../state/gameState';

export function TitleScreen() {
    const { setPhase } = useGameStore();

    const handleStart = () => {
        setPhase('dungeon-select');
    };

    return (
        <div className="title-screen">
            <div className="title-content">
                <h1 className="title-logo">
                    <span className="title-logo-main">不思議な</span>
                    <span className="title-logo-sub">ダンジョン</span>
                </h1>

                <div className="title-subtitle">A Mystery Dungeon Adventure</div>

                <div className="title-menu">
                    <button className="title-button" onClick={handleStart}>
                        <span className="title-button-icon">▶</span>
                        ゲームスタート
                    </button>
                </div>

                <div className="title-controls">
                    <div className="title-control-section">
                        <h3>操作方法</h3>
                        <div className="title-control-item">
                            <span className="title-key">↑↓←→</span>
                            <span>または</span>
                            <span className="title-key">WASD</span>
                            <span>移動・攻撃</span>
                        </div>
                        <div className="title-control-item">
                            <span className="title-key">I</span>
                            <span>インベントリ</span>
                        </div>
                        <div className="title-control-item">
                            <span className="title-key">Enter</span>
                            <span>階段を降りる</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="title-footer">
                <span>© 2026 Mystery Dungeon Game</span>
            </div>
        </div>
    );
}
