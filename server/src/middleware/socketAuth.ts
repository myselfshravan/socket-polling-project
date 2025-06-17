import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { verifyToken, JWTPayload } from '../utils/auth';

interface SocketWithUser extends Socket {
  user?: JWTPayload;
}

export const socketAuth = (
  socket: SocketWithUser,
  next: (err?: ExtendedError | undefined) => void
) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    const user = verifyToken(token);
    socket.user = user;
    
    // Join role-based room
    socket.join(user.role);
    
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
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