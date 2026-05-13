import { Request, Response, NextFunction } from "express";
import { IUserService } from "@modules/user/application/services/user.service";
import { UserRole } from "@modules/user/domain/entities/user.entity";

export class UserController {
    constructor(private readonly userService: IUserService) { }

    findAll = async (
        req: Request<{}, {}, {}, { page?: string, limit?: string, role?: UserRole, isActive?: boolean }>,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const { role, isActive } = req.query;

            const result = await this.userService.findAll(page, limit, role, isActive);
            res.status(200).json({
                success: true,
                message: 'All users acquired',
                ...result,
            })
        } catch (error) {
            next(error);
        }
    }

    findById = async (
        req: Request<{ id: string }>,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const user = await this.userService.findById(req.params.id);
            res.status(200).json({
                success: true,
                message: 'User acquired',
                data: user,
            })
        } catch (error) {
            next(error);
        }
    }
}