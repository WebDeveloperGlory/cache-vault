import { Request, Response, NextFunction } from "express";
import { ChangePasswordDto, CreateUserDto, LoginDto, LogoutDto, PasswordResetDto } from "@modules/user/application/dtos/user.dto";
import { IAuthService } from "@modules/auth/application/services/auth.service";
import { config } from "@shared/config/env.config";
import { UnauthorizedError } from "@shared/errors/app.error";

export class AuthController {
    constructor(private readonly authService: IAuthService) { };

    register = async (
        req: Request<{}, {}, CreateUserDto>,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const { user, tokens } = await this.authService.signup(req.body, {
                ip: req.ip,
                ua: req.headers['user-agent'],
            });

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: { user, accessToken: tokens.accessToken },
            });
        } catch (error) {
            next(error);
        }
    }

    login = async (
        req: Request<{}, {}, LoginDto>,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { user, tokens } = await this.authService.login(req.body, {
                ip: req.ip,
                ua: req.headers['user-agent'],
            });

            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: config.env === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: { user, accessToken: tokens.accessToken },
            });
        } catch (error) {
            next(error);
        }
    };

    refresh = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const refreshToken = req.cookies?.refreshToken;

            if (!refreshToken) {
                return next(new UnauthorizedError('No refresh token provided'));
            }

            const tokens = await this.authService.refresh(
                { refreshToken },
                {
                    ip: req.ip,
                    ua: req.headers['user-agent'],
                }
            );

            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: config.env === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json({
                success: true,
                message: 'Tokens refreshed',
                data: { accessToken: tokens.accessToken },
            });
        } catch (error) {
            next(error);
        }
    };

    logout = async (
        req: Request<{}, {}, LogoutDto>,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const refreshToken = req.cookies?.refreshToken;

            await this.authService.logout(req.user!.id, {
                refreshToken,
                allDevices: req.body.allDevices,
            });

            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: config.env === 'production',
                sameSite: 'strict',
            });

            res.status(200).json({
                success: true,
                message: 'Logged out successfully',
            });
        } catch (error) {
            next(error);
        }
    };

    me = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const user = await this.authService.me(req.user!.id);

            res.status(200).json({
                success: true,
                message: 'Profile acquired',
                data: user,
            });
        } catch (error) {
            next(error);
        }
    };

    changePassword = async (
        req: Request<{}, {}, ChangePasswordDto>,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            await this.authService.changePassword(req.user!.id, req.body, {
                ip: req.ip,
                ua: req.headers['user-agent'],
            });

            res.status(200).json({
                success: true,
                message: 'Password reset',
            });
        } catch (error) {
            next(error);
        }
    };
}