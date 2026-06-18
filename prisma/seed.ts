import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...')

    // --- Clean DB ---
    await prisma.booking.deleteMany();
    await prisma.pricing.deleteMany();
    await prisma.hotel.deleteMany();
    await prisma.location.deleteMany();
    await prisma.car.deleteMany();

    // --- Locations ---
    // Delhi Locations
    const delhi = await prisma.location.create({
        data: {
            name: 'Delhi',
            image: '/image/delhi.jpg',
            description: 'India\'s capital city - serving Delhi Airport, City Center, Gurgaon, and Noida.',
        },
    })

    // Pune Locations
    const pune = await prisma.location.create({
        data: {
            name: 'Pune',
            image: '/image/pune.jpg',
            description: 'City of learning and innovation - serving Pune Airport, City Center, and surrounding areas.',
        },
    })

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
    const sedan = await prisma.car.create({
        data: {
            name: 'Swift Dzire',
            type: 'Sedan',
            seats: 4,
            baseDayPrice: 2000,
            image: '/image/dzire.png',
            features: 'AC,Music System,Comfortable Legroom',
        },
    })

    const innova = await prisma.car.create({
        data: {
            name: 'Toyota Innova Crysta',
            type: 'SUV',
            seats: 7,
            baseDayPrice: 3500,
            image: '/image/crysta-white.jpg',
            features: 'AC,Bluetooth,Reclining Seats,Airbags',
        },
    })

    // --- Pricing for Delhi ---
    // Sedan - Delhi Local (8 Hrs 80 Km)
    await prisma.pricing.create({
        data: {
            carId: sedan.id,
            location: 'Delhi Local',
            pricePerKm: 16,
            basePrice: 1600,
            baseKm: 80,
            extraHourRate: 150,
            driverAllowance: 300,
            description: '8 Hrs 80 Km',
        },
    })

    // Sedan - Delhi Outstation (250 Km)
    await prisma.pricing.create({
        data: {
            carId: sedan.id,
            location: 'Delhi Outstation',
            pricePerKm: 15,
            basePrice: 3750,
            baseKm: 250,
            extraHourRate: 150,
            driverAllowance: 300,
            description: '250 Km Outstation',
        },
    })

    // Innova Crysta - Delhi Local (8 Hrs 80 Km)
    await prisma.pricing.create({
        data: {
            carId: innova.id,
            location: 'Delhi Local',
            pricePerKm: 22,
            basePrice: 3000,
            baseKm: 80,
            extraHourRate: 300,
            driverAllowance: 300,
            description: '8 Hrs 80 Km',
        },
    })

    // Innova Crysta - Delhi Outstation (250 Km)
    await prisma.pricing.create({
        data: {
            carId: innova.id,
            location: 'Delhi Outstation',
            pricePerKm: 22,
            basePrice: 5500,
            baseKm: 250,
            extraHourRate: 300,
            driverAllowance: 300,
            description: '250 Km Outstation',
        },
    })

    // --- Pricing for Pune ---
    // Sedan - Pune Local (8 Hrs 80 Km)
    await prisma.pricing.create({
        data: {
            carId: sedan.id,
            location: 'Pune Local',
            pricePerKm: 16,
            basePrice: 1800,
            baseKm: 80,
            extraHourRate: 150,
            driverAllowance: 300,
            description: '8 Hrs 80 Km',
        },
    })

    // Sedan - Pune Outstation (300 Km minimum)
    await prisma.pricing.create({
        data: {
            carId: sedan.id,
            location: 'Pune Outstation',
            pricePerKm: 16,
            basePrice: 5100,
            baseKm: 300,
            extraHourRate: 150,
            driverAllowance: 300,
            description: '300 Km Outstation (Minimum)',
        },
    })

    // Sedan - Mumbai Airport Drop from Pune
    await prisma.pricing.create({
        data: {
            carId: sedan.id,
            location: 'Mumbai Airport Drop',
            pricePerKm: 16,
            basePrice: 4500,
            baseKm: 160,
            extraHourRate: 150,
            driverAllowance: 300,
            description: 'Mumbai Airport Drop (4 Hrs 160 Km)',
        },
    })

    // Sedan - Pune Airport Drop/Pick (4 Hrs 40 Km)
    await prisma.pricing.create({
        data: {
            carId: sedan.id,
            location: 'Pune Airport Drop/Pick',
            pricePerKm: 16,
            basePrice: 1100,
            baseKm: 40,
            extraHourRate: 150,
            driverAllowance: 250,
            description: '4 Hrs 40 Km',
        },
    })

    // Innova Crysta - Pune Local (8 Hrs 80 Km)
    await prisma.pricing.create({
        data: {
            carId: innova.id,
            location: 'Pune Local',
            pricePerKm: 24,
            basePrice: 3800,
            baseKm: 80,
            extraHourRate: 250,
            driverAllowance: 350,
            description: '8 Hrs 80 Km',
        },
    })

    // Innova Crysta - Pune Outstation (300 Km minimum)
    await prisma.pricing.create({
        data: {
            carId: innova.id,
            location: 'Pune Outstation',
            pricePerKm: 24,
            basePrice: 7200,
            baseKm: 300,
            extraHourRate: 250,
            driverAllowance: 350,
            description: '300 Km Outstation (Minimum)',
        },
    })

    // Innova Crysta - Mumbai Airport Drop from Pune
    await prisma.pricing.create({
        data: {
            carId: innova.id,
            location: 'Mumbai Airport Drop',
            pricePerKm: 24,
            basePrice: 5500,
            baseKm: 160,
            extraHourRate: 250,
            driverAllowance: 350,
            description: 'Mumbai Airport Drop (4 Hrs 160 Km)',
        },
    })

    // Innova Crysta - Pune Airport Drop/Pick (4 Hrs 40 Km)
    await prisma.pricing.create({
        data: {
            carId: innova.id,
            location: 'Pune Airport Drop/Pick',
            pricePerKm: 24,
            basePrice: 2200,
            baseKm: 40,
            extraHourRate: 250,
            driverAllowance: 300,
            description: '4 Hrs 40 Km',
        },
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
