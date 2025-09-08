import { createLogger, format, transports } from 'winston'

// Create structured logger
export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: process.env.NODE_ENV === 'development'
        ? format.combine(format.colorize(), format.simple())
        : format.json()
    })
  ]
})

// Performance monitoring
export class TelemetryUtils {
  static startTimer(operation: string): () => number {
    const start = Date.now()
    logger.info(`Starting operation: ${operation}`)
    
    return () => {
      const duration = Date.now() - start
      logger.info(`Completed operation: ${operation}`, { duration })
      return duration
    }
  }

  static logError(error: Error, context?: Record<string, unknown>): void {
    logger.error('Error occurred', {
      error: error.message,
      stack: error.stack,
      ...context
    })
  }

  static logInfo(message: string, context?: Record<string, unknown>): void {
    logger.info(message, context)
  }

  static logDebug(message: string, context?: Record<string, unknown>): void {
    logger.debug(message, context)
  }
}