// ============================================================================
// POST /api/auth/register
// ============================================================================

import { defineEventHandler, readBody } from 'h3';
import { z } from 'zod';
import { prisma } from '../../utils/prisma';
import { hashPassword, createSession, setSessionCookie } from '../../utils/auth';
import { sendApiSuccess, sendApiError } from '../../utils/response';

const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  username: z.string().min(3, 'Tên đăng nhập tối thiểu 3 ký tự').max(20, 'Tên đăng nhập tối đa 20 ký tự'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  characterName: z.string().min(1, 'Tên nhân vật không được để trống').max(40).optional(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parseResult = registerSchema.safeParse(body);

  if (!parseResult.success) {
    return sendApiError(
      event,
      400,
      'VALIDATION_ERROR',
      parseResult.error.errors[0]?.message || 'Dữ liệu không hợp lệ',
    );
  }

  const { email, username, password, characterName } = parseResult.data;

  // Check unique email and username
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return sendApiError(event, 409, 'EMAIL_EXISTS', 'Email này đã được sử dụng.');
    }
    return sendApiError(event, 409, 'USERNAME_EXISTS', 'Tên đăng nhập này đã tồn tại.');
  }

  // Create user with default character and wallet atomically
  const passwordHash = await hashPassword(password);
  const initialCharName = characterName?.trim() || username;

  const newUser = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      settings: {
        create: {
          targetDailyReviews: 20,
          soundEnabled: true,
          pinyinDisplay: true,
        },
      },
      character: {
        create: {
          name: initialCharName,
          level: 1,
          exp: 0,
          hp: 100,
          maxHp: 100,
        },
      },
      wallet: {
        create: {
          balanceGold: 50, // Initial welcome bonus
        },
      },
    },
    include: {
      character: true,
      wallet: true,
    },
  });

  // Create session and set cookie
  const session = await createSession(newUser.id);
  setSessionCookie(event, session.token, session.expiresAt);

  return sendApiSuccess(
    event,
    {
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        character: newUser.character,
        wallet: newUser.wallet,
      },
    },
    201,
  );
});
