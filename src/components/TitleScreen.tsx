// タイトル画面

import { useGameStore } from '../state/gameState';
import { usePersistentStore } from '../state/persistentState';

export function TitleScreen() {
    const { setPhase } = useGameStore();
    const { resetAllData } = usePersistentStore();

    const handleStart = () => {
        setPhase('dungeon-select');
    };

    const handleResetData = () => {
        if (window.confirm('本当にすべてのセーブデータを初期化しますか？\n（DP、スキル、クリア状況がすべて消去されます）')) {
            resetAllData();
            alert('セーブデータを初期化しました。');
        }
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
                    <button className="title-button title-button-danger" onClick={handleResetData}>
                        <span className="title-button-icon">⚠</span>
                        データ初期化
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
                <span>© 2026 Emeria Developers Game</span>
            </div>
        </div>
    );
}
