import React, { useState } from 'react';
import { usePoll } from '../contexts/PollContext';
import { Poll, PollState } from '../types/poll';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import CreatePollModal from './CreatePollModal';
import { Progress } from './ui/progress';

const TeacherDashboard: React.FC = () => {
  const { polls, createPoll, activatePoll, endPoll, loading } = usePoll();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  const draftPolls = polls.filter(poll => poll.state === PollState.DRAFT);
  const activePolls = polls.filter(poll => poll.state === PollState.LIVE);
  const endedPolls = polls.filter(poll => poll.state === PollState.ENDED);

  const handleCreatePoll = async (question: string, options: string[]) => {
    try {
      await createPoll(question, options);
      setShowCreateModal(false);
      toast({
        title: 'Success',
        description: 'Poll created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create poll',
        variant: 'destructive',
      });
    }
  };

  const handleActivatePoll = async (pollId: string) => {
    if (activePolls.length > 0) {
      toast({
        title: 'Error',
        description: 'Please end the current active poll first',
        variant: 'destructive',
      });
      return;
    }

    try {
      await activatePoll(pollId);
      toast({
        title: 'Success',
        description: 'Poll activated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to activate poll',
        variant: 'destructive',
      });
    }
  };

  const handleEndPoll = async (pollId: string) => {
    try {
      await endPoll(pollId);
      toast({
        title: 'Success',
        description: 'Poll ended successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to end poll',
        variant: 'destructive',
      });
    }
  };

  const PollCard: React.FC<{ poll: Poll }> = ({ poll }) => {
    const isActive = poll.state === PollState.LIVE;
    const totalVotes = Object.values(poll.results || {}).reduce((sum, count) => sum + count, 0);

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{poll.question}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Created: {new Date(poll.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              {poll.state === PollState.DRAFT && (
                <Button 
                  onClick={() => handleActivatePoll(poll.id)}
                  disabled={loading || activePolls.length > 0}
                >
                  Make Live
                </Button>
              )}
              {isActive && (
                <Button 
                  variant="destructive"
                  onClick={() => handleEndPoll(poll.id)}
                  disabled={loading}
                >
                  End Poll
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {poll.options.map((option) => {
              const votes = poll.results?.[option] || 0;
              const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

              return (
                <div key={option} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{option}</span>
                    <span>{votes} votes ({percentage}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
            <div className="text-sm text-gray-500 mt-2 flex justify-between">
              <span>Total votes: {totalVotes}</span>
              {poll.activatedAt && (
                <span>
                  {poll.state === PollState.LIVE ? 'Started' : 'Ended'}: {' '}
                  {new Date(poll.activatedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          disabled={loading}
        >
          Create New Poll
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Draft Polls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{draftPolls.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Polls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activePolls.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ended Polls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{endedPolls.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="ended">Ended</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activePolls.length > 0 ? (
            activePolls.map(poll => <PollCard key={poll.id} poll={poll} />)
          ) : (
            <p className="text-center text-gray-500 py-4">No active polls</p>
          )}
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          {draftPolls.length > 0 ? (
            draftPolls.map(poll => <PollCard key={poll.id} poll={poll} />)
          ) : (
            <p className="text-center text-gray-500 py-4">No draft polls</p>
          )}
        </TabsContent>

        <TabsContent value="ended" className="space-y-4">
          {endedPolls.length > 0 ? (
            endedPolls.map(poll => <PollCard key={poll.id} poll={poll} />)
          ) : (
            <p className="text-center text-gray-500 py-4">No ended polls</p>
          )}
        </TabsContent>
      </Tabs>

      <CreatePollModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePoll}
      />
    </div>
  );
};

export default TeacherDashboard;
