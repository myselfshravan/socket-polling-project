import { useEffect, useRef, useState, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { Poll, CreatePollDto, VoteDto, PollResults } from '../types/poll';

interface UseSocketReturn {
  socket: typeof socketService;
  isConnected: boolean;
  lastError: string | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  // Poll event handlers
  onPollCreated: (callback: (poll: Poll) => void) => () => void;
  onPollUpdated: (callback: (data: PollResults) => void) => () => void;
  onPollActivated: (callback: (poll: Poll) => void) => () => void;
  onPollEnded: (callback: (poll: Poll) => void) => () => void;
  onPollError: (callback: (error: { message: string }) => void) => () => void;
  // Poll actions
  createPoll: (data: CreatePollDto) => void;
  activatePoll: (pollId: string) => void;
  endPoll: (pollId: string) => void;
  submitVote: (data: VoteDto) => void;
}

export const useSocket = (token: string | null): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const isConnectedRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setConnectionStatus('connected');
    setLastError(null);
    isConnectedRef.current = true;
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setConnectionStatus('disconnected');
    isConnectedRef.current = false;
  }, []);

  const handleError = useCallback((error: Error) => {
    setLastError(error.message);
    setConnectionStatus('disconnected');
  }, []);

  const handleTokenRefresh = useCallback((newToken: string) => {
    // Store the new token (you might want to call an external handler here)
    localStorage.setItem('token', newToken);
  }, []);

  useEffect(() => {
    if (token && !isConnectedRef.current) {
      setConnectionStatus('connecting');
      const socket = socketService.connect(token);

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('error', handleError);
      socket.on('token-refresh', ({ token: newToken }) => handleTokenRefresh(newToken));
      socket.on('connection-status', ({ status }) => {
        setConnectionStatus(status);
      });

      // Implement ping/pong for connection monitoring
      socket.on('ping', () => {
        socket.emit('pong');
      });
    }

    return () => {
      if (isConnectedRef.current) {
        socketService.disconnect();
        isConnectedRef.current = false;
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      }
    };
  }, [token, handleConnect, handleDisconnect, handleError, handleTokenRefresh]);

  // Automatic reconnection logic
  useEffect(() => {
    if (!isConnected && token) {
      reconnectTimeoutRef.current = setTimeout(() => {
        if (!isConnectedRef.current && token) {
          setConnectionStatus('connecting');
          socketService.connect(token);
        }
      }, 5000); // Attempt to reconnect after 5 seconds

      return () => {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };
    }
  }, [isConnected, token]);

  return {
    socket: socketService,
    isConnected,
    lastError,
    connectionStatus,
    // Poll event handlers
    onPollCreated: socketService.onPollCreated.bind(socketService),
    onPollUpdated: socketService.onPollUpdated.bind(socketService),
    onPollActivated: socketService.onPollActivated.bind(socketService),
    onPollEnded: socketService.onPollEnded.bind(socketService),
    onPollError: socketService.onError.bind(socketService),
    // Poll actions
    createPoll: socketService.createPoll.bind(socketService),
    activatePoll: socketService.activatePoll.bind(socketService),
    endPoll: socketService.endPoll.bind(socketService),
    submitVote: socketService.submitVote.bind(socketService),
  };
};
