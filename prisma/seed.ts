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
            }
        },
    })

    const mahabaleshwar = await prisma.location.create({
        data: {
            name: 'Mahabaleshwar',
            image: '/image/mahabaleshwar.jpg',
            description: 'A serene hill station famous for its strawberries, waterfalls, and lush green forests.',
            hotels: {
                create: [
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
            }
        },
    })

    const ratnagiri = await prisma.location.create({
        data: {
            name: 'Ratnagiri',
            image: '/image/ratnagiri.jpg',
            description: 'Famous for its Alphonso start mangoes, historic forts, and pristine coastline.',
            hotels: {
                create: [
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
            }
        },
    })

    const aurangabad = await prisma.location.create({
        data: {
            name: 'Aurangabad',
            image: '/image/aurangabad.jpg',
            description: 'Tourism capital of Maharashtra, gateway to the Ajanta and Ellora Caves.',
            hotels: {
                create: [
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
                image: '/image/crysta-white.jpg',
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
