import { Router } from "express";
import {
  applyCoupon,
  createPaymentIntent,
  saveOrder,
} from "../controllers/payment.controller";
const router = Router();

router.post("/create-payment-intent", createPaymentIntent);
router.post("/save-order", saveOrder);
router.post("/apply-coupon", applyCoupon);
export default router;
