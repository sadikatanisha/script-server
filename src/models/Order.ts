import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
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
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: "COD" | "Online";
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: Date;
}

const OrderSchema: Schema = new Schema<IOrder>(
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
    deliveryCharge: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "COD",
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
