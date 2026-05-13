import { UserEntity, UserRole } from "../entities/user.entity";

export interface IUserRepository {
    create(data: CreateUserData): Promise<UserEntity>;
    findAll(limit: number, offset: number, filters: Record<string, any>): Promise<UserEntity[]>;
    findById(id: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    update(id: string, data: UpdateUserData): Promise<UserEntity>;
    updatePassword(id: string, password: string): Promise<UserEntity>;
    delete(id: string): Promise<void>;
    count(filter: Record<string, any>): Promise<number>;
    addRefreshToken(userId: string, entry: RefreshTokenData): Promise<void>;
    invalidateTokenFamily(userId: string, family: string): Promise<void>;
    removeRefreshToken(userId: string, hashedToken: string): Promise<void>;
    removeAllRefreshTokens(userId: string): Promise<void>;
    findRefreshToken(userId: string, hashedToken: string): Promise<RefreshTokenData | null>;
    findRefreshTokensByFamily(userId: string, family: string): Promise<RefreshTokenData[]>;
    rotateRefreshToken(userId: string, hashedToken: string): Promise<RefreshTokenData | null>
}

export interface CreateUserData {
    name: string;
    email: string;
    password: string;
    role: UserRole;
};

export interface UpdateUserData extends Partial<Omit<UserEntity, 'id' | 'passwordHash' | 'role' | 'createdAt' | 'updatedAt'>> { };

export interface RefreshTokenData {
    token: string;
    family: string;
    expiresAt: Date;
    userAgent: string | null;
    ipAddress: string | null;
};