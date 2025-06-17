import { Server, Socket } from 'socket.io';
import Poll from '../models/Poll';
import { CreatePollDto } from '../types/poll';

export const setupPollHandlers = (io: Server, socket: Socket) => {
  // Join a poll room
  socket.on('join-poll', (pollId: string) => {
    socket.join(pollId);
    console.log(`Socket ${socket.id} joined poll ${pollId}`);
  });

  // Create a new poll
  socket.on('create-poll', async (pollData: CreatePollDto) => {
    try {
      const initialResults: { [key: string]: number } = {};
      pollData.options.forEach(option => {
        initialResults[option] = 0;
      });

      const newPoll = new Poll({
        ...pollData,
        results: initialResults
      });

      await newPoll.save();
      io.emit('poll-created', newPoll);
    } catch (error) {
      console.error('Error creating poll:', error);
      socket.emit('poll-error', { message: 'Failed to create poll' });
    }
  });

  // Submit vote
  socket.on('submit-vote', async ({ pollId, option, voterId }: { pollId: string; option: string; voterId: string }) => {
    try {
      const poll = await Poll.findById(pollId);
      if (!poll) {
        throw new Error('Poll not found');
      }

      // Update poll results
      const results = { ...poll.results };
      results[option] = (results[option] || 0) + 1;
      poll.results = results;
      await poll.save();

      // Broadcast updated results to all clients in the poll room
      io.to(pollId).emit('poll-updated', {
        pollId,
        results: poll.results
      });
    } catch (error) {
      console.error('Error submitting vote:', error);
      socket.emit('poll-error', { message: 'Failed to submit vote' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
};