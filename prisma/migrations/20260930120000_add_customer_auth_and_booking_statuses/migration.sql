ALTER TABLE "Booking"
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
END;

UPDATE "Booking"
SET "bookingReference" = CONCAT('CC-', TO_CHAR(COALESCE("createdAt", NOW()), 'YYYYMMDDHH24MISS'), '-', SUBSTRING(MD5(RANDOM()::TEXT), 1, 6))
WHERE "bookingReference" IS NULL;
