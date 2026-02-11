// モバイル用8方向D-Padコントローラー

import { useCallback, useRef } from 'react';
import type { Direction } from '../types';

interface MobileDPadProps {
    onDirection: (direction: Direction) => void;
    onAction: (action: 'stairs' | 'inventory' | 'attack') => void;
}

export function MobileDPad({ onDirection, onAction }: MobileDPadProps) {
    const repeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopRepeat = useCallback(() => {
        if (repeatTimerRef.current) {
            clearInterval(repeatTimerRef.current);
            repeatTimerRef.current = null;
        }
    }, []);

    const handlePress = useCallback((direction: Direction) => {
        onDirection(direction);
        stopRepeat();
        // 長押しで連続移動（300ms後に200ms間隔）
        const timer = setTimeout(() => {
            repeatTimerRef.current = setInterval(() => {
                onDirection(direction);
            }, 200);
        }, 300);
        // タイマーIDを保存して、離した時にクリア
        repeatTimerRef.current = timer as unknown as ReturnType<typeof setInterval>;
    }, [onDirection, stopRepeat]);

    const handleRelease = useCallback(() => {
        stopRepeat();
    }, [stopRepeat]);

    // タッチイベントのデフォルト動作を防止
    const preventTouch = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
    }, []);

    const dirButton = (direction: Direction, label: string, className: string) => (
        <button
            className={`dpad-btn ${className}`}
            onTouchStart={(e) => { e.preventDefault(); handlePress(direction); }}
            onTouchEnd={(e) => { e.preventDefault(); handleRelease(); }}
            onTouchCancel={handleRelease}
            onMouseDown={() => handlePress(direction)}
            onMouseUp={handleRelease}
            onMouseLeave={handleRelease}
        >
            {label}
        </button>
    );

    return (
        <div className="mobile-controls" onTouchMove={preventTouch}>
            <div className="dpad-container">
                <div className="dpad-grid">
                    {dirButton('up-left', '↖', 'dpad-ul')}
                    {dirButton('up', '↑', 'dpad-u')}
                    {dirButton('up-right', '↗', 'dpad-ur')}
                    {dirButton('left', '←', 'dpad-l')}
                    <div className="dpad-center" />
                    {dirButton('right', '→', 'dpad-r')}
                    {dirButton('down-left', '↙', 'dpad-dl')}
                    {dirButton('down', '↓', 'dpad-d')}
                    {dirButton('down-right', '↘', 'dpad-dr')}
                </div>
            </div>
            <div className="action-buttons">
                <button
                    className="action-btn action-btn-attack"
                    onTouchStart={(e) => { e.preventDefault(); onAction('attack'); }}
                    onClick={() => onAction('attack')}
                >
                    攻撃
                </button>
                <button
                    className="action-btn action-btn-stairs"
                    onTouchStart={(e) => { e.preventDefault(); onAction('stairs'); }}
                    onClick={() => onAction('stairs')}
                >
                    階段
                </button>
                <button
                    className="action-btn action-btn-inventory"
                    onTouchStart={(e) => { e.preventDefault(); onAction('inventory'); }}
                    onClick={() => onAction('inventory')}
                >
                    袋
                </button>
            </div>
        </div>
    );
}
