import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { CreatePollDto, Poll, PollResults, VoteDto } from '../types/poll';
import { User, SessionData } from '../types/user';
import { useToast } from '../hooks/use-toast';

interface PollContextType {
  polls: Poll[];
  activePoll: Poll | null;
  currentUser: SessionData | null;
  loading: boolean;
  error: string | null;
  createPoll: (data: CreatePollDto) => void;
  submitVote: (data: VoteDto) => void;
  setActivePoll: (poll: Poll | null) => void;
  setUser: (session: SessionData) => void;
  logout: () => void;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export const PollProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [currentUser, setCurrentUser] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socket = useSocket(currentUser?.token || null);
  
  // Access user data from session
  const userData = currentUser?.user;
  const { toast } = useToast();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('pollUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('pollUser');
      }
    }
  }, []);

  useEffect(() => {
    loadPolls();

    socket.onPollCreated((poll) => {
      const newPoll = {
        ...poll,
        endsAt: new Date(Date.now() + poll.duration * 1000)
      };
      setPolls((prevPolls) => [...prevPolls, newPoll]);

      toast({
        title: 'New Poll',
        description: 'A new poll has been created',
      });
    });

    socket.onPollUpdated((results) => {
      setPolls((prevPolls) =>
        prevPolls.map((poll) =>
          poll.id === results.pollId
            ? { ...poll, results: results.results }
            : poll
        )
      );

      if (activePoll?.id === results.pollId) {
        setActivePoll((prev) =>
          prev ? { ...prev, results: results.results } : null
        );
      }
    });

    socket.onPollError((error) => {
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    });
  }, [socket, activePoll, toast]);

  const loadPolls = async () => {
    try {
      setLoading(true);
      const fetchedPolls = await api.getAllPolls();
      setPolls(fetchedPolls);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load polls';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createPoll = async (data: CreatePollDto) => {
    if (!currentUser) {
      const message = 'You must be logged in to create a poll';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      socket.createPoll({
        ...data,
        createdBy: userData?.id
      });
      toast({
        title: 'Success',
        description: 'Poll created successfully',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create poll';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const submitVote = (data: VoteDto) => {
    if (!currentUser) {
      const message = 'You must be logged in to vote';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return;
    }

    socket.submitVote({
      ...data,
      voterId: userData?.id
    });
  };

  const setUser = (session: SessionData) => {
    setCurrentUser(session);
    localStorage.setItem('pollUser', JSON.stringify(session));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pollUser');
  };

  const value = {
    polls,
    activePoll,
    currentUser,
    loading,
    error,
    createPoll,
    submitVote,
    setActivePoll,
    setUser,
    logout,
  };

  return <PollContext.Provider value={value}>{children}</PollContext.Provider>;
};

export const usePoll = () => {
  const context = useContext(PollContext);
  if (context === undefined) {
    throw new Error('usePoll must be used within a PollProvider');
  }
  return context;
};
