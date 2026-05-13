import { ProductCategory, ProductEntity } from "@modules/product/domain/entities/product.entity";
import { Document, model, Schema, Types } from "mongoose";

export interface ProductDocument extends Omit<ProductEntity, 'id' | 'user'>, Document {
    user: Types.ObjectId;
};

const ProductSchema = new Schema<ProductDocument>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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