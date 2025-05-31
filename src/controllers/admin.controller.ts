import { Request, Response, NextFunction } from "express";
import Product from "../models/Product";
import cloudinary from "../config/cloudinary";
import Banner from "../models/Banner";
import User from "../models/User";
import Order from "../models/Order";
import mongoose from "mongoose";
import Coupon from "../models/Coupon";

// @desc    Create Product
// @route   POST /api/admin/create-product
// @access  Private

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      slug,
      description,
      sku,
      price,
      discountPrice,
      category,
      brand,
      availableColors,
      availableSizes,
      tags,
      countInStock,
      isCustomizable,
      customizationOptions,
      featured,
    } = req.body;

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new Error("No files uploaded");
    }

    let parsedAvailableColors = availableColors;
    if (typeof availableColors === "string") {
      parsedAvailableColors = JSON.parse(availableColors);
    }

    let parsedAvailableSizes = availableSizes;
    if (typeof availableSizes === "string") {
      parsedAvailableSizes = availableSizes
        .split(",")
        .map((size) => size.trim());
    }
    // Upload images to Cloudinary
    const imageUploads = await Promise.all(
      files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        return { url: result.secure_url, public_id: result.public_id };
      })
    );

    // Create new product
    const newProduct = new Product({
      name,
      slug,
      description,
      sku,
      price,
      discountPrice,
      category,
      brand,
      images: imageUploads,
      availableColors: parsedAvailableColors,
      availableSizes: parsedAvailableSizes,
      tags,
      countInStock,
      isCustomizable,
      customizationOptions,
      featured,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product" });
  }
};

// @desc    Create Product
// @route   PATCH /api/admin/update-product
// @access  Private
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    const updateFields: any = {};
    const fields = [
      "name",
      "slug",
      "description",
      "sku",
      "price",
      "discountPrice",
      "category",
      "brand",
      "availableColors",
      "availableSizes",
      "tags",
      "countInStock",
      "isCustomizable",
      "customizationOptions",
      "featured",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // Parse availableColors if provided as a JSON string
    if (
      updateFields.availableColors &&
      typeof updateFields.availableColors === "string"
    ) {
      updateFields.availableColors = JSON.parse(updateFields.availableColors);
    }

    if (
      updateFields.availableSizes &&
      typeof updateFields.availableSizes === "string"
    ) {
      updateFields.availableSizes = updateFields.availableSizes
        .split(",")
        .map((size: string) => size.trim());
    }

    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const imageUploads = await Promise.all(
        files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
          });
          return { url: result.secure_url, public_id: result.public_id };
        })
      );
      updateFields.images = imageUploads;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, {
      new: true,
    });
    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error updating product:", error.message);
      res.status(500).json({ success: false, message: error.message });
    } else {
      res
        .status(500)
        .json({ success: false, message: "An unknown error occurred" });
    }
  }
};

