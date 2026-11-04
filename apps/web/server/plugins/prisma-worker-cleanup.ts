import type { PrismaClient } from '@prisma/client';

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('afterResponse', (event) => {
    const context = event.context as typeof event.context & {
      linguaworldPrisma?: PrismaClient;
    };

    if (context.linguaworldPrisma) {
      event.waitUntil(context.linguaworldPrisma.$disconnect());
      delete context.linguaworldPrisma;
    }
  });
});
