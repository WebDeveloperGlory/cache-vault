import { UserRole } from "@modules/user/domain/entities/user.entity";
import { z } from "zod/v4";

export const CreateUserSchema = z.object({
    name: z.string().min(2, 'Name must be 2 digits at minimum').max(100, 'Gosh'),
    email: z.email('Pass in a valid email'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Max password characters exceeded(how!!!!)')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    role: z.enum(UserRole, `Chose a valid role: ${Object.values(UserRole).join(',')}`)
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export const LoginSchema = z.object({
    identifier: z.string(),
    password: z.string(),
})

export type LoginDto = z.infer<typeof LoginSchema>;

export const RefreshSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RefreshDto = z.infer<typeof RefreshSchema>;

export const LogoutSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
    allDevices: z.boolean().optional().default(false),
});

export type LogoutDto = z.infer<typeof LogoutSchema>;

export const PasswordResetSchema = z.object({
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Max password characters exceeded(how!!!!)')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type PasswordResetDto = z.infer<typeof PasswordResetSchema>;

export const ChangePasswordSchema = z.object({
    oldPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Max password characters exceeded(how!!!!)')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Max password characters exceeded(how!!!!)')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

export const UpdateUserSchema = z.object({
    name: z.string().min(2, 'Name must be 2 digits at minimum').max(100, 'Gosh').optional(),
    email: z.email('Pass in a valid email').optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;