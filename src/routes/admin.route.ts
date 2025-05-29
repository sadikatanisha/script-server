import { Router } from "express";
import {
  addBanner,
  createCoupon,
  createProduct,
  deleteBanner,
  deleteCoupon,
  deleteProduct,
  getAllCoupons,
  getAllOrders,
  getAllProducts,
  getAllUsers,
  getBanner,
  getBannerById,
  getOrderDetails,
  toggleProductFeatured,
  updateBanner,
  updateOrderStatus,
  updateProduct,
  updateUserRole,
} from "../controllers/admin.controller";
import upload from "../middlewares/multer";

const router = Router();
router.post("/create-product", upload.array("images"), createProduct);
router.put("/update-product/:id", upload.array("images"), updateProduct);
router.patch("/products/:id/toggle-featured", toggleProductFeatured);

router.delete("/delete-product/:id", deleteProduct);
// Not Admin Route
router.get("/", getAllProducts);

// Users
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);

// Content
router.get("/get-banner", getBanner);
router.get("/get-banner/:id", getBannerById);
router.post("/create-banner", upload.single("image"), addBanner);
router.patch("/update-banner/:id", upload.single("image"), updateBanner);
router.delete("/delete-banner/:id", deleteBanner);

// orders
router.get("/all-orders", getAllOrders);
router.get("/order-details/:id", getOrderDetails);
router.patch("/update-status/:id", updateOrderStatus);

// coupon
router.get("/coupons", getAllCoupons);

router.post("/create-coupon", createCoupon);
router.delete("/delete-coupon/:id", deleteCoupon);

export default router;
