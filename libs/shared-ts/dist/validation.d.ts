import { z } from 'zod';
export declare const uuidSchema: z.ZodString;
export declare const dateSchema: z.ZodString;
export declare const emailSchema: z.ZodString;
export declare class ValidationUtils {
    static isValidUuid(value: string): boolean;
    static isValidDate(value: string): boolean;
    static isValidEmail(value: string): boolean;
    static validateAndTransform<T>(schema: z.ZodSchema<T>, data: unknown): {
        success: true;
        data: T;
    } | {
        success: false;
        error: z.ZodError;
    };
}
