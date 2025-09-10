"use strict";
/**
 * Type definitions for SHAB data structures
 * Shared between API service and processor
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShabProcessingError = exports.ShabApiError = void 0;
class ShabApiError extends Error {
    constructor(message, statusCode, response) {
        super(message);
        this.statusCode = statusCode;
        this.response = response;
        this.name = 'ShabApiError';
    }
}
exports.ShabApiError = ShabApiError;
class ShabProcessingError extends Error {
    constructor(message, publicationId) {
        super(message);
        this.publicationId = publicationId;
        this.name = 'ShabProcessingError';
    }
}
exports.ShabProcessingError = ShabProcessingError;
