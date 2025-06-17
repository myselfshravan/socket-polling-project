import React, { useState, useEffect } from 'react';
import { usePoll } from '../contexts/PollContext';
import { useUser } from '../contexts/UserContext';
import { Poll, PollState } from '../types/poll';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { useToast } from '../hooks/use-toast';

const StudentInterface: React.FC = () => {
  const { polls, submitVote, loading } = usePoll();
  const { currentUser } = useUser();
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<string>('');

  const activePoll = polls.find(poll => poll.state === PollState.LIVE);

  // Reset selected option when active poll changes
  useEffect(() => {
    setSelectedOption('');
  }, [activePoll?.id]);

  if (!activePoll) {
    return (
      <div className="container mx-auto p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <p className="text-center text-gray-500">
              No active polls at the moment. Please wait for the teacher to start a poll.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasVoted = activePoll.votedUsers?.includes(currentUser?.id || '');
  const totalVotes = Object.values(activePoll.results || {}).reduce((sum, count) => sum + count, 0);

  const handleVote = async () => {
    if (!selectedOption) {
      toast({
        title: 'Error',
        description: 'Please select an option',
        variant: 'destructive',
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to vote',
        variant: 'destructive',
      });
      return;
    }

    try {
      await submitVote(activePoll.id, selectedOption);
      toast({
        title: 'Success',
        description: 'Vote submitted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit vote',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            {activePoll.question}
          </CardTitle>
          {hasVoted && (
            <p className="text-sm text-green-600">You have submitted your vote</p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {hasVoted ? (
            // Results view
            <div className="space-y-4">
              {activePoll.options.map((option) => {
                const votes = activePoll.results?.[option] || 0;
                const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                const isSelected = option === selectedOption;

                return (
                  <div key={option} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={isSelected ? 'font-medium' : ''}>
                        {option} {isSelected && '(Your vote)'}
                      </span>
                      <span>{votes} votes ({percentage}%)</span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${isSelected ? 'bg-blue-200' : ''}`}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            // Voting view
            <div className="space-y-6">
              <RadioGroup 
                value={selectedOption} 
                onValueChange={setSelectedOption}
                className="space-y-3"
              >
                {activePoll.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} disabled={loading} />
                    <Label htmlFor={option} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button
                onClick={handleVote}
                disabled={!selectedOption || loading}
                className="w-full"
              >
                {loading ? 'Submitting...' : 'Submit Vote'}
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-between text-sm text-gray-500">
          <span>Total votes: {totalVotes}</span>
          <span>Poll Status: Active</span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StudentInterface;
