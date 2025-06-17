import React, { createContext, useContext, useState, useEffect } from 'react';
import { socketService } from '../services/socketService';
import { Poll, PollState, CreatePollDto, VoteDto } from '../types/poll';
import { useUser } from './UserContext';
import { useToast } from '../hooks/use-toast';

interface PollContextType {
  polls: Poll[];
  activePoll: Poll | null;
  createPoll: (question: string, options: string[]) => Promise<void>;
  activatePoll: (pollId: string) => Promise<void>;
  endPoll: (pollId: string) => Promise<void>;
  submitVote: (pollId: string, option: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export const PollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser } = useUser();
  const { toast } = useToast();

  // Connect to socket when user is authenticated
  useEffect(() => {
    if (currentUser) {
      const token = localStorage.getItem('polling_session');
      if (token) {
        socketService.connect(token);

        // Set up socket event listeners
        const unsubscribeCreated = socketService.onPollCreated((poll) => {
          setPolls((prev) => [...prev, poll]);
          toast({
            title: 'New Poll Created',
            description: poll.question,
          });
        });

        const unsubscribeActivated = socketService.onPollActivated((poll) => {
          setPolls((prev) => 
            prev.map(p => p.id === poll.id ? poll : 
              p.state === PollState.LIVE ? { ...p, state: PollState.ENDED } : p
            )
          );
          setActivePoll(poll);
          toast({
            title: 'Poll Activated',
            description: poll.question,
          });
        });

        const unsubscribeEnded = socketService.onPollEnded((poll) => {
          setPolls((prev) => 
            prev.map(p => p.id === poll.id ? { ...p, state: PollState.ENDED } : p)
          );
          setActivePoll(null);
          toast({
            title: 'Poll Ended',
            description: poll.question,
          });
        });

        const unsubscribeUpdated = socketService.onPollUpdated(({ pollId, results }) => {
          setPolls((prev) => 
            prev.map(p => p.id === pollId ? { ...p, results } : p)
          );
          if (activePoll?.id === pollId) {
            setActivePoll((prev) => prev ? { ...prev, results } : null);
          }
        });

        const unsubscribeError = socketService.onError((error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        });

        // Cleanup socket listeners
        return () => {
          unsubscribeCreated();
          unsubscribeActivated();
          unsubscribeEnded();
          unsubscribeUpdated();
          unsubscribeError();
        };
      }
    } else {
      socketService.disconnect();
    }
  }, [currentUser, toast]);

  const createPoll = async (question: string, options: string[]) => {
    if (!currentUser || currentUser.role !== 'teacher') {
      throw new Error('Unauthorized');
    }

    try {
      setLoading(true);
      const pollData: CreatePollDto = {
        question,
        options,
        createdBy: currentUser.id
      };
      socketService.createPoll(pollData);
    } catch (err) {
      setError('Failed to create poll');
      toast({
        title: 'Error',
        description: 'Failed to create poll',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const activatePoll = async (pollId: string) => {
    if (!currentUser || currentUser.role !== 'teacher') {
      throw new Error('Unauthorized');
    }

    try {
      setLoading(true);
      socketService.activatePoll(pollId);
    } catch (err) {
      setError('Failed to activate poll');
      toast({
        title: 'Error',
        description: 'Failed to activate poll',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const endPoll = async (pollId: string) => {
    if (!currentUser || currentUser.role !== 'teacher') {
      throw new Error('Unauthorized');
    }

    try {
      setLoading(true);
      socketService.endPoll(pollId);
    } catch (err) {
      setError('Failed to end poll');
      toast({
        title: 'Error',
        description: 'Failed to end poll',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitVote = async (pollId: string, option: string) => {
    if (!currentUser || currentUser.role !== 'student') {
      throw new Error('Unauthorized');
    }

    try {
      setLoading(true);
      const voteData: VoteDto = {
        pollId,
        option,
        voterId: currentUser.id
      };
      socketService.submitVote(voteData);
    } catch (err) {
      setError('Failed to submit vote');
      toast({
        title: 'Error',
        description: 'Failed to submit vote',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PollContext.Provider
      value={{
        polls,
        activePoll,
        createPoll,
        activatePoll,
        endPoll,
        submitVote,
        loading,
        error,
      }}
    >
      {children}
    </PollContext.Provider>
  );
};

export const usePoll = () => {
  const context = useContext(PollContext);
  if (context === undefined) {
    throw new Error('usePoll must be used within a PollProvider');
  }
  return context;
};