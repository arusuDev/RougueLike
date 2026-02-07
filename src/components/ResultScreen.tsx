// リザルト画面

import { useGameStore } from '../state/gameState';
import { usePersistentStore } from '../state/persistentState';
import { getDungeon } from '../data/dungeons/index';
import { calculateTotalDP, type DPCalculationResult } from '../data/dpCalculation';
import { useEffect, useState, useRef } from 'react';

export function ResultScreen() {
    const { state, resetGame, setPhase, currentDungeonId } = useGameStore();
    const { addDP, markDungeonCleared, incrementClears } = usePersistentStore();
    const [dpResult, setDpResult] = useState<DPCalculationResult | null>(null);
    const dpAwardedRef = useRef(false);

    const dungeon = currentDungeonId ? getDungeon(currentDungeonId) : null;

    // DP計算と付与（一度だけ実行）
    useEffect(() => {
        if (state.player && !dpAwardedRef.current) {
            dpAwardedRef.current = true;  // 最初にフラグを立てる

            const result = calculateTotalDP(state.player);
            setDpResult(result);

            // DPを付与
            addDP(result.totalDP);

            // ダンジョンクリアを記録
            if (currentDungeonId) {
                markDungeonCleared(currentDungeonId);
            }

            // 統計更新
            incrementClears();
        }
    }, [state.player, addDP, markDungeonCleared, incrementClears, currentDungeonId]);

    const handleToDungeonSelect = () => {
        resetGame();
        setPhase('dungeon-select');
    };

    const handleToTitle = () => {
        resetGame();
    };

    if (!dpResult || !dungeon) {
        return null;
    }

    return (
        <div className="result-overlay">
            <div className="result-panel">
                <h1 className="result-title">ダンジョンクリア！</h1>

                <div className="result-dungeon-name">
                    『{dungeon.name}』 クリア
                </div>

                <div className="result-stats">
                    <div className="result-section">
                        <h3 className="result-section-title">獲得経験値</h3>
                        <div className="result-row">
                            <span className="result-label">経験値</span>
                            <span className="result-value">{state.player?.exp ?? 0} EXP</span>
                        </div>
                        <div className="result-row result-dp">
                            <span className="result-label">→ DP変換</span>
                            <span className="result-value dp">{dpResult.expDP} DP</span>
                        </div>
                    </div>

                    {dpResult.itemBreakdown.length > 0 && (
                        <div className="result-section">
                            <h3 className="result-section-title">所持アイテム</h3>
                            {dpResult.itemBreakdown.map((item, index) => (
                                <div key={index} className="result-row">
                                    <span className="result-label">{item.name} x{item.count}</span>
                                    <span className="result-value dp">{item.dpValue} DP</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="result-total">
                        <span className="result-total-label">合計獲得DP</span>
                        <span className="result-total-value">{dpResult.totalDP} DP</span>
                    </div>
                </div>

                <div className="result-buttons">
                    <button className="result-button result-button-continue" onClick={handleToDungeonSelect}>
                        ダンジョン選択へ
                    </button>
                    <button className="result-button result-button-title" onClick={handleToTitle}>
                        タイトルへ
                    </button>
                </div>
            </div>
        </div>
    );
}
