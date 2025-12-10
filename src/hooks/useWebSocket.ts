import { useEffect, useRef, useState, useCallback } from 'react';
import type { WebSocketMessage, GameState } from '../types/game';

export function useWebSocket(url: string | null) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimeoutRef = useRef<number | undefined>();

  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    },
    [socket]
  );

  useEffect(() => {
    if (!url) return;

    const ws = new WebSocket(url);

    ws.onopen = () => {
      setSocket(ws);
      setConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        if (message.type === 'game-state') {
          setGameState(message.data as GameState);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      setConnected(false);
      setSocket(null);
      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = window.setTimeout(() => {
        if (url) {
          // Trigger reconnection by updating URL (component will re-render)
        }
      }, 3000);
    };

    return () => {
      ws.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [url]);

  return { socket, gameState, connected, sendMessage, setGameState };
}

