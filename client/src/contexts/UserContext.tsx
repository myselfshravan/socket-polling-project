import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SessionData } from '../types/user';
import { socketService } from '../services/socketService';
import { useToast } from '../hooks/use-toast';

interface UserContextType {
  currentUser: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const SESSION_KEY = 'polling_session';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize user from session storage
  useEffect(() => {
    const initializeUser = () => {
      try {
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
          const { user, token } = JSON.parse(savedSession) as SessionData;
          setCurrentUser(user);
          // Don't connect socket here as App component handles that
        }
      } catch (error) {
        console.error('Failed to load user session:', error);
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const setUser = (user: User) => {
    try {
      const token = `token-${user.id}-${Date.now()}`; // In a real app, this would be a JWT
      const sessionData: SessionData = { user, token };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      setCurrentUser(user);

      toast({
        title: 'Welcome!',
        description: `Logged in as ${user.name} (${user.role})`,
      });
    } catch (error) {
      console.error('Failed to save user session:', error);
      toast({
        title: 'Error',
        description: 'Failed to save session',
        variant: 'destructive',
      });
    }
  };

  const logout = () => {
    try {
      // Socket disconnection is handled by App component
      localStorage.removeItem(SESSION_KEY);
      setCurrentUser(null);

      toast({
        title: 'Logged out',
        description: 'Successfully logged out',
      });
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: 'Error',
        description: 'Failed to logout properly',
        variant: 'destructive',
      });
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        currentUser, 
        setUser, 
        logout,
        isLoading 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};