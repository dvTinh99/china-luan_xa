// ============================================================================
// POST /api/auth/login
// ============================================================================

import { defineEventHandler, readBody } from 'h3';
import { z } from 'zod';
import { prisma } from '../../utils/prisma';
import { verifyPassword, createSession, setSessionCookie } from '../../utils/auth';
import { sendApiSuccess, sendApiError } from '../../utils/response';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Vui lòng nhập email hoặc tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const parseResult = loginSchema.safeParse(body);

  if (!parseResult.success) {
    return sendApiError(
      event,
      400,
      'VALIDATION_ERROR',
      parseResult.error.errors[0]?.message || 'Dữ liệu không hợp lệ',
    );
  }

  const { identifier, password } = parseResult.data;

  // Find user by email or username
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
    include: {
      character: true,
      wallet: true,
    },
  });

  if (!user) {
    return sendApiError(event, 401, 'INVALID_CREDENTIALS', 'Tài khoản hoặc mật khẩu không chính xác.');
  }

  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return sendApiError(event, 401, 'INVALID_CREDENTIALS', 'Tài khoản hoặc mật khẩu không chính xác.');
  }

  // Create session and set cookie
  const session = await createSession(user.id);
  setSessionCookie(event, session.token, session.expiresAt);

  return sendApiSuccess(event, {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      character: user.character,
      wallet: user.wallet,
    },
  });
});

