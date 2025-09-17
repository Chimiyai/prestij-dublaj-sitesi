// src/lib/authUtils.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './authOptions';
import { UserRole } from '@prisma/client';

export interface UserPayload {
  userId: number;
  email: string;
  username: string;
  role: UserRole;
}

export async function getAuthenticatedUser(request: NextRequest): Promise<UserPayload | null> {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      return jwt.verify(token, process.env.NEXTAUTH_SECRET!) as UserPayload;
    } catch (e) {
      return null; 
    }
  }
  const session = await getServerSession(authOptions);
  if (session?.user?.id && session.user.email && session.user.username) {
    return {
      userId: parseInt(session.user.id),
      email: session.user.email,
      username: session.user.username,
      role: session.user.role,
    };
  }
  return null;
}