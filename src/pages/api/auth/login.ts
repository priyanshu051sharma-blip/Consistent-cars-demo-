import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { verifyPassword } from '../../../lib/password';
import { signSessionPayload } from '../../../lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });

    if (!user || !verifyPassword(String(password), user.passwordHash)) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const sessionValue = signSessionPayload({ id: user.id, name: user.name, email: user.email, phone: user.phone });
    res.setHeader('Set-Cookie', `cc_customer_session=${encodeURIComponent(sessionValue)}; Path=/; Max-Age=2592000; SameSite=Lax`);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Customer login failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to log in right now. Please check your database connection and try again.',
    });
  }
}
