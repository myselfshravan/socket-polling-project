import { io } from 'socket.io-client';
import { config } from '../config/env';
import { CreatePollDto, Poll, PollResults, PollSocket, VoteData } from '../types/poll';

class SocketService {
  private socket: PollSocket | null = null;
  private static instance: SocketService;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(): PollSocket {
    if (!this.socket) {
      this.socket = io(config.socketUrl, {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      }) as PollSocket;

      this.setupBasicEventHandlers();
    }

    return this.socket;
  }

  private setupBasicEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Specific event emitters
  joinPoll(pollId: string): void {
    if (!this.socket) {
      console.error('Socket not connected. Cannot join poll');
      return;
    }
    this.socket.emit('join-poll', pollId);
  }

  createPoll(data: CreatePollDto): void {
    if (!this.socket) {
      console.error('Socket not connected. Cannot create poll');
      return;
    }
    this.socket.emit('create-poll', data);
  }

  submitVote(data: VoteData): void {
    if (!this.socket) {
      console.error('Socket not connected. Cannot submit vote');
      return;
    }
    this.socket.emit('submit-vote', data);
  }

  // Specific event listeners
  onPollCreated(callback: (poll: Poll) => void): void {
    if (!this.socket) {
      console.error('Socket not connected. Cannot listen for poll creation');
      return;
    }
    this.socket.on('poll-created', callback);
  }

  onPollUpdated(callback: (results: PollResults) => void): void {
    if (!this.socket) {
      console.error('Socket not connected. Cannot listen for poll updates');
      return;
    }
    this.socket.on('poll-updated', callback);
  }

  onPollError(callback: (error: { message: string }) => void): void {
    if (!this.socket) {
      console.error('Socket not connected. Cannot listen for poll errors');
      return;
    }
    this.socket.on('poll-error', callback);
  }

  // Remove specific event listeners
  offPollCreated(callback: (poll: Poll) => void): void {
    if (!this.socket) return;
    this.socket.off('poll-created', callback);
  }

  offPollUpdated(callback: (results: PollResults) => void): void {
    if (!this.socket) return;
    this.socket.off('poll-updated', callback);
  }

  offPollError(callback: (error: { message: string }) => void): void {
    if (!this.socket) return;
    this.socket.off('poll-error', callback);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = SocketService.getInstance();