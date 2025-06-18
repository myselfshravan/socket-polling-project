import { Server } from 'socket.io';
import Poll from '../models/Poll';
import { CreatePollDto, PollState, VoteDto } from '../types/poll';
import { socketAuth, SocketWithUser, ensureTeacher, ensureStudent } from '../middleware/socketAuth';
import { serializePoll } from '../utils/serializers';

export const setupPollHandlers = (io: Server) => {
  // Apply authentication middleware
  io.use(socketAuth);

  // Track active connections
  const activeConnections = new Map<string, { userId: string; role: string }>();

  io.on('connection', (socket: SocketWithUser) => {
    console.log('Client connected:', socket.id);

    if (socket.user) {
      activeConnections.set(socket.id, {
        userId: socket.user.id,
        role: socket.user.role
      });

      // Broadcast updated connection status
      io.emit('connection-status', {
        status: 'connected',
        userId: socket.user.id,
        role: socket.user.role
      });
    }

    // Handle ping
    socket.on('pong', () => {
      socket.emit('connection-status', { status: 'connected' });
    });

    // Create new poll (teachers only)
    socket.on('create-poll', async (pollData: CreatePollDto) => {
      ensureTeacher(socket, (error) => {
        if (error) {
          socket.emit('error', { message: error.message });
          return;
        }

        handleCreatePoll(socket, pollData, io);
      });
    });

    // Activate poll (teachers only)
    socket.on('activate-poll', async (pollId: string) => {
      ensureTeacher(socket, (error) => {
        if (error) {
          socket.emit('error', { message: error.message });
          return;
        }

        handleActivatePoll(socket, pollId, io);
      });
    });

    // End poll (teachers only)
    socket.on('end-poll', async (pollId: string) => {
      ensureTeacher(socket, (error) => {
        if (error) {
          socket.emit('error', { message: error.message });
          return;
        }

        handleEndPoll(socket, pollId, io);
      });
    });

    // Submit vote (students only)
    socket.on('submit-vote', async (data: VoteDto) => {
      ensureStudent(socket, (error) => {
        if (error) {
          socket.emit('error', { message: error.message });
          return;
        }

        handleSubmitVote(socket, data, io);
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      const connection = activeConnections.get(socket.id);
      if (connection) {
        activeConnections.delete(socket.id);
        
        // Broadcast updated connection status
        io.emit('connection-status', {
          status: 'disconnected',
          userId: connection.userId,
          role: connection.role
        });
      }
    });
  });
};

// Handler functions
async function handleCreatePoll(socket: SocketWithUser, pollData: CreatePollDto, io: Server) {
  try {
    if (!socket.user) throw new Error('User not authenticated');

    const newPoll = new Poll({
      ...pollData,
      state: PollState.DRAFT,
      createdBy: socket.user.id
    });

    await newPoll.save();
    // Notify teachers about the new poll
    io.to('teacher').emit('poll-created', serializePoll(newPoll));
    
    // Log the action
    console.log(`Poll created by ${socket.user.id}: ${newPoll.id}`);
  } catch (error) {
    socket.emit('error', { 
      message: error instanceof Error ? error.message : 'Failed to create poll'
    });
  }
}

async function handleActivatePoll(socket: SocketWithUser, pollId: string, io: Server) {
  try {
    const activatedPoll = await Poll.activatePoll(pollId);
    if (!activatedPoll) {
      throw new Error('Poll not found');
    }

    const serializedPoll = serializePoll(activatedPoll);
    
    // Notify everyone about the activated poll
    io.emit('poll-activated', serializedPoll);
    
    // Notify teachers with additional details
    io.to('teacher').emit('poll-status', {
      action: 'activated',
      pollId: pollId,
      activeConnections: Array.from(activeConnections.values())
    });
    
    // Log the action
    console.log(`Poll activated by ${socket.user?.id}: ${pollId}`);
  } catch (error) {
    socket.emit('error', { 
      message: error instanceof Error ? error.message : 'Failed to activate poll'
    });
  }
}

async function handleEndPoll(socket: SocketWithUser, pollId: string, io: Server) {
  try {
    const endedPoll = await Poll.endPoll(pollId);
    if (!endedPoll) {
      throw new Error('Poll not found');
    }

    const serializedPoll = serializePoll(endedPoll);
    
    // Notify everyone about the ended poll
    io.emit('poll-ended', serializedPoll);
    
    // Notify teachers with final results
    io.to('teacher').emit('poll-status', {
      action: 'ended',
      pollId: pollId,
      finalResults: serializedPoll.results,
      participants: endedPoll.votedUsers.length
    });
    
    // Log the action
    console.log(`Poll ended by ${socket.user?.id}: ${pollId}`);
  } catch (error) {
    socket.emit('error', { 
      message: error instanceof Error ? error.message : 'Failed to end poll'
    });
  }
}

async function handleSubmitVote(socket: SocketWithUser, data: VoteDto, io: Server) {
  try {
    if (!socket.user) throw new Error('User not authenticated');

    const poll = await Poll.findById(data.pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    if (poll.state !== PollState.LIVE) {
      throw new Error('Poll is not active');
    }

    const updatedPoll = await poll.addVote(socket.user.id, data.option);
    const serialized = serializePoll(updatedPoll);

    // Notify everyone about updated results
    io.emit('poll-updated', {
      pollId: serialized.id,
      results: serialized.results
    });
    
    // Send detailed update to teachers
    io.to('teacher').emit('poll-status', {
      action: 'vote-submitted',
      pollId: data.pollId,
      voterId: socket.user.id,
      totalVotes: Object.values(serialized.results).reduce((a, b) => a + b, 0),
      lastVoteTime: new Date().toISOString()
    });
    
    // Log the action
    console.log(`Vote submitted for poll ${data.pollId} by ${socket.user.id}`);
  } catch (error) {
    socket.emit('error', { 
      message: error instanceof Error ? error.message : 'Failed to submit vote'
    });
  }
}
