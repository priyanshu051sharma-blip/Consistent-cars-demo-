import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { getSessionCookieValue } from '../../../../lib/session';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function safeNumber(value: unknown, fallback = 0): number {
  const numeric = Number(value ?? fallback);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function getInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(Math.random() * 900000 + 100000);
  return `INV-${year}-${randomPart}`;
}

function buildInvoicePdf(booking: any) {
  const details = typeof booking.details === 'string' ? JSON.parse(booking.details || '{}') : booking.details || {};
  const doc = new jsPDF();
  const totalAmount = safeNumber(booking.amount, 0);
  const paidAmount = safeNumber(booking.totalPaid, 0);
  const remainingAmount = safeNumber(booking.remainingAmount, Math.max(0, totalAmount - paidAmount));
  const taxAmount = safeNumber(details.taxAmount || 0, 0);
  const discountAmount = safeNumber(details.discountAmount || 0, 0);

  doc.setFillColor(8, 145, 178);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSISTENT CARS', 14, 24);
  doc.setFontSize(12);
  doc.text('Official Invoice', 14, 32);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Invoice Number: ${booking.invoiceNumber || 'INV-NOT-ISSUED'}`, 14, 56);
  doc.text(`Booking Number: ${booking.bookingReference || booking.id}`, 14, 63);
  doc.text(`Invoice Date: ${new Date(booking.invoiceIssuedAt || booking.createdAt).toLocaleDateString('en-IN')}`, 14, 70);

  doc.setFont('helvetica', 'bold');
  doc.text('Customer Details', 14, 88);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${booking.customerName || 'N/A'}`, 14, 96);
  doc.text(`Email: ${booking.email || 'N/A'}`, 14, 103);
  doc.text(`Phone: ${booking.phone || 'N/A'}`, 14, 110);

  doc.setFont('helvetica', 'bold');
  doc.text('Trip Details', 110, 88);
  doc.setFont('helvetica', 'normal');
  doc.text(`Car / Vehicle: ${details.vehicle || booking.type || 'Vehicle'}`, 110, 96);
  doc.text(`Pickup: ${details.pickupLocation || details.route || 'N/A'}`, 110, 103);
  doc.text(`Drop: ${details.dropLocation || 'N/A'}`, 110, 110);
  doc.text(`Date: ${details.date || 'N/A'}`, 110, 117);
  doc.text(`Time: ${details.time || 'N/A'}`, 110, 124);
  doc.text(`Distance: ${details.distance || details.kilometers || 'N/A'} km`, 110, 131);

  autoTable(doc, {
    startY: 145,
    head: [['Description', 'Amount']],
    body: [
      ['Base Fare', `₹${safeNumber(details.baseFare || totalAmount, totalAmount).toFixed(2)}`],
      ['Additional Charges', `₹${safeNumber(details.additionalCharges || 0, 0).toFixed(2)}`],
      ['Discount', `-₹${safeNumber(details.discountAmount || 0, 0).toFixed(2)}`],
      ['Tax', `₹${safeNumber(details.taxAmount || taxAmount, 0).toFixed(2)}`],
      ['Total Amount', `₹${totalAmount.toFixed(2)}`],
      ['Amount Paid', `₹${paidAmount.toFixed(2)}`],
      ['Remaining Amount', `₹${remainingAmount.toFixed(2)}`],
      ['Payment Status', booking.paymentStatus || 'UNPAID'],
      ['Booking Status', booking.status || 'PENDING'],
    ],
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  const footerY = (doc as any).lastAutoTable.finalY + 22;
  doc.setFont('helvetica', 'bold');
  doc.text('Consistent Cars', 14, footerY);
  doc.setFont('helvetica', 'normal');
  doc.text('Email: contact@consistentcars.com', 14, footerY + 8);
  doc.text('Phone: +91 98765 43210', 14, footerY + 15);
  doc.text('Website: consistentcars.com', 14, footerY + 22);

  return doc.output('arraybuffer');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const bookingId = String(req.query.id || '');
  const customerSession = getSessionCookieValue(req.headers.cookie);
  const adminIsLoggedIn = req.headers.cookie?.includes('cc_admin_session=');

  if (!bookingId) return res.status(400).json({ success: false, error: 'Missing booking ID' });

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

  const isOwner = customerSession && String((customerSession as any)?.id) === String(booking.customerId || '');
  if (!adminIsLoggedIn && !isOwner) {
    return res.status(403).json({ success: false, error: 'Access denied' });
  }

  if (!booking.invoiceNumber) {
    const invoiceNumber = getInvoiceNumber();
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        invoiceNumber,
        invoiceIssuedAt: new Date(),
      },
    });
    booking.invoiceNumber = invoiceNumber;
    booking.invoiceIssuedAt = new Date();
  }

  const pdfData = buildInvoicePdf(booking);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${booking.bookingReference || booking.id}.pdf"`);
  return res.status(200).send(Buffer.from(pdfData));
}
