// インベントリ画面

import { useGameStore } from '../state/gameState';

export function Inventory() {
    const { state, useItem, toggleInventory } = useGameStore();
    const { player } = state;

    if (!player) return null;

    const handleUseItem = (index: number) => {
        useItem(index);
    };

    return (
        <div className="inventory-overlay">
            <div className="inventory-panel">
                <div className="inventory-header">
                    <h2>アイテム</h2>
                    <button className="inventory-close" onClick={toggleInventory}>
                        ✕
                    </button>
                </div>

                <div className="inventory-list">
                    {player.inventory.length === 0 ? (
                        <div className="inventory-empty">アイテムを持っていない</div>
                    ) : (
                        player.inventory.map((item, index) => (
                            <div key={item.id} className="inventory-item">
                                <div className="inventory-item-info">
                                    <span className="inventory-item-name">{item.name}</span>
                                    <span className="inventory-item-effect">
                                        {item.kind === 'potion'
                                            ? `HP+${item.effect}`
                                            : item.kind === 'scroll'
                                                ? `威力${item.effect}`
                                                : `ATK+${item.effect}`}
                                    </span>
                                </div>
                                <button
                                    className="inventory-item-use"
                                    onClick={() => handleUseItem(index)}
                                >
                                    使う
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="inventory-footer">
                    <span className="inventory-hint">[I] または [Esc] で閉じる</span>
                </div>
            </div>
        </div>
    );
}
