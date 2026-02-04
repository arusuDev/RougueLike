// デバッグパネル

import { useDebugStore } from '../state/debugState';
import { useGameStore } from '../state/gameState';

export function DebugPanel() {
    const { debug, toggleFullMap, toggleEnemyInfo, toggleCoordinates } = useDebugStore();
    const { state, toggleGodMode } = useGameStore();

    if (!debug.enabled) return null;

    const { player, enemies, floorNumber, turnCount, floor } = state;

    return (
        <div className="debug-panel">
            <div className="debug-header">
                <span>🔧 DEBUG MODE</span>
                <span className="debug-key-hint">[F3] to close</span>
            </div>

            <div className="debug-section">
                <div className="debug-title">オプション</div>
                <label className="debug-checkbox">
                    <input
                        type="checkbox"
                        checked={debug.showFullMap}
                        onChange={toggleFullMap}
                    />
                    マップ全体表示 [M]
                </label>
                <label className="debug-checkbox">
                    <input
                        type="checkbox"
                        checked={debug.showEnemyInfo}
                        onChange={toggleEnemyInfo}
                    />
                    敵情報表示
                </label>
                <label className="debug-checkbox">
                    <input
                        type="checkbox"
                        checked={debug.showCoordinates}
                        onChange={toggleCoordinates}
                    />
                    座標表示
                </label>
                <label className="debug-checkbox">
                    <input
                        type="checkbox"
                        checked={state.godMode}
                        onChange={toggleGodMode}
                    />
                    無敵モード [G]
                </label>
            </div>

            {player && (
                <div className="debug-section">
                    <div className="debug-title">プレイヤー</div>
                    <div className="debug-info">
                        <span>位置: ({player.position.x}, {player.position.y})</span>
                    </div>
                    <div className="debug-info">
                        <span>HP: {player.hp}/{player.maxHp}</span>
                    </div>
                    <div className="debug-info">
                        <span>ATK: {player.attack} / DEF: {player.defense}</span>
                    </div>
                    <div className="debug-info">
                        <span>EXP: {player.exp} / Lv: {player.level}</span>
                    </div>
                </div>
            )}

            <div className="debug-section">
                <div className="debug-title">ダンジョン</div>
                <div className="debug-info">
                    <span>フロア: {floorNumber}F</span>
                </div>
                <div className="debug-info">
                    <span>ターン: {turnCount}</span>
                </div>
                {floor && (
                    <>
                        <div className="debug-info">
                            <span>部屋数: {floor.rooms.length}</span>
                        </div>
                        <div className="debug-info">
                            <span>階段: ({floor.stairsPosition.x}, {floor.stairsPosition.y})</span>
                        </div>
                    </>
                )}
            </div>

            <div className="debug-section">
                <div className="debug-title">敵 ({enemies.length}体)</div>
                {debug.showEnemyInfo && enemies.map((enemy) => (
                    <div key={enemy.id} className="debug-enemy">
                        <span className="debug-enemy-name">{enemy.name}</span>
                        <span className="debug-enemy-stats">
                            HP:{enemy.hp}/{enemy.maxHp} ({enemy.position.x},{enemy.position.y})
                        </span>
                    </div>
                ))}
            </div>

            <div className="debug-section debug-shortcuts">
                <div className="debug-title">ショートカット</div>
                <div className="debug-info">[F3] デバッグ切替</div>
                <div className="debug-info">[M] マップ全体</div>
                <div className="debug-info">[G] 無敵モード</div>
                <div className="debug-info">[N] 次のフロア</div>
                <div className="debug-info">[H] HP全回復</div>
            </div>
        </div>
    );
}
