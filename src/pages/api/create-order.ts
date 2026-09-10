import type { NextApiRequest, NextApiResponse } from 'next';
import Razorpay from 'razorpay';

function getRazorpayCredentials() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const amount = Number(req.body?.amount);
  const currency = String(req.body?.currency || 'INR').toUpperCase();
  const receipt = String(req.body?.receipt || `cc_${Date.now()}`).slice(0, 40);

  if (!Number.isInteger(amount) || amount < 100) {
    return res.status(400).json({ error: 'Amount must be at least 100 paise' });
  }

  const { keyId, keySecret } = getRazorpayCredentials();
  if (!keyId || !keySecret) {
    return res.status(500).json({ error: 'Razorpay credentials are not configured' });
  }

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
      payment_capture: true,
    });

    return res.status(200).json({
      order_id: order.id,
      key_id: keyId,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    const statusCode = Number(error?.statusCode || error?.status || 500);
    console.error('Razorpay order creation failed:', error);
    if (statusCode === 401) {
      return res.status(401).json({ error: 'Razorpay authentication failed' });
    }
    return res.status(500).json({ error: 'Failed to create payment order' });
  }
}
