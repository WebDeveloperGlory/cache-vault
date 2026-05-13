export interface UserEntity {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    isActive: boolean;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export enum UserRole {
    SUPER_ADMIN = 'super_admin',
    USER = 'user',
}

export interface RefreshTokenEntity {
    user: string;
    token: string;
    family: string;
    expiresAt: Date;
    createdAt: Date;
    userAgent: string | null;
    ipAddress: string | null;
    isRevoked: boolean;
}