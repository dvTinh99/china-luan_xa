// ============================================================================
// POST /api/shop/purchase — Transactional Item Purchase (DATABASE.md §5)
// ============================================================================

import { defineEventHandler, readBody } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../utils/response';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const body = await readBody(event);
  const itemId = body?.itemId;
  const quantity = Math.max(1, parseInt(body?.quantity) || 1);

  if (!itemId) {
    return sendApiError(event, 400, 'BAD_REQUEST', 'Missing itemId.');
  }

  // 1. Validate item existence and price
  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item || !item.isShopItem) {
    return sendApiError(event, 404, 'NOT_FOUND', 'Item not available in shop.');
  }

  const totalCost = item.priceGold * quantity;

  // 2. Execute atomic purchase transaction (§5)
  try {
    const result = await prisma.$transaction(async (tx) => {
      // A. Read and lock wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId: user.id },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId: user.id, balanceGold: 0 },
        });
      }

      // B. Validate sufficient balance
      if (wallet.balanceGold < totalCost) {
        throw new Error(`INSUFFICIENT_FUNDS: Cần ${totalCost} Gold, bạn chỉ có ${wallet.balanceGold} Gold.`);
      }

      // C. Debit wallet
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balanceGold: { decrement: totalCost },
        },
      });

      // D. Write ledger transaction
      const idempotencyKey = crypto
        .createHash('sha256')
        .update(`purchase:${user.id}:${item.id}:${Date.now()}:${Math.random()}`)
        .digest('hex');

      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          currency: 'gold',
          amount: -totalCost,
          transactionType: 'purchase',
          referenceType: 'item',
          referenceId: item.id,
          idempotencyKey,
        },
      });

      // E. Upsert inventory item
      const inventoryItem = await tx.inventoryItem.upsert({
        where: {
          userId_itemId: {
            userId: user.id,
            itemId: item.id,
          },
        },
        update: {
          quantity: { increment: quantity },
        },
        create: {
          userId: user.id,
          itemId: item.id,
          quantity,
          isEquipped: false,
        },
        include: {
          item: true,
        },
      });

      return {
        wallet: updatedWallet,
        inventoryItem,
        item,
        totalCost,
      };
    });

    return sendApiSuccess(event, {
      message: `Đã mua thành công ${quantity}x ${item.name}!`,
      purchase: result,
    });
  } catch (err: any) {
    if (err.message.startsWith('INSUFFICIENT_FUNDS')) {
      return sendApiError(event, 400, 'INSUFFICIENT_FUNDS', err.message);
    }
    return sendApiError(event, 500, 'TRANSACTION_FAILED', err.message);
  }
});

