import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, phone, type, details, amount, paymentId, orderId, signature } = req.body;

    if (!name || !email || !phone || !type || !details || !amount || !paymentId || !orderId || !signature) {
      return res.status(400).json({ error: 'Missing booking data' });
    }

    try {
      const booking = await prisma.booking.create({
        data: {
          customerName: name,
          email,
          phone,
          type,
          details: JSON.stringify(details),
          amount: Number(amount),
          status: 'Paid'
        }
      });

      return res.status(201).json({ booking });
    } catch (error) {
      console.error('Booking save failed:', error);
      return res.status(500).json({ error: 'Failed to save booking' });
    }
  }

  if (req.method === 'GET') {
    try {
      const bookings = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json(bookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      return res.status(500).json({ error: 'Failed to load bookings' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
