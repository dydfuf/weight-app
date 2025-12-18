/**
 * Body part categories for exercises
 */
export type BodyPart =
  | "back"
  | "cardio"
  | "chest"
  | "lower arms"
  | "lower legs"
  | "neck"
  | "shoulders"
  | "upper arms"
  | "upper legs"
  | "waist";

/**
 * Target muscle groups
 */
export type MuscleTarget =
  | "abductors"
  | "abs"
  | "adductors"
  | "biceps"
  | "calves"
  | "cardiovascular system"
  | "delts"
  | "forearms"
  | "glutes"
  | "hamstrings"
  | "lats"
  | "levator scapulae"
  | "pectorals"
  | "quads"
  | "serratus anterior"
  | "spine"
  | "traps"
  | "triceps"
  | "upper back";

/**
 * Equipment types
 */
export type Equipment =
  | "assisted"
  | "band"
  | "barbell"
  | "body weight"
  | "bosu ball"
  | "cable"
  | "dumbbell"
  | "elliptical machine"
  | "ez barbell"
  | "hammer"
  | "kettlebell"
  | "leverage machine"
  | "medicine ball"
  | "olympic barbell"
  | "resistance band"
  | "roller"
  | "rope"
  | "skierg machine"
  | "sled machine"
  | "smith machine"
  | "stability ball"
  | "stationary bike"
  | "stepmill machine"
  | "tire"
  | "trap bar"
  | "upper body ergometer"
  | "weighted"
  | "wheel roller";

/**
 * Exercise data from ExerciseDB API or local cache
 */
export interface Exercise {
  id: string;
  name: string;
  bodyPart: BodyPart;
  target: MuscleTarget;
  equipment: Equipment;
  gifUrl?: string;
  instructions?: string[];
  secondaryMuscles?: string[];
}

/**
 * User's favorite exercise
 */
export interface FavoriteExercise {
  exerciseId: string;
  exerciseName: string;
  createdAt: number;
}

/**
 * Exercise usage record for "recent exercises" feature
 */
export interface ExerciseUsageRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  usedAt: number;
}

/**
 * Filter options for exercise search
 */
export interface ExerciseFilters {
  search?: string;
  bodyPart?: BodyPart;
  target?: MuscleTarget;
  equipment?: Equipment;
}

/**
 * Input type for adding favorite exercise
 */
export type FavoriteExerciseInput = Omit<FavoriteExercise, "createdAt">;

/**
 * Input type for recording exercise usage
 */
export type ExerciseUsageInput = Omit<ExerciseUsageRecord, "id" | "usedAt">;
