import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { signToken } from '../utils/jwt';

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name },
  };
}

export async function register(email: string, password: string, name: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
    select: { id: true, email: true, name: true },
  });

  const token = signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  return { token, user };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return user;
}
