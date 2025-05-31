import { Request, Response } from "express";
import Stripe from "stripe";
import Order, { IOrder } from "../models/Order";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createPaymentIntent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { items, currency = "usd", userId } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: "items array is required" });
      return;
    }

    let amountInCents = 0;
    for (const item of items) {
      if (typeof item.price !== "number" || typeof item.quantity !== "number") {
        res
          .status(400)
          .json({ message: "Each item must have numeric price and quantity" });
        return;
      }
      amountInCents += Math.round(item.price * item.quantity * 100);
    }

    // 3️⃣ Create the Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      payment_method_types: ["card"],
      metadata: {
        userId: userId || "guest",
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("createPaymentIntent error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to create PaymentIntent" });
  }
};

// Handle Stripe webhooks
export const handleWebhook = async (
  req: Request & { rawBody: Buffer },
  res: Response
): Promise<void> => {
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const data = event.data.object as Stripe.PaymentIntent;
  const orderId = data.metadata?.orderId;

  switch (event.type) {
    case "payment_intent.succeeded":
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "paid",
        paymentIntentId: data.id,
        status: "Processing",
      });
      break;

    case "payment_intent.payment_failed":
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "failed",
      });
      break;

    default:
      console.warn(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};

export const saveOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      contactNo,
      address,
      apartmentNo,
      city,
      items,
      totalAmount,
      paymentIntentId,
    } = req.body;

    // 1️⃣ Validate required fields
    if (
      !firstName ||
      !lastName ||
      !contactNo ||
      !address ||
      !city ||
      !Array.isArray(items) ||
      items.length === 0 ||
      typeof totalAmount !== "number" ||
      !paymentIntentId
    ) {
      res.status(400).json({ message: "Missing required order details" });
      return;
    }

    // 2️⃣ Retrieve the PaymentIntent from Stripe and verify it succeeded
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== "succeeded") {
      res.status(400).json({ message: "Payment not completed" });
      return;
    }

    // 3️⃣ Construct a new Order document matching IOrder schema
    const newOrder = new Order({
      firstName,
      lastName,
      contactNo,
      address,
      apartmentNo: apartmentNo || undefined,
      city,
      items: items.map((it: any) => ({
        productId: it.productId,
        size: it.size,
        color: it.color,
        quantity: it.quantity,
        price: it.price,
      })),
      totalAmount,
      // Stripe metadata
      stripeSessionId: pi.id, // We can reuse the PaymentIntent ID here
      paymentIntentId: pi.id,
      paymentStatus: "paid",
      status: "Processing",
    } as IOrder);

    // 4️⃣ Save and respond
    const saved = await newOrder.save();
    res.status(201).json({ message: "Order saved", order: saved });
  } catch (err: any) {
    console.error("saveOrder error:", err);
    res.status(500).json({ message: err.message || "Failed to save order" });
  }
};
