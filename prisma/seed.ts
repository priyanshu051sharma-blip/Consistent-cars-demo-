import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'
import path from 'path';

const dbPath = path.resolve('dev.db');
console.log("Seeding using database file:", dbPath);

const sqlite = new Database(dbPath);
const adapter = new PrismaBetterSqlite(sqlite);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Start seeding ...')

    // --- Locations ---
    const sindhudurg = await prisma.location.create({
        data: {
            name: 'Sindhudurg',
            image: 'https://images.unsplash.com/photo-1588636402830-798c86d87e35?q=80&w=1953&auto=format&fit=crop',
            description: 'Experience the pristine beaches and historic forts of the Konkan coast.',
            hotels: {
                create: [
                    {
                        name: 'Baywatch Resort',
                        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2525&auto=format&fit=crop',
                        pricePerNight: 4500,
                        rating: 4.5,
                        description: 'Luxury beachfront resort with stunning ocean views and premium amenities.',
                        amenities: 'WiFi,Pool,Spa,Beach Access',
                    },
                ],
            },
        },
    })

    const goa = await prisma.location.create({
        data: {
            name: 'Goa',
            image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2574&auto=format&fit=crop',
            description: 'The party capital of India, known for its nightlife, beaches, and Portuguese heritage.',
            hotels: {
                create: [
                    // Add dummy hotels for Goa if needed, or leave empty for now
                ]
            }
        },
    })

    const mahabaleshwar = await prisma.location.create({
        data: {
            name: 'Mahabaleshwar',
            image: 'https://images.unsplash.com/photo-1625902092288-294c6655c65d?q=80&w=2574&auto=format&fit=crop',
            description: 'A serene hill station famous for its strawberries, waterfalls, and lush green forests.',
        },
    })


    // --- Cars ---
    await prisma.car.createMany({
        data: [
            {
                name: 'Toyota Innova Crysta',
                type: 'SUV',
                seats: 7,
                baseDayPrice: 3500,
                image: 'https://imgd.aeplcdn.com/1280x720/n/cw/ec/140809/innova-crysta-exterior-right-front-three-quarter-3.jpeg?isig=0',
                features: 'AC,Bluetooth,Reclining Seats,Airbags',
            },
            {
                name: 'Swift Dzire',
                type: 'Sedan',
                seats: 4,
                baseDayPrice: 2000,
                image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/159265/swift-exterior-left-front-three-quarter.jpeg?isig=0&q=80',
                features: 'AC,Music System,Comfortable Legroom',
            },
            {
                name: 'Toyota Etios',
                type: 'Sedan',
                seats: 4,
                baseDayPrice: 2200,
                image: 'https://imgd.aeplcdn.com/1056x594/n/086lrua_1469601.jpg?q=80',
                features: 'AC,Spacious Boot,Safety Features',
            },
            {
                name: 'Chevrolet Tavera',
                type: 'SUV',
                seats: 9,
                baseDayPrice: 3200,
                image: 'https://imgd.aeplcdn.com/1280x720/cw/ec/22370/Chevrolet-Tavera-Exterior-119156.jpg?wm=0&q=80',
                features: 'AC,High Capacity,Rugged',
            }
        ],
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
