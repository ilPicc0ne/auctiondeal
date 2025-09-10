"use strict";
/**
 * Jest setup file for SHAB API and Processor tests
 * Initializes test database and global test configuration
 */
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const globals_1 = require("@jest/globals");
// Load test environment variables
(0, dotenv_1.config)({ path: '.env.test' });
// Global test setup
(0, globals_1.beforeAll)(async () => {
    console.log('🧪 Setting up test environment...');
    // Verify required environment variables
    const requiredEnvVars = ['DATABASE_URL'];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    }
    console.log('✅ Test environment setup complete');
});
(0, globals_1.afterAll)(async () => {
    console.log('🧹 Cleaning up test environment...');
    // Add any global cleanup here if needed
});
// Extend Jest timeout for live API calls - handled in jest.config.mjs
// jest.setTimeout(30000); // Not needed in setup file
// Console log configuration for tests
const originalLog = console.log;
const originalError = console.error;
// Suppress console.log in tests unless DEBUG is set
if (!process.env.DEBUG) {
    console.log = () => { }; // Suppress logs
}
else {
    console.log = (...args) => originalLog('🧪 [TEST]', ...args);
}
// Always show errors
console.error = (...args) => originalError('❌ [TEST ERROR]', ...args);
