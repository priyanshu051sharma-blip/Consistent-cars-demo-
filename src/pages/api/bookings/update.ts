import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import prisma from '../../../lib/prisma';

const VALID_BOOKING_STATUSES = ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'];
const STATUS_ALIASES: Record<string, string> = {
  PAID: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
};

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

const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = createEmailTransport();
  if (!transporter) {
    console.warn('Email transporter is not configured. Skipping booking status email.');
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Consistent Cars <contact@consistentcars.com>',
    to,
    subject,
    text,
  });
};

const getStatusValue = (status: string | undefined) => {
  const value = String(status || '').trim().toUpperCase();
  if (STATUS_ALIASES[value]) return STATUS_ALIASES[value];
  return VALID_BOOKING_STATUSES.includes(value) ? value : 'PENDING';
};

const notifyCustomer = async (booking: any) => {
  const status = String(booking.status || 'PENDING').toUpperCase();
  const details = typeof booking.details === 'string' ? JSON.parse(booking.details || '{}') : booking.details || {};

  const messageByStatus: Record<string, string> = {
    PENDING: 'Your booking has been received and is awaiting confirmation from Consistent Cars.',
    CONFIRMED: 'Your booking has been confirmed. We look forward to serving you.',
    REJECTED: 'Your booking request has been rejected. Please contact our team for further information.',
    CANCELLED: 'Your booking has been cancelled. Please contact our team if you need assistance.',
    COMPLETED: 'Your booking has been completed successfully. Thank you for choosing Consistent Cars.',
  };

  const subject = status === 'CONFIRMED'
    ? 'Booking confirmed | Consistent Cars'
    : status === 'CANCELLED' || status === 'REJECTED'
      ? 'Booking update | Consistent Cars'
      : status === 'COMPLETED'
        ? 'Trip completed | Consistent Cars'
        : 'Booking received | Consistent Cars';

  const text = [
    'Consistent Cars',
    '',
    subject,
    `Booking ID: ${booking.bookingReference || booking.id}`,
    `Customer: ${booking.customerName}`,
    `Car: ${details.vehicle || booking.type || 'Vehicle'}`,
    `Route: ${details.pickupLocation || details.route || 'N/A'} to ${details.dropLocation || 'N/A'}`,
    `Date: ${details.date || 'N/A'}`,
    `Time: ${details.time || 'N/A'}`,
    `Fare: ₹${Number(booking.amount || 0).toFixed(2)}`,
    `Payment Status: ${booking.paymentStatus || 'UNPAID'}`,
    `Booking Status: ${status}`,
    '',
    messageByStatus[status] || 'Your booking status has been updated.',
  ].join('\n');

  await sendEmail(booking.email, subject, text);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  const { id, status } = req.body || {};
  if (!id) {
    return res.status(400).json({ success: false, error: 'Booking ID is required.' });
  }

  const cookieHeader = req.headers.cookie || '';
  const isAdmin = cookieHeader.split(';').map((part) => part.trim()).some((entry) => entry.startsWith('cc_admin_session='));
  if (!isAdmin) {
    return res.status(403).json({ success: false, error: 'Admin access required.' });
  }

  const finalStatus = getStatusValue(status);
  if (!VALID_BOOKING_STATUSES.includes(finalStatus)) {
    return res.status(400).json({ success: false, error: 'Invalid booking status.' });
  }

  try {
    const existingBooking = await prisma.booking.findUnique({ where: { id } });
    if (!existingBooking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const nextBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: finalStatus,
        paymentStatus: finalStatus === 'CONFIRMED' ? 'PAID' : finalStatus === 'COMPLETED' ? 'PAID' : finalStatus === 'CANCELLED' || finalStatus === 'REJECTED' ? 'CANCELLED' : existingBooking.paymentStatus || 'UNPAID',
        remainingAmount: finalStatus === 'CANCELLED' || finalStatus === 'REJECTED' ? 0 : existingBooking.remainingAmount,
      },
    });

    try {
      await notifyCustomer(nextBooking);
    } catch (notificationError) {
      console.error('Status email notification failed:', notificationError);
    }

    return res.status(200).json({ success: true, booking: nextBooking });
  } catch (error) {
    console.error('Booking status update failed:', error);
    return res.status(500).json({ success: false, error: 'Unable to update booking status.' });
  }
}
