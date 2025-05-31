import { Router } from "express";
import {
  getActiveCoupon,
  getAllProducts,
  getFeturedProducts,
  getMyData,
  getProductDetails,
  getProductDetailsBySlug,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.get("/me", authMiddleware, getMyData);
router.get("/products", getAllProducts);
router.get("/products/:id", getProductDetails);
router.get("/products/:slug", getProductDetailsBySlug);
router.get("/featured-products", getFeturedProducts);
router.get("/active-coupon", getActiveCoupon);

export default router;
