import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ error: 'Missing payment verification fields' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(500).json({ error: 'Razorpay credentials are not configured' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${String(orderId)}|${String(paymentId)}`)
    .digest('hex');
  const providedSignature = String(signature);

  const signaturesMatch = expectedSignature.length === providedSignature.length
    && crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(providedSignature));

  if (!signaturesMatch) {
    return res.status(400).json({ success: false, error: 'Invalid payment signature' });
  }

  return res.status(200).json({ success: true, order_id: orderId, payment_id: paymentId });
}
