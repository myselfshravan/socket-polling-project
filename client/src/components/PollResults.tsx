
import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Poll } from '../context/PollContext';

interface PollResultsProps {
  poll: Poll;
}

const PollResults: React.FC<PollResultsProps> = ({ poll }) => {
  const totalVotes = poll.votes.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h4 className="font-semibold text-gray-900 mb-3 text-lg leading-tight">{poll.question}</h4>
        <div className="inline-flex items-center space-x-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-xl border border-purple-200">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-semibold">{totalVotes} total votes</span>
        </div>
      </div>

      <div className="space-y-6">
        {poll.options.map((option, index) => {
          const votes = poll.votes[index];
          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
          
          return (
            <div key={index} className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700 truncate pr-2">
                  {option}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 font-semibold">
                    {votes}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {percentage > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white drop-shadow-sm">
                      {percentage > 15 ? `${percentage.toFixed(0)}%` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalVotes === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">Waiting for votes...</p>
        </div>
      )}
    </div>
  );
};

export default PollResults;
