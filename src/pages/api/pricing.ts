import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

function isTransientConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const code = 'code' in error ? error.code : undefined;
  return code === 'P1001'
    || code === 'ETIMEDOUT'
    || code === 'ECONNRESET'
    || /connection terminated due to connection timeout|can't reach database server/i.test(error.message);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    let pricing;
    try {
      pricing = await prisma.pricing.findMany({ include: { car: true } });
    } catch (error) {
      if (!isTransientConnectionError(error)) throw error;

      console.warn('Pricing query hit a transient database connection error; retrying once.', error);
      await new Promise((resolve) => setTimeout(resolve, 250));
      pricing = await prisma.pricing.findMany({ include: { car: true } });
    }

    return res.status(200).json(pricing);
  } catch (error) {
    console.error('Pricing API error:', error);
    return res.status(500).json({ error: 'Failed to load pricing data' });
  }
}
