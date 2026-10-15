import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const createPrismaClient = () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL must be set to connect to PostgreSQL.');
    }

    const connectionUrl = new URL(databaseUrl);
    if (connectionUrl.hostname.endsWith('.supabase.co') || connectionUrl.hostname.endsWith('.pooler.supabase.com')) {
        if (connectionUrl.hostname.endsWith('.pooler.supabase.com') && connectionUrl.port === '6543') {
            connectionUrl.port = '5432';
            connectionUrl.searchParams.delete('pgbouncer');
            connectionUrl.searchParams.delete('connection_limit');
        }
        connectionUrl.searchParams.set('sslmode', 'require');
        connectionUrl.searchParams.set('uselibpqcompat', 'true');
    }

    const pool = new Pool({
        connectionString: connectionUrl.toString(),
        max: 1,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 60000,
        keepAlive: true,
    });

    return new PrismaClient({ adapter: new PrismaPg(pool) });
};

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
