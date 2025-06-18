import jwt from 'jsonwebtoken';

export interface JWTPayload {
  id: string;
  role: 'teacher' | 'student';
  exp?: number; // Expiration timestamp
  iat?: number; // Issued at timestamp
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (user: JWTPayload): string => {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const refreshToken = async (oldToken: string): Promise<string> => {
  try {
    // Verify the old token first
    const decoded = verifyToken(oldToken);
    
    // Remove the expiration and issued at claims
    const { exp, iat, ...payload } = decoded;
    
    // Generate a new token
    return jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  } catch (error) {
    throw new Error('Token refresh failed');
  }
};

// Verify token without throwing
export const verifyTokenSafe = (token: string): { valid: boolean; payload?: JWTPayload } => {
  try {
    const decoded = verifyToken(token);
    return { valid: true, payload: decoded };
  } catch {
    return { valid: false };
  }
};
