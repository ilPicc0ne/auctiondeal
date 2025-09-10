"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseUtils = exports.db = exports.getPrismaClient = void 0;
const client_1 = require("@prisma/client");
let prisma;
const getPrismaClient = () => {
    if (typeof globalThis !== 'undefined' && 'window' in globalThis)
        return null;
    if (!global.__prisma) {
        global.__prisma = new client_1.PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });
    }
    prisma = global.__prisma;
    return prisma;
};
exports.getPrismaClient = getPrismaClient;
exports.db = (0, exports.getPrismaClient)();
exports.default = exports.db;
// Helper functions for common database operations
class DatabaseUtils {
    static async healthCheck() {
        try {
            if (!exports.db)
                return false;
            await exports.db.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            console.error('Database health check failed:', error);
            return false;
        }
    }
    static async disconnect() {
        await exports.db?.$disconnect();
    }
}
exports.DatabaseUtils = DatabaseUtils;
