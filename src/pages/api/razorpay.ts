import type { NextApiRequest, NextApiResponse } from 'next';
import Razorpay from 'razorpay';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { amount, bookingReference } = req.body;
  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpayKeySecret) {
    return res.status(500).json({ error: 'Razorpay credentials are not configured' });
  }

  try {
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(numericAmount * 100),
      currency: 'INR',
      payment_capture: true,
      notes: {
        purpose: 'Consistent Cars booking payment',
        ...(bookingReference ? { bookingReference: String(bookingReference).slice(0, 40) } : {}),
      },
    });

    return res.status(200).json(order);
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    return res.status(500).json({ error: 'Failed to create payment order' });
  }
}
