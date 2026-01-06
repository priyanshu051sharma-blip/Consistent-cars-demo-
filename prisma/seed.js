require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Ensure absolute path for Windows compatibility if env var is not set correctly
const dbPath = path.resolve('dev.db');
const dbUrl = `file:${dbPath.replace(/\\/g, '/')}`;

if (!process.env.DATABASE_URL) {
    console.log("Setting DATABASE_URL to:", dbUrl);
    process.env.DATABASE_URL = dbUrl;
}

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    try {
        // --- Locations ---
        const locationsData = [
            {
                name: 'Sindhudurg',
                image: '/image/hotels/sindhu1.jpg',
                description: 'Experience the pristine beaches and historic forts of the Konkan coast.',
                hotels: [
                    {
                        name: 'Baywatch Resort',
                        image: '/image/baywatch/35.jpg',
                        pricePerNight: 4500,
                        rating: 4.5,
                        description: 'Luxury beachfront resort with stunning ocean views and premium amenities.',
                        amenities: 'WiFi,Pool,Spa,Beach Access',
                    }
                ]
            },
            {
                name: 'Goa',
                image: '/image/goa.jpg',
                description: 'The party capital of India, known for its nightlife, beaches, and Portuguese heritage.',
                hotels: []
            },
            {
                name: 'Mahabaleshwar',
                image: '/image/hotels/maha1.jpg',
                description: 'A serene hill station famous for its strawberries, waterfalls, and lush green forests.',
                hotels: []
            },
            {
                name: 'Ganpatipule',
                image: '/image/ratnagiri.jpg',
                description: 'Famous for its 400-year-old Ganesha temple and pristine white sand beaches.',
                hotels: []
            },
            {
                name: 'Lonavala',
                image: '/image/lonavala.jpg',
                description: 'A popular hill station known for its candy (chikki) and stunning monsoon views.',
                hotels: []
            }
        ];

        for (const loc of locationsData) {
            await prisma.location.create({
                data: {
                    name: loc.name,
                    image: loc.image,
                    description: loc.description,
                    hotels: {
                        create: loc.hotels
                    }
                }
            });
            console.log(`Seeded ${loc.name}`);
        }


        // --- Cars ---
        const carsData = [
            {
                name: 'Swift Dzire',
                type: 'Sedan',
                seats: 4,
                baseDayPrice: 3750,
                image: '/image/dzire.png',
                features: 'AC,Music System,Bluetooth',
            },
            {
                name: 'Toyota Innova',
                type: 'SUV',
                seats: 7,
                baseDayPrice: 5500,
                image: '/image/innova.png',
                features: 'AC,Captain Seats,Touchscreen',
            }
        ];

        for (const car of carsData) {
            await prisma.car.create({ data: car });
        }
        console.log('Seeded Cars (Dzire & Innova)');

        console.log('Seeding finished.');
    } catch (err) {
        console.error("Seeding Error:", err);
        throw err;
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
