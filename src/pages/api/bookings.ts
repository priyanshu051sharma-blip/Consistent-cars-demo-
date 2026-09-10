import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const createEmailTransport = () => {
  if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT) || 587,
    secure: process.env.EMAIL_SERVER_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
};

const createTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }

  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

const sendBookingEmail = async (email: string, bookingDetails: any, amount: number) => {
  const transporter = createEmailTransport();
  if (!transporter) {
    console.warn('Email transporter is not configured. Skipping booking confirmation email.');
    return;
  }

  const totalAmount = Number(bookingDetails?.totalAmount || amount);
  const balanceAmount = Math.max(0, totalAmount - amount);
  const invoiceHtml = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#172033"><h1>Consistent Cars</h1><h2>Booking Invoice</h2><p><strong>Customer:</strong> ${escapeHtml(bookingDetails?.name || email)}</p><p><strong>Vehicle:</strong> ${escapeHtml(bookingDetails?.vehicle || 'Car')}</p><p><strong>Route:</strong> ${escapeHtml(bookingDetails?.route || 'Not provided')}</p><p><strong>Trip:</strong> ${escapeHtml(bookingDetails?.tripType || 'One-way')}</p><p><strong>Date:</strong> ${escapeHtml(`${bookingDetails?.date || ''} ${bookingDetails?.time || ''}`)}</p><hr><p><strong>Total booking amount:</strong> Rs. ${totalAmount.toFixed(2)}</p><p><strong>Paid:</strong> Rs. ${amount.toFixed(2)}</p><p><strong>Balance:</strong> Rs. ${balanceAmount.toFixed(2)}</p></body></html>`;

  const message = {
    from: process.env.EMAIL_FROM || 'Consistent Cars <no-reply@consistentcars.com>',
    to: email,
    subject: 'Your Consistent Cars Booking Confirmation',
    text: `Thank you for booking with Consistent Cars!\n\nVehicle: ${bookingDetails.vehicle}\nRoute: ${bookingDetails.route}\nTrip: ${bookingDetails.tripType || 'One-way'}\nDate & Time: ${bookingDetails.date} ${bookingDetails.time}\nDuration: ${bookingDetails.duration} hours\nTotal: Rs. ${totalAmount.toFixed(2)}\nPaid: Rs. ${amount.toFixed(2)}\nBalance: Rs. ${balanceAmount.toFixed(2)}`,
    html: invoiceHtml,
    attachments: [{
      filename: 'consistent-cars-invoice.html',
      content: invoiceHtml,
      contentType: 'text/html',
    }],
  };

  await transporter.sendMail(message);
};

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const sendBookingSms = async (phone: string, bookingDetails: any, amount: number) => {
  const client = createTwilioClient();
  if (!client) {
    console.warn('Twilio client is not configured. Skipping SMS notification.');
    return;
  }

  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  if (!fromNumber) {
    console.warn('Twilio FROM number is not configured. Skipping SMS notification.');
    return;
  }

  await client.messages.create({
    body: `Consistent Cars booking confirmed! Vehicle: ${bookingDetails.vehicle}. Route: ${bookingDetails.route}. Amount: ₹${amount.toFixed(2)}.`,
    from: fromNumber,
    to: phone,
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, phone, type, details, amount, paymentId, orderId, signature } = req.body;

    if (!name || !email || !phone || !type || !details || !amount || !paymentId || !orderId || !signature) {
      return res.status(400).json({ error: 'Missing booking data' });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return res.status(500).json({ error: 'Razorpay credentials are not configured' });
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
      const providedSignature = String(signature);
      if (expectedSignature.length !== providedSignature.length || !crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(providedSignature))) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }

      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const order = await razorpay.orders.fetch(String(orderId));
      const expectedAmount = Math.round(Number(amount) * 100);
      if (order.currency !== 'INR' || Number(order.amount) !== expectedAmount) {
        return res.status(400).json({ error: 'Payment amount does not match the booking' });
      }

      const payment = await razorpay.payments.fetch(String(paymentId));
      if (payment.order_id !== order.id || payment.status !== 'captured') {
        return res.status(400).json({ error: 'Payment was not captured for this order' });
      }
    } catch (verificationError) {
      console.error('Razorpay payment verification failed:', verificationError);
      return res.status(400).json({ error: 'Unable to verify payment' });
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

      try {
        await Promise.all([
          sendBookingEmail(email, details, Number(amount)),
          sendBookingSms(phone, details, Number(amount)),
        ]);
      } catch (notificationError) {
        console.warn('Booking saved, but notification sending failed:', notificationError);
      }

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
