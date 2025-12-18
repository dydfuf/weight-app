import type {
  Exercise,
  BodyPart,
  MuscleTarget,
  Equipment,
} from "@/domain/exercises/types";

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY as string | undefined;
const RAPIDAPI_HOST =
  (import.meta.env.VITE_RAPIDAPI_HOST as string) || "exercisedb.p.rapidapi.com";
const BASE_URL = `https://${RAPIDAPI_HOST}`;

/**
 * Check if the ExerciseDB API is enabled (API key is configured)
 */
export const isApiEnabled = !!RAPIDAPI_KEY;

type ExerciseApiErrorMeta = {
  status: number;
  statusText: string;
  url: string;
  body?: unknown;
  rateLimit?: {
    requestsLimit?: string | null;
    requestsRemaining?: string | null;
    requestsReset?: string | null;
  };
};

/**
 * Common headers for ExerciseDB API requests
 */
function getHeaders(): HeadersInit {
  if (!RAPIDAPI_KEY) {
    throw new Error("ExerciseDB API key is not configured");
  }
  return {
    "x-rapidapi-key": RAPIDAPI_KEY,
    "x-rapidapi-host": RAPIDAPI_HOST,
  };
}

async function readResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }
  try {
    const text = await response.text();
    return text || undefined;
  } catch {
    return undefined;
  }
}

function buildExerciseApiError(meta: ExerciseApiErrorMeta): Error {
  const isRateLimited = meta.status === 429;
  const baseMessage = isRateLimited
    ? "ExerciseDB API rate limit exceeded. Please try again later."
    : `ExerciseDB API request failed (${meta.status} ${meta.statusText})`;

  const details = {
    ...meta,
    // Keep payload small for console logs
    body:
      typeof meta.body === "string"
        ? meta.body.slice(0, 500)
        : meta.body,
  };

  const err = new Error(baseMessage);
  (err as Error & { meta?: ExerciseApiErrorMeta }).meta = details;
  return err;
}

async function fetchJson<T>(url: string): Promise<T> {
  if (!isApiEnabled) {
    throw new Error("ExerciseDB API is not enabled");
  }

  const response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) {
    const body = await readResponseBody(response);
    throw buildExerciseApiError({
      status: response.status,
      statusText: response.statusText,
      url,
      body,
      rateLimit: {
        requestsLimit:
          response.headers.get("x-ratelimit-requests-limit") ??
          response.headers.get("X-RateLimit-Requests-Limit"),
        requestsRemaining:
          response.headers.get("x-ratelimit-requests-remaining") ??
          response.headers.get("X-RateLimit-Requests-Remaining"),
        requestsReset:
          response.headers.get("x-ratelimit-requests-reset") ??
          response.headers.get("X-RateLimit-Requests-Reset"),
      },
    });
  }
  return (await response.json()) as T;
}

/**
 * Transform API response to our Exercise type
 */
function transformExercise(data: ExerciseDBResponse): Exercise {
  return {
    id: data.id,
    name: data.name,
    bodyPart: data.bodyPart as BodyPart,
    target: data.target as MuscleTarget,
    equipment: data.equipment as Equipment,
    gifUrl: data.gifUrl,
    instructions: data.instructions,
    secondaryMuscles: data.secondaryMuscles,
  };
}

/**
 * ExerciseDB API response shape
 */
interface ExerciseDBResponse {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
  instructions: string[];
  secondaryMuscles: string[];
}

/**
 * Fetch all exercises from ExerciseDB API
 * Note: This endpoint returns a large dataset, consider using filters
 */
export async function fetchAllExercises(
  limit = 100,
  offset = 0
): Promise<Exercise[]> {
  const data = await fetchJson<ExerciseDBResponse[]>(
    `${BASE_URL}/exercises?limit=${limit}&offset=${offset}`
  );
  return data.map(transformExercise);
}

/**
 * Fetch exercises by body part
 */
export async function fetchExercisesByBodyPart(
  bodyPart: BodyPart,
  limit = 50,
  offset = 0
): Promise<Exercise[]> {
  const data = await fetchJson<ExerciseDBResponse[]>(
    `${BASE_URL}/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=${limit}&offset=${offset}`
  );
  return data.map(transformExercise);
}

/**
 * Fetch exercises by target muscle
 */
export async function fetchExercisesByTarget(
  target: MuscleTarget,
  limit = 50,
  offset = 0
): Promise<Exercise[]> {
  const data = await fetchJson<ExerciseDBResponse[]>(
    `${BASE_URL}/exercises/target/${encodeURIComponent(target)}?limit=${limit}&offset=${offset}`
  );
  return data.map(transformExercise);
}

/**
 * Fetch exercises by equipment
 */
export async function fetchExercisesByEquipment(
  equipment: Equipment,
  limit = 50,
  offset = 0
): Promise<Exercise[]> {
  const data = await fetchJson<ExerciseDBResponse[]>(
    `${BASE_URL}/exercises/equipment/${encodeURIComponent(equipment)}?limit=${limit}&offset=${offset}`
  );
  return data.map(transformExercise);
}

/**
 * Search exercises by name
 */
export async function searchExercisesByName(
  name: string,
  limit = 50,
  offset = 0
): Promise<Exercise[]> {
  const data = await fetchJson<ExerciseDBResponse[]>(
    `${BASE_URL}/exercises/name/${encodeURIComponent(name)}?limit=${limit}&offset=${offset}`
  );
  return data.map(transformExercise);
}

/**
 * Fetch single exercise by ID
 */
export async function fetchExerciseById(id: string): Promise<Exercise | null> {
  if (!isApiEnabled) throw new Error("ExerciseDB API is not enabled");

  const url = `${BASE_URL}/exercises/exercise/${id}`;
  const response = await fetch(url, { headers: getHeaders() });
  if (!response.ok) {
    if (response.status === 404) return null;
    const body = await readResponseBody(response);
    throw buildExerciseApiError({
      status: response.status,
      statusText: response.statusText,
      url,
      body,
    });
  }
  const data = (await response.json()) as ExerciseDBResponse;
  return transformExercise(data);
}

/**
 * Fetch available body parts list
 */
export async function fetchBodyPartList(): Promise<BodyPart[]> {
  return fetchJson<BodyPart[]>(`${BASE_URL}/exercises/bodyPartList`);
}

/**
 * Fetch available target muscles list
 */
export async function fetchTargetList(): Promise<MuscleTarget[]> {
  return fetchJson<MuscleTarget[]>(`${BASE_URL}/exercises/targetList`);
}

/**
 * Fetch available equipment list
 */
export async function fetchEquipmentList(): Promise<Equipment[]> {
  return fetchJson<Equipment[]>(`${BASE_URL}/exercises/equipmentList`);
}
