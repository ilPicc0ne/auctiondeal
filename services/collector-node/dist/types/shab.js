/**
 * Type definitions for SHAB data structures
 * Shared between API service and processor
 */
export class ShabApiError extends Error {
    constructor(message, statusCode, response) {
        super(message);
        this.statusCode = statusCode;
        this.response = response;
        this.name = 'ShabApiError';
    }
}
export class ShabProcessingError extends Error {
    constructor(message, publicationId) {
        super(message);
        this.publicationId = publicationId;
        this.name = 'ShabProcessingError';
    }
}
