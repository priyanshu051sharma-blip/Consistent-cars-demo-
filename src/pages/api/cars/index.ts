import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const cars = await prisma.car.findMany();
            return res.status(200).json(cars);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch cars' });
        }
    } else if (req.method === 'POST') {
        try {
            const { name, type, seats, baseDayPrice, image } = req.body;

            const car = await prisma.car.create({
                data: {
                    name,
                    type,
                    seats: parseInt(seats),
                    baseDayPrice: parseInt(baseDayPrice),
                    image: image || '/image/cars/dzire.jpg', // Default image if none
                    features: "AC, Music System, Leather Seats", // Default features
                }
            });
            return res.status(201).json(car);
        } catch (error) {
            console.error("Create Car Error", error);
            return res.status(500).json({ error: 'Failed to create car' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: 'Car ID required' });
            }
            await prisma.car.delete({
                where: { id }
            });
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error("Delete Car Error", error);
            return res.status(500).json({ error: 'Failed to delete car' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
