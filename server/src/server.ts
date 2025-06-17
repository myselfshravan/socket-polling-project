import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db';
import pollRoutes from './routes/polls';
import { setupPollHandlers } from './socket/pollHandlers';
import Poll from './models/Poll';
import { PollState } from './types/poll';
import { socketAuth } from './middleware/socketAuth';
import { serializePoll } from './utils/serializers';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CORS_ORIGIN 
      : 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Express middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN
    : 'http://localhost:5173',
  credentials: true
}));

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Routes
app.use('/api/polls', pollRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    socketConnections: io.engine.clientsCount
  });
});

// Apply socket authentication
io.use(socketAuth);

// Setup Socket.IO handlers
setupPollHandlers(io);

// Check and end expired polls periodically
const checkExpiredPolls = async () => {
  try {
    const activePoll = await Poll.findOne({ state: PollState.LIVE });
    if (activePoll?.isExpired()) {
      activePoll.state = PollState.ENDED;
      activePoll.endedAt = new Date();
      const savedPoll = await activePoll.save();
      
      io.emit('poll-ended', serializePoll(savedPoll));
    }
  } catch (error) {
    console.error('Error checking expired polls:', error);
  }
};

// Check for expired polls every minute
const pollCheckInterval = setInterval(checkExpiredPolls, 60 * 1000);

// Handle cleanup on shutdown
const cleanup = async () => {
  try {
    console.log('Starting server cleanup...');

    // Clear intervals
    clearInterval(pollCheckInterval);

    // End any active polls
    await Poll.updateMany(
      { state: PollState.LIVE },
      { 
        state: PollState.ENDED,
        endedAt: new Date()
      }
    );

    // Close all socket connections
    io.disconnectSockets(true);

    // Close HTTP server
    await new Promise<void>((resolve) => {
      httpServer.close(() => {
        console.log('HTTP server closed');
        resolve();
      });
    });

    // Close database connection
    await mongoose.disconnect();
    console.log('Database connection closed');

    console.log('Server cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
};

// Register cleanup handlers
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  if (process.env.NODE_ENV === 'production') {
    cleanup();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  if (process.env.NODE_ENV === 'production') {
    cleanup();
  }
});