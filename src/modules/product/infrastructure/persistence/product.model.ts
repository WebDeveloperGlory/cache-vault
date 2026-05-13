import { ProductCategory, ProductEntity } from "@modules/product/domain/entities/product.entity";
import { Document, model, Schema } from "mongoose";

export interface ProductDocument extends Omit<ProductEntity, 'id'>, Document { };

const ProductSchema = new Schema<ProductDocument>({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    category: { type: String, enum: Object.values(ProductCategory), required: true },
    stock: { type: Number, default: 0 },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        virtuals: true,
        transform: (_doc, ret: Record<string, any>) => {
            ret['id'] = ret['_id'].toString();
            delete ret['_id'];
            return ret;
        },
    },
});

export const ProductModel = model<ProductDocument>('Product', ProductSchema);