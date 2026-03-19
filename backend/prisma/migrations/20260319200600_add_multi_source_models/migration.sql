-- CreateTable
CREATE TABLE "WeatherData" (
    "id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "apparentTemperature" DOUBLE PRECISION NOT NULL,
    "windSpeed" DOUBLE PRECISION NOT NULL,
    "weatherCode" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiodiversityRecord" (
    "id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "species" TEXT NOT NULL,
    "occurrenceCount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BiodiversityRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeatherData_timestamp_idx" ON "WeatherData"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "WeatherData_lat_lng_timestamp_key" ON "WeatherData"("lat", "lng", "timestamp");

-- CreateIndex
CREATE INDEX "BiodiversityRecord_timestamp_idx" ON "BiodiversityRecord"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "BiodiversityRecord_lat_lng_species_timestamp_key" ON "BiodiversityRecord"("lat", "lng", "species", "timestamp");
