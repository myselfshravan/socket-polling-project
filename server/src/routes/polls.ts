import express, { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Poll from '../models/Poll';
import { PollState } from '../types/poll';
import { JWTPayload, verifyToken } from '../utils/auth';
import { serializePoll } from '../utils/serializers';

const router = express.Router();

// Extend Express Request type
interface RequestWithUser extends Request {
  user?: JWTPayload;
}

// Middleware to verify authentication token
const authenticateToken = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to ensure user exists
const ensureUser = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  next();
};

// Get all polls (teachers see all, students see only active)
router.get('/', [authenticateToken, ensureUser], async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'User not authenticated' });

    let polls;
    if (req.user.role === 'teacher') {
      polls = await Poll.find().sort({ createdAt: -1 });
    } else {
      polls = await Poll.find({ state: PollState.LIVE });
    }

    const serializedPolls = polls.map(serializePoll);
    res.json(serializedPolls);
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ message: 'Error fetching polls' });
  }
});

// Get specific poll
router.get('/:id', [authenticateToken, ensureUser], async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'User not authenticated' });

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid poll ID' });
    }

    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (req.user.role === 'student' && poll.state !== PollState.LIVE) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(serializePoll(poll));
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ message: 'Error fetching poll' });
  }
});

// Get poll results
router.get('/:id/results', [authenticateToken, ensureUser], async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'User not authenticated' });

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid poll ID' });
    }

    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Students can only see results of voted or ended polls
    if (req.user.role === 'student' && 
        poll.state === PollState.LIVE && 
        !poll.votedUsers.includes(req.user.id)) {
      return res.status(403).json({ message: 'Must vote to see results' });
    }

    const serialized = serializePoll(poll);
    res.json({
      id: serialized.id,
      results: serialized.results,
      state: poll.state,
      totalVotes: poll.votedUsers.length
    });
  } catch (error) {
    console.error('Error fetching poll results:', error);
    res.status(500).json({ message: 'Error fetching poll results' });
  }
});

export default router;