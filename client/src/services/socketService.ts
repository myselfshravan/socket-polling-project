import { io, Socket } from 'socket.io-client';
import { SocketEvents, ServerEvents, Poll, CreatePollDto, VoteDto } from '../types/poll';
import { config } from '../config/env';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private reconnectAttempts = 5;
  private reconnectDelay = 1000;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(token: string): Socket {
    if (!this.socket) {
      this.socket = io(config.socketUrl, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.reconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.setupConnectionHandlers();
    }
    return this.socket;
  }

  private setupConnectionHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error.message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private emit<T extends keyof ServerEvents>(event: T, data: ServerEvents[T]): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit(event, data);
  }

  // Poll Creation
  createPoll(data: CreatePollDto) {
    this.emit('create-poll', data);
  }

  // Poll Activation
  activatePoll(pollId: string) {
    this.emit('activate-poll', pollId);
  }

  // Poll Ending
  endPoll(pollId: string) {
    this.emit('end-poll', pollId);
  }

  // Vote Submission
  submitVote(data: VoteDto) {
    this.emit('submit-vote', data);
  }

  // Event Listeners
  onPollCreated(callback: (poll: Poll) => void): () => void {
    if (!this.socket) return () => {};
    this.socket.on('poll-created', callback);
    return () => this.socket?.off('poll-created', callback);
  }

  onPollActivated(callback: (poll: Poll) => void): () => void {
    if (!this.socket) return () => {};
    this.socket.on('poll-activated', callback);
    return () => this.socket?.off('poll-activated', callback);
  }

  onPollEnded(callback: (poll: Poll) => void): () => void {
    if (!this.socket) return () => {};
    this.socket.on('poll-ended', callback);
    return () => this.socket?.off('poll-ended', callback);
  }

  onPollUpdated(callback: (data: { pollId: string; results: Record<string, number> }) => void): () => void {
    if (!this.socket) return () => {};
    this.socket.on('poll-updated', callback);
    return () => this.socket?.off('poll-updated', callback);
  }

  onError(callback: (error: { message: string }) => void): () => void {
    if (!this.socket) return () => {};
    this.socket.on('error', callback);
    return () => this.socket?.off('error', callback);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = SocketService.getInstance();
