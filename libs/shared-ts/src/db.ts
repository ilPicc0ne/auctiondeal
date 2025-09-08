import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

declare global {
  var __prisma: PrismaClient | undefined
}

export const getPrismaClient = () => {
  if (typeof window !== 'undefined') return null
  
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  }
  
  prisma = global.__prisma
  return prisma
}

export const db = getPrismaClient()
export default db

// Helper functions for common database operations
export class DatabaseUtils {
  static async healthCheck(): Promise<boolean> {
    try {
      await db?.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      console.error('Database health check failed:', error)
      return false
    }
  }

  static async disconnect(): Promise<void> {
    await db?.$disconnect()
  }
}