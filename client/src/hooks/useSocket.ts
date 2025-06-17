import { useEffect, useCallback } from 'react';
import { socketService } from '../services/socket';
import { CreatePollDto, Poll, PollResults, VoteData } from '../types/poll';

export const useSocket = () => {
  useEffect(() => {
    const socket = socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);

  const joinPoll = useCallback((pollId: string) => {
    socketService.joinPoll(pollId);
  }, []);

  const createPoll = useCallback((pollData: CreatePollDto) => {
    socketService.createPoll(pollData);
  }, []);

  const submitVote = useCallback((voteData: VoteData) => {
    socketService.submitVote(voteData);
  }, []);

  const onPollCreated = useCallback((callback: (poll: Poll) => void) => {
    socketService.onPollCreated(callback);
    return () => socketService.offPollCreated(callback);
  }, []);

  const onPollUpdated = useCallback((callback: (results: PollResults) => void) => {
    socketService.onPollUpdated(callback);
    return () => socketService.offPollUpdated(callback);
  }, []);

  const onPollError = useCallback((callback: (error: { message: string }) => void) => {
    socketService.onPollError(callback);
    return () => socketService.offPollError(callback);
  }, []);

  return {
    joinPoll,
    createPoll,
    submitVote,
    onPollCreated,
    onPollUpdated,
    onPollError,
    isConnected: socketService.isConnected()
  };
};