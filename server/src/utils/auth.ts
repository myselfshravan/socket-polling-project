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
    // First try to verify as a proper JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (jwtError) {
      // If JWT verification fails, check if it's a client-generated token
      if (token.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.')) {
        const parts = token.split('.');
        if (parts.length === 3) {
          try {
            // Decode the payload part (index 1)
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

            // Validate the payload
            if (payload.id && (payload.role === 'teacher' || payload.role === 'student')) {
              // Check expiration if present
              if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                throw new Error('Token expired');
              }

              return payload as JWTPayload;
            }
          } catch (decodeError) {
            console.error('Failed to decode client token:', decodeError);
          }
        }
      }

      // If all attempts fail, throw the original error
      throw jwtError;
    }
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
