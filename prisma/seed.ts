import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...')

    // --- Clean DB ---
    await prisma.hotel.deleteMany();
    await prisma.location.deleteMany();
    await prisma.car.deleteMany();

    // --- Locations ---
    const sindhudurg = await prisma.location.create({
        data: {
            name: 'Sindhudurg',
            image: '/image/sindhudurg.jpg',
            description: 'Experience the pristine beaches and historic forts of the Konkan coast.',
            hotels: {
                create: [
                    {
                        name: 'Baywatch Resort',
                        image: '/image/baywatch/35.jpg',
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
            image: '/image/goa.jpg',
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
            image: '/image/mahabaleshwar.jpg',
            description: 'A serene hill station famous for its strawberries, waterfalls, and lush green forests.',
        },
    })

    const ratnagiri = await prisma.location.create({
        data: {
            name: 'Ratnagiri',
            image: '/image/ratnagiri.jpg',
            description: 'Famous for its Alphonso start mangoes, historic forts, and pristine coastline.',
        },
    })

    const aurangabad = await prisma.location.create({
        data: {
            name: 'Aurangabad',
            image: '/image/aurangabad.jpg',
            description: 'Tourism capital of Maharashtra, gateway to the Ajanta and Ellora Caves.',
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
                image: '/image/innova.png',
                features: 'AC,Bluetooth,Reclining Seats,Airbags',
            },
            {
                name: 'Swift Dzire',
                type: 'Sedan',
                seats: 4,
                baseDayPrice: 2000,
                image: '/image/dzire.png',
                features: 'AC,Music System,Comfortable Legroom',
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
