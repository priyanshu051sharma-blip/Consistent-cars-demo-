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
                hotels: [
                    {
                        name: 'Taj Hotel Goa',
                        image: '/image/hotels/goa-taj.jpg',
                        pricePerNight: 5500,
                        rating: 4.7,
                        description: 'Luxury beachfront property with world-class amenities and services.',
                        amenities: 'WiFi,Pool,Spa,Beach Access,Restaurant',
                    },
                    {
                        name: 'Marriott Goa',
                        image: '/image/hotels/goa-marriott.jpg',
                        pricePerNight: 4800,
                        rating: 4.6,
                        description: 'Contemporary design meets comfort in this premium beachside resort.',
                        amenities: 'WiFi,Pool,Gym,AC,Room Service',
                    }
                ]
            },
            {
                name: 'Mahabaleshwar',
                image: '/image/hotels/maha1.jpg',
                description: 'A serene hill station famous for its strawberries, waterfalls, and lush green forests.',
                hotels: [
                    {
                        name: 'Strawberry Hill Resort',
                        image: '/image/hotels/maha-strawberry.jpg',
                        pricePerNight: 3500,
                        rating: 4.4,
                        description: 'Charming hill resort nestled among strawberry farms with scenic views.',
                        amenities: 'WiFi,Garden,Fireplace,Hill View,Restaurant',
                    },
                    {
                        name: 'Valley View Hotel',
                        image: '/image/hotels/maha-valley.jpg',
                        pricePerNight: 3200,
                        rating: 4.3,
                        description: 'Comfortable accommodation with panoramic valley views.',
                        amenities: 'WiFi,Parking,AC,Garden,Conference Hall',
                    }
                ]
            },
            {
                name: 'Ratnagiri',
                image: '/image/ratnagiri.jpg',
                description: 'Famous for its Alphonso mangoes, historic forts, and pristine coastline.',
                hotels: [
                    {
                        name: 'Fort Heritage Hotel',
                        image: '/image/hotels/ratn-heritage.jpg',
                        pricePerNight: 3800,
                        rating: 4.5,
                        description: 'Historic property blending heritage with modern comfort near ancient forts.',
                        amenities: 'WiFi,Heritage Tour,Restaurant,Beach Access',
                    },
                    {
                        name: 'Alphonso Retreat',
                        image: '/image/hotels/ratn-alphonso.jpg',
                        pricePerNight: 3400,
                        rating: 4.2,
                        description: 'Cozy resort known for authentic local experiences and mango plantation tours.',
                        amenities: 'WiFi,Plantation Tour,Organic Meals,Garden',
                    }
                ]
            },
            {
                name: 'Aurangabad',
                image: '/image/aurangabad.jpg',
                description: 'Tourism capital of Maharashtra, gateway to the Ajanta and Ellora Caves.',
                hotels: [
                    {
                        name: 'Caves Gateway Hotel',
                        image: '/image/hotels/aur-caves.jpg',
                        pricePerNight: 4200,
                        rating: 4.6,
                        description: 'Premium hotel with organized cave tours and expert guides.',
                        amenities: 'WiFi,Cave Tours,Restaurant,Parking',
                    },
                    {
                        name: 'Ellora Palace Resort',
                        image: '/image/hotels/aur-ellora.jpg',
                        pricePerNight: 4000,
                        rating: 4.4,
                        description: 'Luxurious resort inspired by historical Ellora architecture.',
                        amenities: 'WiFi,Pool,Spa,Guide Service,AC',
                    }
                ]
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
