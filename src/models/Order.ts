// src/models/Order.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  user?: Types.ObjectId;

  firstName: string;
  lastName: string;
  contactNo: string;
  address: string;
  apartmentNo?: string;
  city: string;

  items: {
    productId: string;
    size?: string;
    color?: string;
    quantity: number;
    price: number;
  }[];

  totalAmount: number;

  // Coupon fields
  couponCode?: string;
  discount?: number;

  // Stripe fields
  stripeSessionId?: string;
  paymentIntentId?: string;
  paymentStatus?: "unpaid" | "paid" | "failed";

  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: Date;
}

const OrderSchema: Schema<IOrder> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    contactNo: { type: String, required: true },
    address: { type: String, required: true },
    apartmentNo: { type: String },
    city: { type: String, required: true },

    items: [
      {
        productId: { type: String, ref: "Product", required: true },
        size: { type: String },
        color: { type: String },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],

    totalAmount: { type: Number, required: true },

    // New coupon fields
    couponCode: { type: String },
    discount: { type: Number, default: 0 },

    // Stripe
    stripeSessionId: { type: String },
    paymentIntentId: { type: String },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
    },

    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
