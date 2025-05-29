import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase?: number; // minimum cart subtotal required to apply coupon
  maxDiscountAmount?: number; // cap on discount for percentage coupons
  usageLimit?: number; // total number of times this coupon can be used (globally)
  perUserLimit?: number;
  expirationDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true },
    minPurchase: { type: Number },
    maxDiscountAmount: { type: Number },
    usageLimit: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    expirationDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICoupon>("Coupon", CouponSchema);
