import mongoose, { Document, Schema } from "mongoose";

export interface IBanner extends Document {
  header: string;
  subHeader?: string;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const bannerSchema: Schema = new Schema(
  {
    header: { type: String, required: true },
    subHeader: { type: String },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

const Banner = mongoose.model<IBanner>("Banner", bannerSchema);
export default Banner;
