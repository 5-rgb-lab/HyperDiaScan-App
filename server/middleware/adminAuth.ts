import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../lib/firebase';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: string;
  };
}

export async function verifyAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized: No token provided' 
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Fetch user profile to check role
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(403).json({ 
        error: 'Forbidden: User profile not found' 
      });
    }

    const userData = userDoc.data();
    
    if (userData?.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Forbidden: Admin access required' 
      });
    }

    // Attach user info to request
    req.user = {
      uid,
      email: decodedToken.email || '',
      role: userData.role,
    };

    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(401).json({ 
      error: 'Unauthorized: Invalid token' 
    });
  }
}

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function rateLimitLogin(req: Request, res: Response, next: NextFunction) {
  const email = req.body.email?.toLowerCase();
  
  if (!email) {
    return next();
  }

  const now = Date.now();
  const attempts = loginAttempts.get(email);

  if (attempts) {
    if (now < attempts.resetTime) {
      if (attempts.count >= MAX_ATTEMPTS) {
        return res.status(429).json({
          error: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil((attempts.resetTime - now) / 1000),
        });
      }
      attempts.count++;
    } else {
      loginAttempts.set(email, { count: 1, resetTime: now + LOCKOUT_DURATION });
    }
  } else {
    loginAttempts.set(email, { count: 1, resetTime: now + LOCKOUT_DURATION });
  }

  next();
}

export function resetLoginAttempts(email: string) {
  loginAttempts.delete(email.toLowerCase());
}
