// メッセージログ

import { useGameStore } from '../state/gameState';
import { useEffect, useRef } from 'react';

export function MessageLog() {
    const { state } = useGameStore();
    const { messages } = state;
    const logRef = useRef<HTMLDivElement>(null);

    // 新しいメッセージが追加されたら自動スクロール
    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="message-log" ref={logRef}>
            {messages.length === 0 ? (
                <div className="message-log-empty">...</div>
            ) : (
                messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message-log-item ${index === messages.length - 1 ? 'message-log-item-new' : ''
                            }`}
                    >
                        {msg}
                    </div>
                ))
            )}
        </div>
    );
}
