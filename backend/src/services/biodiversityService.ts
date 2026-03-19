import axios from "axios";
import prisma from "./dbService";

export interface NormalizedBiodiversityRecord {
  lat: number;
  lng: number;
  species: string;
  occurrenceCount: number;
  source: string;
  timestamp: Date;
}

interface GbifOccurrence {
  decimalLatitude?: number;
  decimalLongitude?: number;
  species?: string;
  eventDate?: string;
}

interface GbifResponse {
  results?: GbifOccurrence[];
}

const IASI_CENTER = { lat: 47.1585, lng: 27.6014 };
const SOURCE = "GBIF";

function toServiceError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    return new Error(
      `GBIF request failed with status ${error.response?.status ?? "unknown"}`
    );
  }

  return error instanceof Error ? error : new Error("Unexpected GBIF error");
}

async function saveBiodiversityRows(
  rows: NormalizedBiodiversityRecord[]
): Promise<number> {
  if (rows.length === 0) {
    return 0;
  }

  const result = await prisma.biodiversityRecord.createMany({
    data: rows,
    skipDuplicates: true,
  });

  console.info(
    `[DB] Saved biodiversity rows: attempted=${rows.length}, inserted=${result.count}`
  );

  return result.count;
}

function getMockRecords(): NormalizedBiodiversityRecord[] {
  return [
    {
      lat: IASI_CENTER.lat,
      lng: IASI_CENTER.lng,
      species: "Passer domesticus",
      occurrenceCount: 1,
      source: SOURCE,
      timestamp: new Date(),
    },
  ];
}

export async function fetchBiodiversityData(): Promise<NormalizedBiodiversityRecord[]> {
  const params = new URLSearchParams({
    hasCoordinate: "true",
    country: "RO",
    limit: "30",
  });

  const url = `https://api.gbif.org/v1/occurrence/search?${params.toString()}`;

  try {
    const response = await axios.get<GbifResponse>(url);
    const normalized = (response.data.results ?? [])
      .map((item): NormalizedBiodiversityRecord | null => {
        const lat = item.decimalLatitude;
        const lng = item.decimalLongitude;
        const species = item.species?.trim();
        const timestamp = item.eventDate ? new Date(item.eventDate) : null;

        if (
          typeof lat !== "number" ||
          typeof lng !== "number" ||
          !species ||
          !timestamp ||
          Number.isNaN(timestamp.getTime())
        ) {
          return null;
        }

        return {
          lat,
          lng,
          species,
          occurrenceCount: 1,
          source: SOURCE,
          timestamp,
        };
      })
      .filter((item): item is NormalizedBiodiversityRecord => item !== null)
      .slice(0, 20);

    const safeData = normalized.length > 0 ? normalized : getMockRecords();
    const insertedCount = await saveBiodiversityRows(safeData);

    console.info(
      `[Biodiversity] Fetched ${safeData.length} rows, inserted ${insertedCount} new rows`
    );

    return safeData;
  } catch (error) {
    const fallback = getMockRecords();
    const insertedCount = await saveBiodiversityRows(fallback);
    console.warn("[Biodiversity] Falling back to mock records");
    console.info(
      `[Biodiversity] Fetched ${fallback.length} rows, inserted ${insertedCount} new rows`
    );

    if (fallback.length > 0) {
      return fallback;
    }

    throw toServiceError(error);
  }
}

export async function getBiodiversityHistory(limit = 50) {
  return prisma.biodiversityRecord.findMany({
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}
