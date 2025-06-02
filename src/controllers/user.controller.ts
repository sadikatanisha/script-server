import { Request, Response, NextFunction } from "express";
import Product from "../models/Product";
import Order from "../models/Order";
import Coupon from "../models/Coupon";
import User, { IUser } from "../models/User";

export const getMyData = async (req: Request, res: Response): Promise<void> => {
  try {
    const me = req.user as IUser | undefined;
    if (!me) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }
    const fresh = await User.findById(me._id).select("-password -__v").lean();

    if (!fresh) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: fresh,
    });
  } catch (err: any) {
    console.error("Error in getMyData:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Get All Products
// @route   GET /api/user/products/
// @access  Public
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get Product Details
// @route   GET /api/user/products/:id
// @access  Public

export const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get Product Details By SLUG
// @route   GET /api/user/products/:slug
// @access  Public
export const getProductDetailsBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get Featured Products
// @route   GET /api/user/featured-products/
// @access  Public

export const getFeturedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await Product.find({ featured: true });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      contactNo,
      address,
      apartmentNo,
      city,
      items,
      deliveryCharge,
      totalAmount,
      paymentMethod,
    } = req.body;
    if (
      !firstName ||
      !lastName ||
      !contactNo ||
      !address ||
      !city ||
      !Array.isArray(items) ||
      items.length === 0 ||
      deliveryCharge == null ||
      totalAmount == null ||
      !["COD", "Online"].includes(paymentMethod)
    ) {
      res.status(400).json({ message: "Missing or invalid order data" });
      return;
    }
    const newOrder = await Order.create({
      firstName,
      lastName,
      contactNo,
      address,
      apartmentNo: apartmentNo || undefined,
      city,
      items: items.map((i: any) => ({
        productId: i.productId,
        size: i.size || undefined,
        color: i.color || undefined,
        quantity: i.quantity,
        price: i.price,
      })),
      deliveryCharge,
      totalAmount,
      paymentMethod,
    });
    res.status(201).json({
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Error Creating Order", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getActiveCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const now = new Date();

    const activeCoupons = await Coupon.find({
      active: true,
      expirationDate: { $gte: now },
    }).sort({ createdAt: -1 });

    res.status(200).json(activeCoupons);
  } catch (err) {
    console.error("Error getting active coupon", err);
    res.status(500).json({ message: "Failed to get active coupon." });
  }
};

export const getOrderHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Ensure authMiddleware has attached req.user
    if (!req.user) {
      res
        .status(401)
        .json({ message: "Unauthorized: no user found on request" });
      return;
    }

    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "items.productId",
        select: "name price images",
      })
      .exec();

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Error getting order history", err);
    res.status(500).json({ message: "Failed to get order history" });
  }
};
