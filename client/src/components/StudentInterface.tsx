
import React, { useState } from 'react';
import { Vote, Users, Clock, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { usePoll } from '../context/PollContext';

const StudentInterface: React.FC = () => {
  const { polls, activePoll, votePoll } = usePoll();
  const [votedPolls, setVotedPolls] = useState<Set<string>>(new Set());

  const handleVote = (pollId: string, optionIndex: number) => {
    if (votedPolls.has(pollId)) return;
    
    votePoll(pollId, optionIndex);
    setVotedPolls(prev => new Set([...prev, pollId]));
  };

  const hasVoted = (pollId: string) => votedPolls.has(pollId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Student Portal</h2>
          <p className="text-gray-600 text-lg">Join live polls and share your voice</p>
        </div>

        {activePoll ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 mb-8">
              <div className="text-center mb-10">
                <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Poll is Live</span>
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <Vote className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Active Poll</h3>
                <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 mb-8">
                  <span className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
                    <Clock className="h-4 w-4" />
                    <span>Live now</span>
                  </span>
                  <span className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
                    <Users className="h-4 w-4" />
                    <span>{activePoll.votes.reduce((a, b) => a + b, 0)} votes</span>
                  </span>
                  <span className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
                    <TrendingUp className="h-4 w-4" />
                    <span>{activePoll.options.length} options</span>
                  </span>
                </div>
              </div>

              <div className="mb-10">
                <h4 className="text-2xl font-semibold text-gray-900 text-center mb-10 leading-relaxed">
                  {activePoll.question}
                </h4>

                <div className="space-y-4">
                  {activePoll.options.map((option, index) => {
                    const totalVotes = activePoll.votes.reduce((a, b) => a + b, 0);
                    const percentage = totalVotes > 0 ? (activePoll.votes[index] / totalVotes) * 100 : 0;
                    const voted = hasVoted(activePoll.id);

                    return (
                      <button
                        key={index}
                        onClick={() => handleVote(activePoll.id, index)}
                        disabled={voted}
                        className={`w-full p-6 rounded-2xl border-2 transition-all duration-200 group ${
                          voted
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 transform hover:scale-[1.01] hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-left text-gray-900 text-lg">{option}</span>
                          {voted && (
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600 font-semibold">{percentage.toFixed(1)}%</span>
                              <div className="w-20 h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {hasVoted(activePoll.id) && (
                  <div className="mt-10 text-center">
                    <div className="inline-flex items-center space-x-3 bg-green-50 text-green-700 px-8 py-4 rounded-2xl border-2 border-green-200 shadow-sm">
                      <CheckCircle className="h-6 w-6" />
                      <span className="font-semibold text-lg">Vote submitted successfully!</span>
                    </div>
                    <p className="text-gray-500 mt-4">Thank you for participating. Results will update in real-time.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16 text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Vote className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">No Active Polls</h3>
              <p className="text-gray-600 mb-8 leading-relaxed text-lg max-w-lg mx-auto">
                Your teacher hasn't started any polls yet. When they do, you'll see them here and can participate in real-time.
              </p>
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-xl border border-blue-200">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Waiting for polls...</span>
              </div>
            </div>

            {polls.length > 0 && (
              <div className="mt-12">
                <h4 className="text-2xl font-bold text-gray-900 mb-8 text-center">Previous Polls</h4>
                <div className="grid gap-6">
                  {polls.filter(poll => !poll.isActive).map((poll) => (
                    <div key={poll.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-2 text-lg">{poll.question}</h5>
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{poll.createdAt.toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{poll.votes.reduce((a, b) => a + b, 0)} total votes</span>
                            </span>
                          </div>
                        </div>
                        <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold border border-gray-200">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentInterface;
