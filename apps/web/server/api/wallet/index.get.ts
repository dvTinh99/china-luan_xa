// ============================================================================
// GET /api/wallet
// ============================================================================

import { defineEventHandler } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../utils/response';

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  let wallet = await prisma.wallet.findUnique({
    where: { userId: user.id },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId: user.id, balanceGold: 100 },
    });
  }

  return sendApiSuccess(event, {
    balanceGold: wallet.balanceGold,
    updatedAt: wallet.updatedAt,
  });
});

