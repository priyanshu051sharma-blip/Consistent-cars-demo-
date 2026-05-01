import { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";

const razorpayInstance = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { amount } = req.body;

      if (!amount) {
        return res.status(400).json({ error: "Amount is required" });
      }

      const options = {
        amount: Math.round(amount * 100), // amount in paise
        currency: "INR",
        receipt: "receipt_order_" + Date.now(),
      };

      const order = await razorpayInstance.orders.create(options);
      return res.status(200).json(order);
    } catch (error: any) {
      console.error("Razorpay error:", error);
      return res.status(500).json({
        error: "Order creation failed",
        details: error.message,
      });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
