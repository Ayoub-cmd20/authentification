import { prisma } from "../config/prisma.js";

export const notify = async (userId: string, title: string, message: string) => {
  await prisma.notification.create({ data: { userId, title, message } });
};
