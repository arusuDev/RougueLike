// ダンジョン選択画面

import { DUNGEON_LIST, getDungeon, type DungeonId } from '../data/dungeons/index';
import { usePersistentStore } from '../state/persistentState';

interface DungeonSelectProps {
    onSelectDungeon: (dungeonId: DungeonId) => void;
    onBack: () => void;
    onSkillTree: () => void;
}

export function DungeonSelect({ onSelectDungeon, onBack, onSkillTree }: DungeonSelectProps) {
    const { saveData } = usePersistentStore();

    // 難易度を星で表示
    const renderStars = (difficulty: number) => {
        return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
    };

    return (
        <div className="dungeon-select-screen">
            <h1 className="dungeon-select-title">ダンジョン選択</h1>

            <div className="dp-display">
                <span className="dp-label">所持DP:</span>
                <span className="dp-value">{saveData.currentDP}</span>
                <span className="dp-separator">|</span>
                <span className="dp-label">累計獲得:</span>
                <span className="dp-value-sub">{saveData.totalDP}</span>
            </div>

            <div className="dungeon-list">
                {DUNGEON_LIST.map((dungeonId) => {
                    const dungeon = getDungeon(dungeonId);
                    const isCleared = saveData.dungeonProgress[dungeonId]?.cleared ?? false;

                    return (
                        <div
                            key={dungeonId}
                            className={`dungeon-card ${isCleared ? 'cleared' : ''}`}
                            onClick={() => onSelectDungeon(dungeonId)}
                        >
                            {isCleared && (
                                <div className="cleared-badge">CLEAR</div>
                            )}

                            <h2 className="dungeon-name">{dungeon.name}</h2>

                            <div className="dungeon-info">
                                <div className="dungeon-floors">
                                    <span className="info-label">階層:</span>
                                    <span className="info-value">{dungeon.floors}F</span>
                                </div>
                                <div className="dungeon-difficulty">
                                    <span className="info-label">難易度:</span>
                                    <span className="info-value stars">{renderStars(dungeon.difficulty)}</span>
                                </div>
                                {dungeon.recommendedDP > 0 && (
                                    <div className="dungeon-recommended">
                                        <span className="info-label">推奨DP:</span>
                                        <span className="info-value">{dungeon.recommendedDP}</span>
                                    </div>
                                )}
                            </div>

                            <p className="dungeon-description">{dungeon.description}</p>
                        </div>
                    );
                })}
            </div>

            <div className="dungeon-select-actions">
                <button className="btn-skill-tree" onClick={onSkillTree}>
                    スキルツリー
                </button>
                <button className="btn-back" onClick={onBack}>
                    タイトルに戻る
                </button>
            </div>
        </div>
    );
}
