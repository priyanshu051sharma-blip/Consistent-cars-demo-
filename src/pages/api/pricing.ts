import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const pricing = await prisma.pricing.findMany({
      include: {
        car: true,
      },
    });

    return res.status(200).json(pricing);
  } catch (error) {
    console.error('Pricing API error:', error);
    return res.status(500).json({ error: 'Failed to load pricing data' });
  }
}

