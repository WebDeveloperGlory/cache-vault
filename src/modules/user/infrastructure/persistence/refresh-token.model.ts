import { RefreshTokenEntity } from "@modules/user/domain/entities/user.entity";
import { Document, model, Schema } from "mongoose";

export interface RefreshTokenDocument extends Omit<RefreshTokenEntity, 'id'>, Document { };

const RefreshTokenSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    family: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    userAgent: { type: String, default: null },
    ipAddress: { type: String, default: null },
    isRevoked: { type: Boolean, required: true, default: false },
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

export const RefreshTokenModel = model<RefreshTokenDocument>('RefreshToken', RefreshTokenSchema);