import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { verifyToken, refreshToken, JWTPayload } from '../utils/auth';

interface SocketWithUser extends Socket {
  user?: JWTPayload;
  sessionId?: string;
}

const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

export const socketAuth = async (
  socket: SocketWithUser,
  next: (err?: ExtendedError | undefined) => void
) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    const user = verifyToken(token);
    
    // Check if token needs refresh
    if (user.exp && user.exp * 1000 - Date.now() < REFRESH_THRESHOLD) {
      try {
        const newToken = await refreshToken(token);
        socket.emit('token-refresh', { token: newToken });
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Continue with current token if refresh fails
      }
    }

    socket.user = user;
    socket.sessionId = `${user.id}-${Date.now()}`;
    
    // Join role-based room and personal room
    socket.join(user.role);
    socket.join(`user:${user.id}`);
    
    // Set up ping/pong for connection monitoring
    const pingInterval = setInterval(() => {
      socket.emit('ping');
    }, 30000);

    socket.on('pong', () => {
      socket.emit('connection-status', { status: 'connected' });
    });

    socket.on('disconnect', () => {
      clearInterval(pingInterval);
    });
    
    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    next(new Error(errorMessage));
  }
};

// Middleware to ensure user exists
export const ensureUser = (
  socket: SocketWithUser,
  next: (err?: ExtendedError | undefined) => void
) => {
  if (!socket.user) {
    return next(new Error('User not authenticated'));
  }
  next();
};

// Middleware to ensure user is a teacher
export const ensureTeacher = (
  socket: SocketWithUser,
  next: (err?: ExtendedError | undefined) => void
) => {
  if (!socket.user || socket.user.role !== 'teacher') {
    return next(new Error('Teacher access required'));
  }
  next();
};

// Middleware to ensure user is a student
export const ensureStudent = (
  socket: SocketWithUser,
  next: (err?: ExtendedError | undefined) => void
) => {
  if (!socket.user || socket.user.role !== 'student') {
    return next(new Error('Student access required'));
  }
  next();
};

export type { SocketWithUser };
