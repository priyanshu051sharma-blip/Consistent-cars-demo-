CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key"
    ON "User"("email");

ALTER TABLE "Booking"
    ADD COLUMN "customerId" TEXT,
    ADD COLUMN "depositAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN "totalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN "remainingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    ADD COLUMN "bookingReference" TEXT,
    ADD COLUMN "invoiceNumber" TEXT,
    ADD COLUMN "invoiceIssuedAt" TIMESTAMP(3),
    ADD COLUMN "updatedAt" TIMESTAMP(3);

UPDATE "Booking"
SET "status" = 'PENDING'
WHERE "status" IS NULL OR "status" = '' OR "status" = 'Paid' OR "status" = 'PAID';

UPDATE "Booking"
SET "updatedAt" = COALESCE("updatedAt", "createdAt")
WHERE "updatedAt" IS NULL;

ALTER TABLE "Booking"
    ALTER COLUMN "updatedAt" SET NOT NULL,
    ALTER COLUMN "status" SET DEFAULT 'PENDING';

UPDATE "Booking"
SET "paymentStatus" = CASE
    WHEN "amount" > 0 THEN 'PAID'
    ELSE 'UNPAID'
END
WHERE "paymentStatus" IS NULL OR "paymentStatus" = '';

ALTER TABLE "Booking"
    ADD CONSTRAINT "Booking_customerId_fkey"
    FOREIGN KEY ("customerId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "Booking"
SET "bookingReference" = CONCAT('CC-', TO_CHAR(COALESCE("createdAt", NOW()), 'YYYYMMDDHH24MISS'), '-', SUBSTRING(MD5(RANDOM()::TEXT), 1, 6))
WHERE "bookingReference" IS NULL;

ALTER TABLE "Booking"
    ALTER COLUMN "bookingReference" SET NOT NULL;

CREATE UNIQUE INDEX "Booking_bookingReference_key"
    ON "Booking"("bookingReference");

CREATE UNIQUE INDEX "Booking_invoiceNumber_key"
    ON "Booking"("invoiceNumber")
    WHERE "invoiceNumber" IS NOT NULL;
