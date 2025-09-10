"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationUtils = exports.emailSchema = exports.dateSchema = exports.uuidSchema = void 0;
const zod_1 = require("zod");
// Common validation schemas
exports.uuidSchema = zod_1.z.string().uuid();
exports.dateSchema = zod_1.z.string().datetime();
exports.emailSchema = zod_1.z.string().email();
// Validation helper functions
class ValidationUtils {
    static isValidUuid(value) {
        return exports.uuidSchema.safeParse(value).success;
    }
    static isValidDate(value) {
        return exports.dateSchema.safeParse(value).success;
    }
    static isValidEmail(value) {
        return exports.emailSchema.safeParse(value).success;
    }
    static validateAndTransform(schema, data) {
        const result = schema.safeParse(data);
        if (result.success) {
            return { success: true, data: result.data };
        }
        else {
            return { success: false, error: result.error };
        }
    }
}
exports.ValidationUtils = ValidationUtils;
