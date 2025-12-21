import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
console.log('database running in', process.env.DATABASE_URL)

export default prisma;
