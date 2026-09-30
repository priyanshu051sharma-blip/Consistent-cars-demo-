import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { hashPassword } from '../../../lib/password';
import { signSessionPayload } from '../../../lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { name, email, phone, password, confirmPassword } = req.body || {};

  if (!name || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ success: false, error: 'Please complete all required fields.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, error: 'Passwords do not match.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedPhone = String(phone).trim();

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } }).catch(() => null);
  if (existingUser) {
    return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
  }

  const user = await prisma.user.create({
    data: {
      name: String(name).trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash: hashPassword(String(password)),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });

  const sessionValue = signSessionPayload({ id: user.id, name: user.name, email: user.email, phone: user.phone });
  res.setHeader('Set-Cookie', `cc_customer_session=${encodeURIComponent(sessionValue)}; Path=/; Max-Age=2592000; SameSite=Lax`);

  return res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    user,
  });
}
