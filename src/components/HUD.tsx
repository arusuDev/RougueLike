// HUD（ヘッドアップディスプレイ）

import { useGameStore } from '../state/gameState';

export function HUD() {
    const { state } = useGameStore();
    const { player, floorNumber, turnCount } = state;

    if (!player) return null;

    const hpPercent = (player.hp / player.maxHp) * 100;
    const spPercent = player.maxSp > 0
        ? (player.sp / player.maxSp) * 100
        : 100;
    const expPercent = player.expToNext > 0
        ? (player.exp / player.expToNext) * 100
        : 100;

    return (
        <div className="hud">
            <div className="hud-section">
                <div className="hud-label">HP</div>
                <div className="hud-bar-container">
                    <div
                        className="hud-bar hud-bar-hp"
                        style={{ width: `${hpPercent}%` }}
                    />
                    <span className="hud-bar-text">
                        {player.hp} / {player.maxHp}
                    </span>
                </div>
            </div>

            <div className="hud-section">
                <div className="hud-label">SP</div>
                <div className="hud-bar-container">
                    <div
                        className="hud-bar hud-bar-sp"
                        style={{ width: `${spPercent}%` }}
                    />
                    <span className="hud-bar-text">
                        {player.sp} / {player.maxSp}
                    </span>
                </div>
            </div>

            <div className="hud-section">
                <div className="hud-label">EXP</div>
                <div className="hud-bar-container">
                    <div
                        className="hud-bar hud-bar-exp"
                        style={{ width: `${expPercent}%` }}
                    />
                    <span className="hud-bar-text">
                        {player.exp} / {player.expToNext}
                    </span>
                </div>
            </div>

            <div className="hud-stats">
                <div className="hud-stat">
                    <span className="hud-stat-label">Lv</span>
                    <span className="hud-stat-value">{player.level}</span>
                </div>
                <div className="hud-stat">
                    <span className="hud-stat-label">ATK</span>
                    <span className="hud-stat-value">{player.attack}</span>
                </div>
                <div className="hud-stat">
                    <span className="hud-stat-label">DEF</span>
                    <span className="hud-stat-value">{player.defense}</span>
                </div>
                <div className="hud-stat">
                    <span className="hud-stat-label">Floor</span>
                    <span className="hud-stat-value">{floorNumber}F</span>
                </div>
                <div className="hud-stat">
                    <span className="hud-stat-label">Turn</span>
                    <span className="hud-stat-value">{turnCount}</span>
                </div>
            </div>

            <div className="hud-inventory-hint">
                <span>アイテム: {player.inventory.length}個</span>
                <span className="hud-key">[I]</span>
            </div>
        </div>
    );
}
