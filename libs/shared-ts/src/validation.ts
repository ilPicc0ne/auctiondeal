import { z } from 'zod'

// Common validation schemas
export const uuidSchema = z.string().uuid()
export const dateSchema = z.string().datetime()
export const emailSchema = z.string().email()

// Validation helper functions
export class ValidationUtils {
  static isValidUuid(value: string): boolean {
    return uuidSchema.safeParse(value).success
  }

  static isValidDate(value: string): boolean {
    return dateSchema.safeParse(value).success
  }

  static isValidEmail(value: string): boolean {
    return emailSchema.safeParse(value).success
  }

  static validateAndTransform<T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): { success: true; data: T } | { success: false; error: z.ZodError } {
    const result = schema.safeParse(data)
    
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      return { success: false, error: result.error }
    }
  }
}