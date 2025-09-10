export declare const logger: import("winston").Logger;
export declare class TelemetryUtils {
    static startTimer(operation: string): () => number;
    static logError(error: Error, context?: Record<string, unknown>): void;
    static logInfo(message: string, context?: Record<string, unknown>): void;
    static logDebug(message: string, context?: Record<string, unknown>): void;
}
