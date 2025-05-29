import mongoose, { Schema, Document } from "mongoose";

export interface IUserCouponUsage {
  couponCode: string;
  timesUsed: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  contact: string;
  role: "customer" | "admin";
  orders: mongoose.Types.ObjectId[];
  couponUsages: IUserCouponUsage[];
  createdAt: Date;
  updatedAt: Date;
}

const UserCouponUsageSchema: Schema = new Schema({
  couponCode: { type: String, required: true, uppercase: true, trim: true },
  timesUsed: { type: Number, default: 0 },
});

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contact: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    couponUsages: [UserCouponUsageSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
