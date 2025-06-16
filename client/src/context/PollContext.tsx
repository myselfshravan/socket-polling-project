
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: number[];
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface User {
  id: string;
  name: string;
  role: 'teacher' | 'student';
}

interface PollContextType {
  polls: Poll[];
  currentUser: User | null;
  activePoll: Poll | null;
  createPoll: (question: string, options: string[]) => void;
  votePoll: (pollId: string, optionIndex: number) => void;
  setActivePoll: (pollId: string) => void;
  endPoll: (pollId: string) => void;
  setUser: (user: User) => void;
  connectedUsers: number;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export const usePoll = () => {
  const context = useContext(PollContext);
  if (!context) {
    throw new Error('usePoll must be used within a PollProvider');
  }
  return context;
};

export const PollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePoll, setActivePollState] = useState<Poll | null>(null);
  const [connectedUsers, setConnectedUsers] = useState(1);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectedUsers(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const createPoll = (question: string, options: string[]) => {
    if (!currentUser) return;
    
    const newPoll: Poll = {
      id: Math.random().toString(36).substr(2, 9),
      question,
      options,
      votes: new Array(options.length).fill(0),
      isActive: false,
      createdAt: new Date(),
      createdBy: currentUser.id,
    };
    
    setPolls(prev => [newPoll, ...prev]);
  };

  const votePoll = (pollId: string, optionIndex: number) => {
    setPolls(prev => prev.map(poll => {
      if (poll.id === pollId && poll.isActive) {
        const newVotes = [...poll.votes];
        newVotes[optionIndex]++;
        return { ...poll, votes: newVotes };
      }
      return poll;
    }));
  };

  const setActivePoll = (pollId: string) => {
    setPolls(prev => prev.map(poll => ({
      ...poll,
      isActive: poll.id === pollId
    })));
    
    const poll = polls.find(p => p.id === pollId);
    setActivePollState(poll || null);
  };

  const endPoll = (pollId: string) => {
    setPolls(prev => prev.map(poll => ({
      ...poll,
      isActive: poll.id === pollId ? false : poll.isActive
    })));
    setActivePollState(null);
  };

  const setUser = (user: User) => {
    setCurrentUser(user);
  };

  return (
    <PollContext.Provider value={{
      polls,
      currentUser,
      activePoll,
      createPoll,
      votePoll,
      setActivePoll,
      endPoll,
      setUser,
      connectedUsers
    }}>
      {children}
    </PollContext.Provider>
  );
};
