import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
import TeacherDashboard from './components/TeacherDashboard';
import StudentInterface from './components/StudentInterface';
import Home from './pages/Home';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/toaster';
import { LoadingOverlay } from './components/ui/spinner';
import { socketService } from './services/socketService';

const App: React.FC = () => {
  const { currentUser, logout } = useUser();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Handle initial authentication check
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const session = localStorage.getItem('polling_session');
        if (session) {
          const { token } = JSON.parse(session);
          await socketService.connect(token);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [logout]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await socketService.disconnect();
      logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isInitializing) {
    return <LoadingOverlay message="Initializing..." />;
  }

  return (
    <>
      {currentUser && (
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Live Polling</h1>
              <span className="text-sm text-gray-500">
                Logged in as {currentUser.name} ({currentUser.role})
              </span>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </header>
      )}

      <main className={currentUser ? "min-h-[calc(100vh-64px)]" : "min-h-screen"}>
        <Routes>
          {/* Public route */}
          <Route
            path="/"
            element={
              currentUser ? (
                <Navigate
                  to={currentUser.role === 'teacher' ? '/teacher' : '/student'}
                  replace
                />
              ) : (
                <Home />
              )
            }
          />

          {/* Protected routes */}
          <Route
            path="/teacher"
            element={
              !currentUser ? (
                <Navigate to="/" replace />
              ) : currentUser.role !== 'teacher' ? (
                <Navigate to="/student" replace />
              ) : (
                <TeacherDashboard />
              )
            }
          />

          <Route
            path="/student"
            element={
              !currentUser ? (
                <Navigate to="/" replace />
              ) : currentUser.role !== 'student' ? (
                <Navigate to="/teacher" replace />
              ) : (
                <StudentInterface />
              )
            }
          />

          {/* Catch all unmatched routes */}
          <Route
            path="*"
            element={
              <Navigate
                to={currentUser ? (currentUser.role === 'teacher' ? '/teacher' : '/student') : '/'}
                replace
              />
            }
          />
        </Routes>
      </main>

      {isLoggingOut && <LoadingOverlay message="Logging out..." />}
      <Toaster />
    </>
  );
};

export default App;
