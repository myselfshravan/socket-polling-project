
import React from 'react';
import { Users, Vote, BookOpen, Settings } from 'lucide-react';
import { usePoll } from '../context/PollContext';

const Header: React.FC = () => {
  const { currentUser, setUser, connectedUsers } = usePoll();

  const switchRole = (role: 'teacher' | 'student') => {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: role === 'teacher' ? 'Dr. Smith' : 'Student',
      role: role
    };
    setUser(newUser);
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Vote className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                LivePoll
              </h1>
              <p className="text-sm text-gray-500 font-medium">Real-time Polling Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">{connectedUsers} Online</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-600">Switch Role:</span>
              <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
                <button
                  onClick={() => switchRole('teacher')}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    currentUser?.role === 'teacher'
                      ? 'bg-white text-purple-600 shadow-md border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Teacher</span>
                </button>
                <button
                  onClick={() => switchRole('student')}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    currentUser?.role === 'student'
                      ? 'bg-white text-purple-600 shadow-md border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Student</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
