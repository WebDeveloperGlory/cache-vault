import { UserEntity, UserRole } from "@modules/user/domain/entities/user.entity";
import { Document, model, Schema } from "mongoose";

export interface UserDocument extends Omit<UserEntity, 'id'>, Document { };

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    isActive: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
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

export const UserModel = model<UserDocument>('User', UserSchema);