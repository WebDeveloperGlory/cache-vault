import { CreateProductDto, UpdateProductDto } from '@modules/product/application/dtos/product.dto';
import { IProductService } from '@modules/product/application/services/product.service';
import { ProductCategory } from '@modules/product/domain/entities/product.entity';
import { Request, Response, NextFunction } from 'express';

export class ProductController {
    constructor(private readonly productService: IProductService) { }

    create = async (
        req: Request<{}, {}, CreateProductDto>,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const result = await this.productService.create(req.user!.id, req.body);

            res.status(201).json({
                success: true,
                message: 'Product created',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    findById = async (
        req: Request<{ id: string }>,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const result = await this.productService.findById(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Product retrieved',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    findAll = async (
        req: Request<{}, {}, {}, { page?: string, limit?: string }>,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;

            const result = await this.productService.findAll(page, limit);
            res.status(200).json({
                success: true,
                message: 'Products retrieved',
                ...result,
            });
        } catch (error) {
            next(error);
        }
    };

    findByUser = async (
        req: Request<{}, {}, {}, { page?: string, limit?: string, category?: ProductCategory }>,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const { category } = req.query;

            const result = await this.productService.findByUser(req.user!.id, page, limit, category);
            res.status(200).json({
                success: true,
                message: 'Products retrieved',
                ...result,
            });
        } catch (error) {
            next(error);
        }
    };

    findByCategory = async (
        req: Request<{ id: string }, {}, {}, { page?: string, limit?: string }>,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;

            const result = await this.productService.findByCategory(req.params.id, page, limit);
            res.status(200).json({
                success: true,
                message: 'Products retrieved',
                ...result,
            });
        } catch (error) {
            next(error);
        }
    };

    update = async (
        req: Request<{ id: string }, {}, UpdateProductDto>,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const result = await this.productService.update(req.params.id, req.user!.id, req.body);
            res.status(200).json({
                success: true,
                message: 'Product updated',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    };

    delete = async (
        req: Request<{ id: string }>,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            await this.productService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}