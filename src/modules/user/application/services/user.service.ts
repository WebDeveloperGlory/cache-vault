import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";
import { UserEntity, UserRole } from "@modules/user/domain/entities/user.entity";
import { PaginatedResult } from "@shared/types/common.types";
import { IUserRepository } from "@modules/user/domain/interfaces/user.repository.interface";
import { UserAlreadyExistsError } from "@modules/user/domain/errors/user.errors";

export interface IUserService {
    create(dto: CreateUserDto): Promise<UserEntity>;
    findAll(page: number, limit: number, role?: UserRole, isActive?: boolean): Promise<PaginatedResult<UserEntity>>;
    findById(id: string): Promise<UserEntity>;
    updateActiveStatus(id: string, isActive: boolean): Promise<UserEntity>;
    update(id: string, dto: UpdateUserDto): Promise<UserEntity>;
    delete(id: string): Promise<void>;
}

export class UserService implements IUserService {
    constructor(
        private readonly userRepo: IUserRepository,
    ) { }

    async create(dto: CreateUserDto): Promise<UserEntity> {
        const existingEmailUser = await this.userRepo.findByEmail(dto.email);
        if (existingEmailUser) throw new UserAlreadyExistsError(dto.email);

        return await this.userRepo.create(dto);
    }

    async findAll(page: number, limit: number, role?: UserRole, isActive?: boolean): Promise<PaginatedResult<UserEntity>> {
        const offset = (page - 1) * limit;
        const filters: { role?: UserRole, isActive?: boolean } = {};
        if (role) filters.role = role;
        if (isActive !== undefined) filters.isActive = isActive;

        const [users, total] = await Promise.all([
            await this.userRepo.findAll(limit, offset, filters),
            await this.userRepo.count(filters)
        ]);

        return {
            data: users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

    async findById(id: string): Promise<UserEntity> {
        const user = await this.userRepo.findById(id);
        if (!user) throw new UserAlreadyExistsError(id);

        return user;
    }

    async delete(id: string): Promise<void> {
        return await this.userRepo.delete(id);
    }

    async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
        return await this.userRepo.update(id, dto);
    }

    async updateActiveStatus(id: string, isActive: boolean): Promise<UserEntity> {
        return await this.userRepo.update(id, { isActive });
    }
}