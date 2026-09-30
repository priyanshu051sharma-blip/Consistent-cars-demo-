import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import nodemailer from 'nodemailer';
import prisma from '../../lib/prisma';
import { getSessionCookieValue } from '../../lib/session';

const VALID_BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'];

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

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const getOfficialEmail = () => process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || 'contact@consistentcars.com';

const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  const transporter = createEmailTransport();
  if (!transporter) {
    console.warn('Email transporter is not configured. Skipping booking email.');
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Consistent Cars <contact@consistentcars.com>',
    to,
    subject,
    text,
    html: html || text,
  });
};

const generateBookingReference = () => {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CC-${stamp}-${suffix}`;
};

const sendAdminBookingNotification = async (booking: any) => {
  const details = typeof booking.details === 'string' ? JSON.parse(booking.details || '{}') : booking.details || {};
  const text = [
    'CONSISTENT CARS — NEW BOOKING',
    '',
    'New booking requires your attention.',
    `Booking ID: ${booking.bookingReference || booking.id}`,
    `Customer Name: ${booking.customerName}`,
    `Customer Email: ${booking.email}`,
    `Customer Phone: ${booking.phone}`,
    `Car: ${details.vehicle || booking.type}`,
    `Pickup Location: ${details.pickupLocation || details.route || 'Not provided'}`,
    `Drop Location: ${details.dropLocation || 'Not provided'}`,
    `Date: ${details.date || 'Not provided'}`,
    `Time: ${details.time || 'Not provided'}`,
    `Distance: ${details.distance || details.kilometers || 'Not provided'} km`,
    `Total Fare: ₹${Number(booking.amount || 0).toFixed(2)}`,
    `Payment Status: ${booking.paymentStatus || 'UNPAID'}`,
    `Booking Status: ${booking.status || 'PENDING'}`,
    `Created At: ${new Date(booking.createdAt).toLocaleString('en-IN')}`,
  ].join('\n');

  await sendEmail(
    getOfficialEmail(),
    'CONSISTENT CARS — NEW BOOKING',
    text,
    `<h2>CONSISTENT CARS — NEW BOOKING</h2><p>New booking requires your attention.</p><ul>${[
      `<li><strong>Booking ID:</strong> ${escapeHtml(booking.bookingReference || booking.id)}</li>`,
      `<li><strong>Customer Name:</strong> ${escapeHtml(booking.customerName)}</li>`,
      `<li><strong>Customer Email:</strong> ${escapeHtml(booking.email)}</li>`,
      `<li><strong>Customer Phone:</strong> ${escapeHtml(booking.phone)}</li>`,
      `<li><strong>Car:</strong> ${escapeHtml(details.vehicle || booking.type)}</li>`,
      `<li><strong>Pickup Location:</strong> ${escapeHtml(details.pickupLocation || details.route || 'Not provided')}</li>`,
      `<li><strong>Drop Location:</strong> ${escapeHtml(details.dropLocation || 'Not provided')}</li>`,
      `<li><strong>Date:</strong> ${escapeHtml(details.date || 'Not provided')}</li>`,
      `<li><strong>Time:</strong> ${escapeHtml(details.time || 'Not provided')}</li>`,
      `<li><strong>Distance:</strong> ${escapeHtml(details.distance || details.kilometers || 'Not provided')} km</li>`,
      `<li><strong>Total Fare:</strong> ₹${Number(booking.amount || 0).toFixed(2)}</li>`,
      `<li><strong>Payment Status:</strong> ${escapeHtml(booking.paymentStatus || 'UNPAID')}</li>`,
      `<li><strong>Booking Status:</strong> ${escapeHtml(booking.status || 'PENDING')}</li>`,
      `<li><strong>Created At:</strong> ${escapeHtml(new Date(booking.createdAt).toLocaleString('en-IN'))}</li>`,
    ].join('')}</ul>`
  );
};

const sendCustomerBookingEmail = async (booking: any) => {
  const details = typeof booking.details === 'string' ? JSON.parse(booking.details || '{}') : booking.details || {};
  const status = String(booking.status || 'PENDING').toUpperCase();
  const message = {
    pending: 'Your booking request has been received and is awaiting confirmation.',
    confirmed: 'Your booking has been confirmed.',
    rejected: 'Your booking has been cancelled/rejected.',
    cancelled: 'Your booking has been cancelled/rejected.',
    completed: 'Your booking has been completed.',
  }[status.toLowerCase()] || 'Your booking status has been updated.';

  const subject = status === 'CONFIRMED' ? 'BOOKING CONFIRMED' : status === 'REJECTED' || status === 'CANCELLED' ? 'BOOKING CANCELLED' : 'Booking Confirmation';
  const body = [
    'Consistent Cars',
    '',
    subject,
    `Booking ID: ${booking.bookingReference || booking.id}`,
    `Customer Name: ${booking.customerName}`,
    `Car: ${details.vehicle || booking.type}`,
    `Pickup: ${details.pickupLocation || details.route || 'Not provided'}`,
    `Drop: ${details.dropLocation || 'Not provided'}`,
    `Date: ${details.date || 'Not provided'}`,
    `Time: ${details.time || 'Not provided'}`,
    `Fare: ₹${Number(booking.amount || 0).toFixed(2)}`,
    `Payment Status: ${booking.paymentStatus || 'UNPAID'}`,
    `Booking Status: ${booking.status || 'PENDING'}`,
    '',
    message,
    'Please contact Consistent Cars if you need assistance.',
  ].join('\n');

  await sendEmail(booking.email, subject, body);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, phone, type, details, amount, paymentId, orderId, signature, customerId } = req.body || {};

    if (!name || !email || !phone || !type || !details || !amount) {
      return res.status(400).json({ success: false, error: 'Missing booking data.' });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid booking amount.' });
    }

    if (paymentId || orderId || signature) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        return res.status(500).json({ success: false, error: 'Razorpay credentials are not configured.' });
      }

      if (!paymentId || !orderId || !signature) {
        return res.status(400).json({ success: false, error: 'Payment verification failed. Please try again.' });
      }

      try {
        const expectedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(`${String(orderId)}|${String(paymentId)}`)
          .digest('hex');
        const providedSignature = String(signature);
        const valid = expectedSignature.length === providedSignature.length && crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(providedSignature));
        if (!valid) {
          return res.status(400).json({ success: false, error: 'Invalid payment signature.' });
        }
      } catch (verificationError) {
        console.error('Razorpay verification failed:', verificationError);
        return res.status(400).json({ success: false, error: 'Unable to verify payment.' });
      }
    }

    try {
      const resolvedCustomerId = customerId || (getSessionCookieValue(req.headers.cookie) as any)?.id || null;
      const bookingData = {
        customerId: resolvedCustomerId || undefined,
        customerName: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        type: String(type).trim(),
        details: typeof details === 'string' ? details : JSON.stringify(details),
        amount: numericAmount,
        depositAmount: paymentId ? numericAmount : 0,
        totalPaid: paymentId ? numericAmount : 0,
        remainingAmount: paymentId ? 0 : numericAmount,
        status: 'PENDING',
        paymentStatus: paymentId ? 'PAID' : 'UNPAID',
        bookingReference: generateBookingReference(),
      };

      const booking = await prisma.booking.create({ data: bookingData });

      try {
        await sendAdminBookingNotification(booking);
      } catch (adminError) {
        console.error('Admin booking notification failed:', adminError);
      }

      try {
        await sendCustomerBookingEmail(booking);
      } catch (customerError) {
        console.error('Customer booking notification failed:', customerError);
      }

      return res.status(201).json({ success: true, booking });
    } catch (error) {
      console.error('Booking save failed:', error);
      return res.status(500).json({ success: false, error: 'Unable to create your booking. Please try again.' });
    }
  }

  if (req.method === 'GET') {
    const customerSession = getSessionCookieValue(req.headers.cookie) as any;
    const adminCookie = req.headers.cookie?.includes('cc_admin_session=');

    try {
      if (req.query.customer === 'true') {
        if (!customerSession?.id) {
          return res.status(401).json({ success: false, error: 'Authentication required.' });
        }

        const bookings = await prisma.booking.findMany({
          where: {
            OR: [{ customerId: String(customerSession.id) }, { email: String(customerSession.email || '') }],
          },
          orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ success: true, bookings });
      }

      if (adminCookie) {
        const bookings = await prisma.booking.findMany({ orderBy: { createdAt: 'desc' } });
        return res.status(200).json({ success: true, bookings });
      }

      return res.status(403).json({ success: false, error: 'Access denied.' });
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      return res.status(500).json({ success: false, error: 'Failed to load bookings.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
}
