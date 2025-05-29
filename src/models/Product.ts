import mongoose, { Schema, Document } from "mongoose";

interface ICustomizationOption {
  optionName: string;
  optionType: "text" | "number" | "color" | "image";
  required?: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand?: string;
  images: {
    url: string;
    public_id: string;
  }[];
  availableColors?: { name: string; hex: string }[];
  availableSizes?: string[];
  tags?: string[];
  countInStock: number;
  rating: number;
  numReviews: number;
  isCustomizable?: boolean;
  customizationOptions?: ICustomizationOption[];
  featured?: boolean;
  sales?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomizationOptionSchema: Schema = new Schema({
  optionName: { type: String, required: true },
  optionType: {
    type: String,
    enum: ["text", "number", "color", "image"],
    required: true,
  },
  required: { type: Boolean, default: false },
});

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    category: { type: String, required: true },
    brand: { type: String },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    availableColors: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true },
      },
    ],
    availableSizes: { type: [String] },
    tags: { type: [String] },
    countInStock: { type: Number, required: true, default: 0 },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    isCustomizable: { type: Boolean, default: false },
    customizationOptions: [CustomizationOptionSchema],
    featured: { type: Boolean, default: false },
    sales: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
