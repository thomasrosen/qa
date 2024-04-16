import { Prisma, PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prismaClientSingleton = () => {
  // source: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
  return new PrismaClient().$extends(withAccelerate())
}
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()
export { Prisma, prisma }
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

export * from '@/lib/types'
