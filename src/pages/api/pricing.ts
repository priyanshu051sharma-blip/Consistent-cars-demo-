import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const pricing = [
    {
      id: 'delhi-local-innova',
      location: 'Delhi Local',
      pricePerKm: 18,
      basePrice: 1800,
      baseKm: 30,
      extraHourRate: 300,
      driverAllowance: 300,
      description: 'Delhi local rides',
      car: { id: 'innova', name: 'Toyota Innova', type: 'SUV', seats: 6 },
    },
    {
      id: 'delhi-outstation-innova',
      location: 'Delhi Outstation',
      pricePerKm: 20,
      basePrice: 2200,
      baseKm: 30,
      extraHourRate: 300,
      driverAllowance: 300,
      description: 'Delhi outstation rides',
      car: { id: 'innova', name: 'Toyota Innova', type: 'SUV', seats: 6 },
    },
    {
      id: 'pune-local-innova',
      location: 'Pune Local',
      pricePerKm: 16,
      basePrice: 1600,
      baseKm: 30,
      extraHourRate: 250,
      driverAllowance: 250,
      description: 'Pune local rides',
      car: { id: 'innova', name: 'Toyota Innova', type: 'SUV', seats: 6 },
    },
    {
      id: 'pune-outstation-innova',
      location: 'Pune Outstation',
      pricePerKm: 18,
      basePrice: 2000,
      baseKm: 30,
      extraHourRate: 250,
      driverAllowance: 250,
      description: 'Pune outstation rides',
      car: { id: 'innova', name: 'Toyota Innova', type: 'SUV', seats: 6 },
    },
  ];

  res.status(200).json(pricing);
}