// @desc    Toggle product featured status
// @route   PATCH /api/admin/products/:id/toggle-featured
// @access  Private
export const toggleProductFeatured = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    // Toggle the featured status
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { featured: !product.featured },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Product ${
        updatedProduct?.featured
          ? "marked as featured"
          : "removed from featured"
      }`,
      product: updatedProduct,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error toggling featured status:", error.message);
      res.status(500).json({ success: false, message: error.message });
    } else {
      res
        .status(500)
        .json({ success: false, message: "An unknown error occurred" });
    }
  }
};

// @desc    Delete Product
// @route   DELETE /api/admin/delete-product/:id
// @access  Private
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    await Promise.all(
      product.images.map(async (image) => {
        await cloudinary.uploader.destroy(image.public_id);
      })
    );

    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
};

// @desc    Get All Products
// @route   GET /api/admin/
// @access  Private
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

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find().select("-password").lean();
    if (!users) {
      res.status(404).json({ message: "No users found" });
      return;
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error while retrieving users" });
  }
};

/**
 * @desc    Update a user's role
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    // Validate new role
    const allowedRoles = ["user", "editor", "admin"]; // adjust roles as needed
    if (!role || !allowedRoles.includes(role)) {
      res.status(400).json({ message: "Invalid or missing role" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: "User role updated successfully",
      user: { id: user._id, role: user.role },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Server error while updating user role" });
  }
};

// BANNER

export const addBanner = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { header, subHeader } = req.body;
    const file = req.file as Express.Multer.File;

    if (!file) {
      res.status(400).json({ message: "No image file uploaded" });
      return;
    }

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: "banners",
    });

    const newBanner = new Banner({
      header,
      subHeader,
      image: uploadResult.secure_url,
    });

    const savedBanner = await newBanner.save();
    res.status(201).json(savedBanner);
  } catch (error) {
    console.error("Error adding banner:", error);
    res.status(500).json({ message: "Failed to add banner" });
  }
};

export const updateBanner = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { header, subHeader } = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      res.status(404).json({ message: "Banner not found" });
      return;
    }

    let updatedFields: any = {
      header: header || banner.header,
      subHeader: subHeader || banner.subHeader,
    };

    const file = req.file as Express.Multer.File;
    if (file) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "banners",
      });
      updatedFields.image = result.secure_url;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    res.status(200).json(updatedBanner);
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ message: "Failed to update banner" });
  }
};

export const getBanner = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const banners = await Banner.find();
    res.status(200).json(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({ message: "Failed to fetch banners" });
  }
};

export const getBannerById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) {
      res.status(404).json({ message: "Banner not found" });
      return;
    }
    res.status(200).json(banner);
  } catch (error) {
    console.error("Error fetching banner by ID:", error);
    res.status(500).json({ message: "Failed to fetch banner by ID" });
  }
};

export const deleteBanner = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Banner.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ message: "Banner not found." });
      return;
    }
  } catch (error) {
    console.error("Error Deleting", error);
    res.status(500).json({ message: "Failed to Delete Banner" });
  }
};

// Order
export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching Orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const getOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate({
        path: "items.productId",
        select: "name images",
      })
      .lean();
    if (!order) {
      res.status(404).json({ message: "Order not found." });
      return;
    }

    res.status(200).json(order);
  } catch (err) {
    console.error(`Error fetching order ${req.params.id}:`, err);
    res.status(500).json({ message: "Failed to fetch orderdetails" });
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ message: "Invalid or missing status." });
      return;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      res.status(404).json({ message: "Order not found." });
      return;
    }

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error(`Error updating order status`, err);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

// get all the coupons
export const getAllCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (err) {
    console.error("Error fetching coupons:", err);
    res.status(500).json({ message: "Failed to fetch coupons." });
  }
};

// create a coupon code
export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("BODY:", req.body);
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscountAmount,
      usageLimit,
      perUserLimit,
      expirationDate,
      active,
    } = req.body;

    if (
      !code ||
      !discountType ||
      discountValue === undefined ||
      !expirationDate
    ) {
      res.status(400).json({
        message:
          "code, discountType, discountValue, and expirationDate are required.",
      });
      return;
    }
    const parsedDate = new Date(expirationDate);
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({
        message:
          "expirationDate must be a valid date string (e.g. '2025-05-31').",
      });
      return;
    }

    const normalizedCode = code.trim().toUpperCase();

    const existing = await Coupon.findOne({ code: normalizedCode });
    if (existing) {
      res.status(400).json({ message: "Coupon code already exists." });
      return;
    }
    const newCoupon = new Coupon({
      code: normalizedCode,
      discountType,
      discountValue,
      // Only include optional fields if they were provided
      ...(minPurchase !== undefined && minPurchase !== ""
        ? { minPurchase: Number(minPurchase) }
        : {}),
      ...(maxDiscountAmount !== undefined && maxDiscountAmount !== ""
        ? { maxDiscountAmount: Number(maxDiscountAmount) }
        : {}),
      ...(usageLimit !== undefined && usageLimit !== ""
        ? { usageLimit: Number(usageLimit) }
        : {}),
      ...(perUserLimit !== undefined && perUserLimit !== ""
        ? { perUserLimit: Number(perUserLimit) }
        : {}),
      expirationDate: parsedDate,

      active: active === undefined ? true : Boolean(active),
    });

    const savedCoupon = await newCoupon.save();
    res.status(201).json(savedCoupon);
  } catch (err) {
    console.error("Error creating coupon:", err);
    res.status(500).json({ message: "Failed to create coupon." });
  }
};

// delete coupon code
export const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid coupon ID." });
      return;
    }

    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ message: "Coupon not found." });
      return;
    }

    res.status(200).json({ message: "Coupon deleted successfully." });
  } catch (err) {
    console.error("Error deleting coupon:", err);
    res.status(500).json({ message: "Failed to delete coupon." });
  }
};
