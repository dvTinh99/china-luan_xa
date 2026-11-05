import { defineEventHandler, readBody } from 'h3';
import { z } from 'zod';
import { authenticateEvent } from '../../utils/auth';
import { prisma } from '../../utils/prisma';
import { sendApiError, sendApiSuccess } from '../../utils/response';

const schema = z.object({ pinyinDisplay: z.boolean() }).strict();

export default defineEventHandler(async (event) => {
  const user = await authenticateEvent(event);
  if (!user) return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');

  const parsed = schema.safeParse(await readBody(event));
  if (!parsed.success) return sendApiError(event, 400, 'VALIDATION_ERROR', 'pinyinDisplay must be a boolean.');

  const settings = await prisma.userSettings.upsert({
    where: { userId: user.id },
    create: { userId: user.id, pinyinDisplay: parsed.data.pinyinDisplay },
    update: { pinyinDisplay: parsed.data.pinyinDisplay },
  });

  return sendApiSuccess(event, { settings: { pinyinDisplay: settings.pinyinDisplay } });
});
