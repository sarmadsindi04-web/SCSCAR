import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken & {
    dbId?: number;
    isAdmin?: boolean;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Ensure user exists in our local PostgreSQL database
    const reqEmail = decodedToken.email || `user-${decodedToken.uid}@scscar.com`;
    
    // Automatically make the primary creator email an Admin!
    const isAdminUser = reqEmail.toLowerCase() === 'sarmadsindi04@gmail.com';

    // Safe Upsert
    const result = await db.insert(users)
      .values({
        uid: decodedToken.uid,
        email: reqEmail,
        isAdmin: isAdminUser,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: reqEmail,
          isAdmin: isAdminUser,
        },
      })
      .returning();

    const dbUser = result[0];

    req.user = {
      ...decodedToken,
      dbId: dbUser.id,
      isAdmin: dbUser.isAdmin,
    };
    
    next();
  } catch (error: any) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const tryAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const reqEmail = decodedToken.email || `user-${decodedToken.uid}@scscar.com`;
    const isAdminUser = reqEmail.toLowerCase() === 'sarmadsindi04@gmail.com';

    const result = await db.insert(users)
      .values({
        uid: decodedToken.uid,
        email: reqEmail,
        isAdmin: isAdminUser,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: reqEmail,
          isAdmin: isAdminUser,
        },
      })
      .returning();

    const dbUser = result[0];

    req.user = {
      ...decodedToken,
      dbId: dbUser.id,
      isAdmin: dbUser.isAdmin,
    };
  } catch (error) {
    console.warn('Optional token verification failed:', error);
  }
  next();
};
