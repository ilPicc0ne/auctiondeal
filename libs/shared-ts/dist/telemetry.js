"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryUtils = exports.logger = void 0;
const winston_1 = require("winston");
// Create structured logger
exports.logger = (0, winston_1.createLogger)({
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.errors({ stack: true }), winston_1.format.json()),
    transports: [
        new winston_1.transports.Console({
            format: process.env.NODE_ENV === 'development'
                ? winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple())
                : winston_1.format.json()
        })
    ]
});
// Performance monitoring
class TelemetryUtils {
    static startTimer(operation) {
        const start = Date.now();
        exports.logger.info(`Starting operation: ${operation}`);
        return () => {
            const duration = Date.now() - start;
            exports.logger.info(`Completed operation: ${operation}`, { duration });
            return duration;
        };
    }
    static logError(error, context) {
        exports.logger.error('Error occurred', {
            error: error.message,
            stack: error.stack,
            ...context
        });
    }
    static logInfo(message, context) {
        exports.logger.info(message, context);
    }
    static logDebug(message, context) {
        exports.logger.debug(message, context);
    }
}
exports.TelemetryUtils = TelemetryUtils;
