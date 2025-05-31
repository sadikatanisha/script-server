import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
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
  // STRIPE
  stripeSessionId?: string;
  paymentIntentId?: string;
  paymentStatus?: "unpaid" | "paid" | "failed";

  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: Date;
}

const OrderSchema: Schema<IOrder> = new Schema(
  {
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

    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    // Stripe metadata
    stripeSessionId: { type: String },
    paymentIntentId: { type: String },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
    },

    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
