-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Measurement" (
    "id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "level" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Measurement_timestamp_idx" ON "Measurement"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Measurement_lat_lng_type_timestamp_key" ON "Measurement"("lat", "lng", "type", "timestamp");

