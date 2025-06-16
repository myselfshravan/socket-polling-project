
import React, { useState } from 'react';
import { Plus, Play, Square, BarChart3, Clock, Users, TrendingUp, Activity } from 'lucide-react';
import { usePoll } from '../context/PollContext';
import CreatePollModal from './CreatePollModal';
import PollResults from './PollResults';

const TeacherDashboard: React.FC = () => {
  const { polls, activePoll, setActivePoll, endPoll } = usePoll();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleStartPoll = (pollId: string) => {
    setActivePoll(pollId);
  };

  const handleEndPoll = (pollId: string) => {
    endPoll(pollId);
  };

  const totalVotes = polls.reduce((total, poll) => total + poll.votes.reduce((a, b) => a + b, 0), 0);
  const activePolls = polls.filter(poll => poll.isActive).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Teacher Dashboard</h2>
              <p className="text-gray-600 text-lg">Manage your polls and view live analytics</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-[1.02] flex items-center space-x-3 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Create New Poll</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Polls</p>
                <p className="text-2xl font-bold text-gray-900">{polls.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Polls</p>
                <p className="text-2xl font-bold text-gray-900">{activePolls}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold text-gray-900">{totalVotes}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poll Management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-semibold text-gray-900">Your Polls</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Last updated: just now</span>
                </div>
              </div>

              <div className="space-y-6">
                {polls.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <BarChart3 className="h-10 w-10 text-purple-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">No polls created yet</h4>
                    <p className="text-gray-500 mb-6">Create your first poll to start engaging with your audience</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                    >
                      Get Started
                    </button>
                  </div>
                ) : (
                  polls.map((poll) => (
                    <div
                      key={poll.id}
                      className={`border-2 rounded-2xl p-6 transition-all duration-200 hover:shadow-md ${
                        poll.isActive
                          ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <h4 className="font-semibold text-gray-900 text-lg leading-tight pr-4">{poll.question}</h4>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                              poll.isActive 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                              {poll.isActive ? '🟢 Live' : '⏸️ Paused'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <span className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{poll.createdAt.toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>{poll.votes.reduce((a, b) => a + b, 0)} votes</span>
                            </span>
                            <span className="flex items-center space-x-2">
                              <BarChart3 className="h-4 w-4" />
                              <span>{poll.options.length} options</span>
                            </span>
                          </div>
                        </div>
                        <div className="ml-6">
                          {poll.isActive ? (
                            <button
                              onClick={() => handleEndPoll(poll.id)}
                              className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-colors flex items-center space-x-2 font-medium shadow-sm"
                            >
                              <Square className="h-4 w-4" />
                              <span>End Poll</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartPoll(poll.id)}
                              className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors flex items-center space-x-2 font-medium shadow-sm"
                            >
                              <Play className="h-4 w-4" />
                              <span>Start Poll</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Live Results */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                <h3 className="text-xl font-semibold text-gray-900">Live Results</h3>
              </div>
              {activePoll ? (
                <PollResults poll={activePoll} />
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">No Active Poll</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">Start a poll to see live results and real-time analytics</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreatePollModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default TeacherDashboard;
