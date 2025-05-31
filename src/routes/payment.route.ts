import { Router } from "express";
import {
  createPaymentIntent,
  saveOrder,
} from "../controllers/payment.controller";
const router = Router();

router.post("/create-payment-intent", createPaymentIntent);
router.post("/save-order", saveOrder);

export default router;
