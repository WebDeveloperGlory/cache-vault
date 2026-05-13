import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {
    ChangePasswordDto,
    CreateUserDto,
    LoginDto,
    LogoutDto,
    PasswordResetDto,
    RefreshDto,
} from "@modules/user/application/dtos/user.dto";
import { UserEntity } from "@modules/user/domain/entities/user.entity";
import { config } from '@shared/config/env.config';
import {
    AccountInactiveError,
    InvalidCredentialsError,
    InvalidRefreshTokenError,
    RefreshTokenReuseError,
    UserAlreadyExistsError,
    UserNotFoundError
} from '@modules/user/domain/errors/user.errors';
import { comparePassword, hashPassword } from '@shared/utils/bcrypt.util';
import {
    IUserRepository
} from '@modules/user/domain/interfaces/user.repository.interface';

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

interface AuthResponse {
    user: ProfileResponse;
    tokens: TokenPair;
}

interface ProfileResponse extends Omit<UserEntity, 'passwordHash' | 'verification_token' | 'refreshTokens'> { };

const REFRESH_TOKEN_EXPIRES_DAYS = 30;

export interface IAuthService {
    signup(dto: CreateUserDto, meta?: { ip?: string; ua?: string }): Promise<AuthResponse>;
    login(dto: LoginDto, meta?: { ip?: string; ua?: string }): Promise<AuthResponse>;
    refresh(dto: RefreshDto, meta?: { ip?: string; ua?: string }): Promise<TokenPair>;
    logout(userId: string, dto: LogoutDto): Promise<void>;
    me(id: string): Promise<ProfileResponse>;
    changePassword(id: string, dto: ChangePasswordDto, meta?: { ip?: string; ua?: string }): Promise<ProfileResponse>;
}

export class AuthService implements IAuthService {
    constructor(
        private readonly userRepo: IUserRepository,
    ) { }

    async signup(dto: CreateUserDto, meta?: { ip?: string; ua?: string }): Promise<AuthResponse> {
        const existing = await this.userRepo.findByEmail(dto.email);
        if (existing) throw new UserAlreadyExistsError(dto.email);

        const passwordHash = await hashPassword(dto.password);
        const user = await this.userRepo.create({
            ...dto,
            password: passwordHash,
        });
        const tokens = await this.issueTokenPair(user, meta);

        return {
            user: this.sanitize(user),
            tokens,
        };
    }

    async login(dto: LoginDto, meta?: { ip?: string; ua?: string }): Promise<AuthResponse> {
        const user = await this.userRepo.findByEmail(dto.identifier);
        if (!user) throw new InvalidCredentialsError('email');
        if (!user.isActive) throw new AccountInactiveError();

        const passwordValid = await comparePassword(dto.password, user.passwordHash);
        if (!passwordValid) throw new InvalidCredentialsError('email');

        const tokens = await this.issueTokenPair(user, meta);
        return {
            user: this.sanitize(user),
            tokens,
        };
    }

    async refresh(dto: RefreshDto, meta?: { ip?: string; ua?: string }): Promise<TokenPair> {
        let payload: {
            sub: string;
            family: string;
            jti: string;
        };

        try {
            payload = jwt.verify(
                dto.refreshToken,
                config.jwt.secret
            ) as typeof payload;
        } catch {
            throw new InvalidRefreshTokenError();
        }

        const user = await this.userRepo.findById(payload.sub);
        if (!user || !user.isActive) throw new InvalidRefreshTokenError();
        const hashedIncoming = this.hashToken(dto.refreshToken);
        const storedToken = await this.userRepo.rotateRefreshToken(
            user.id,
            hashedIncoming
        );
        if (!storedToken) throw new RefreshTokenReuseError();
        if (storedToken.expiresAt < new Date()) throw new InvalidRefreshTokenError('Refresh token has expired');

        return this.issueTokenPair(
            user,
            meta,
            payload.family
        );
    }

    async logout(userId: string, dto: LogoutDto): Promise<void> {
        const user = await this.userRepo.findById(userId);
        if (!user) throw new UserNotFoundError(userId);

        if (dto.allDevices) {
            await this.userRepo.removeAllRefreshTokens(userId);
            return;
        }

        const hashedToken = this.hashToken(dto.refreshToken);
        await this.userRepo.removeRefreshToken(userId, hashedToken);
    }

    async me(id: string): Promise<ProfileResponse> {
        const user = await this.userRepo.findById(id);

        if (!user) {
            throw new InvalidCredentialsError('User not found');
        }

        return this.sanitize(user);
    }

    async changePassword(id: string, dto: ChangePasswordDto, meta?: { ip?: string; ua?: string; }): Promise<ProfileResponse> {
        const user = await this.userRepo.findById(id);
        if (!user) throw new UserNotFoundError(id);

        const passwordValid = await comparePassword(dto.oldPassword, user.passwordHash);
        if (!passwordValid) throw new InvalidCredentialsError('password');

        await this.userRepo.updatePassword(user.id, dto.newPassword);
        return user;
    }

    private async issueTokenPair(
        user: UserEntity,
        meta?: { ip?: string; ua?: string },
        existingFamily?: string,
    ): Promise<TokenPair> {
        const family =
            existingFamily
            ?? crypto.randomUUID();

        const accessToken = jwt.sign(
            {
                sub: user.id,
                role: user.role,
            },
            config.jwt.secret,
            {
                expiresIn: config.jwt.expiresIn,
            }
        );

        const refreshToken = jwt.sign(
            {
                sub: user.id,
                family,
                jti: crypto.randomUUID(),
            },
            config.jwt.secret,
            {
                expiresIn: `${REFRESH_TOKEN_EXPIRES_DAYS}d`,
            }
        );

        const expiresAt = new Date();

        expiresAt.setDate(
            expiresAt.getDate()
            + REFRESH_TOKEN_EXPIRES_DAYS
        );

        await this.userRepo.addRefreshToken(
            user.id,
            {
                token: this.hashToken(refreshToken),
                family,
                expiresAt,
                ipAddress: meta?.ip ?? null,
                userAgent: meta?.ua ?? null,
            }
        );

        return {
            accessToken,
            refreshToken,
        };
    }

    private hashToken(token: string): string {
        return crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
    }

    private sanitize(user: UserEntity): Omit<UserEntity, 'passwordHash'> {
        const { passwordHash, ...safe } = user;
        return safe;
    }
}