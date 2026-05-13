import { UserEntity, UserRole } from "@modules/user/domain/entities/user.entity";
import { CreateUserData, IUserRepository, RefreshTokenData, UpdateUserData } from "@modules/user/domain/interfaces/user.repository.interface";
import { hashPassword } from "@shared/utils/bcrypt.util";
import { UserDocument, UserModel } from "./user.model";
import { UserNotFoundError } from "@modules/user/domain/errors/user.errors";
import { RefreshTokenModel } from "./refresh-token.model";

export class UserRepository implements IUserRepository {
    async create(data: CreateUserData): Promise<UserEntity> {
        const passwordHash = await hashPassword(data.password);
        const user = await UserModel.create({
            ...data,
            passwordHash,
            isActive: true,
            lastLogin: null
        });
        return this.toEntity(user);
    };

    async findAll(limit: number, offset: number, filters: Record<string, any>): Promise<UserEntity[]> {
        const users = await UserModel.find(filters).skip(offset).limit(limit);
        return users.map(this.toEntity);
    }

    async findById(id: string): Promise<UserEntity | null> {
        const user = await UserModel.findById(id);
        return user ? this.toEntity(user) : null;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = await UserModel.findOne({ email });
        return user ? this.toEntity(user) : null;
    }

    async update(id: string, data: UpdateUserData): Promise<UserEntity> {
        const user = await UserModel.findByIdAndUpdate(
            id,
            data
        );
        if (!user) throw new UserNotFoundError(id);
        return this.toEntity(user);
    }

    async updatePassword(id: string, password: string): Promise<UserEntity> {
        const passwordHash = await hashPassword(password);

        const user = await UserModel.findByIdAndUpdate(
            id,
            { passwordHash }
        );
        if (!user) throw new UserNotFoundError(id);
        return this.toEntity(user);
    }

    async delete(id: string): Promise<void> {
        await UserModel.findByIdAndDelete(id);
    }

    async count(filter: Record<string, any>): Promise<number> {
        return await UserModel.countDocuments(filter);
    }

    async addRefreshToken(userId: string, entry: RefreshTokenData): Promise<void> {
        await RefreshTokenModel.create({
            ...entry,
            isRevoked: false,
            user: userId,
        });
    }

    async invalidateTokenFamily(userId: string, family: string): Promise<void> {
        await RefreshTokenModel.updateMany(
            { user: userId, family },
            { isRevoked: true }
        );
    }

    async removeRefreshToken(userId: string, hashedToken: string): Promise<void> {
        await RefreshTokenModel.findOneAndUpdate(
            { user: userId, token: hashedToken },
            { isRevoked: true }
        );
    }

    async removeAllRefreshTokens(userId: string): Promise<void> {
        await RefreshTokenModel.updateMany(
            { user: userId },
            { isRevoked: true }
        );
    }

    async findRefreshToken(userId: string, hashedToken: string): Promise<RefreshTokenData | null> {
        const token = await RefreshTokenModel.findOne({ user: userId, token: hashedToken, isRevoked: false });
        if (!token) return null;

        return {
            token: token.token,
            family: token.family,
            expiresAt: token.expiresAt,
            userAgent: token.userAgent,
            ipAddress: token.ipAddress,
        };
    }

    async findRefreshTokensByFamily(userId: string, family: string): Promise<RefreshTokenData[]> {
        const tokens = await RefreshTokenModel.find(
            { user: userId, family, isRevoked: false },
            { isRevoked: true }
        );

        return tokens.map(token => ({
            token: token.token,
            family: token.family,
            expiresAt: token.expiresAt,
            userAgent: token.userAgent,
            ipAddress: token.ipAddress,
        }));
    }

    async rotateRefreshToken(userId: string, hashedToken: string): Promise<RefreshTokenData | null> {
        const token = await RefreshTokenModel.findOneAndUpdate(
            { user: userId, token: hashedToken },
            { isRevoked: true }
        );
        if (!token) return null;

        return {
            token: token.token,
            family: token.family,
            expiresAt: token.expiresAt,
            userAgent: token.userAgent,
            ipAddress: token.ipAddress,
        };
    }

    private toEntity(doc: UserDocument): UserEntity {
        return {
            id: doc.id,
            name: doc.name,
            email: doc.email,
            passwordHash: doc.passwordHash,
            role: doc.role,
            isActive: doc.isActive,
            lastLogin: doc.lastLogin,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }
    }
}