import { ActivityLevel, FitnessGoal, Gender, UserProfile, WorkoutSession } from '../types';

/**
 * Calculates Calorie Expenditure using the standardized ACSM / Compendium MET formula:
 * Calories = Duration (minutes) * (MET * 3.5 * Weight in kg) / 200
 */
export function calculateMetCalories(met: number, durationMinutes: number, weightKg: number): number {
  if (met <= 0 || durationMinutes <= 0 || weightKg <= 0) return 0;
  const calories = (durationMinutes * met * 3.5 * weightKg) / 200;
  return Math.round(calories);
}

/**
 * Mifflin-St Jeor Basal Metabolic Rate (BMR)
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
  if (gender === 'female') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
  // male / default
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
}

/**
 * Total Daily Energy Expenditure (TDEE) based on activity multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2, // Little to no exercise
    light: 1.375, // 1-3 days per week
    moderate: 1.55, // 3-5 days per week
    very_active: 1.725, // 6-7 days hard training
    extra_active: 1.9, // 2x per day, heavy labor
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.4));
}

/**
 * Target calories based on goal adjustment
 */
export function calculateTargetCalories(tdee: number, goal: FitnessGoal): number {
  switch (goal) {
    case 'aggressive_cut':
      return Math.round(tdee - 650);
    case 'fat_loss':
      return Math.round(tdee - 450);
    case 'maintain':
      return Math.round(tdee);
    case 'lean_bulk':
      return Math.round(tdee + 250);
    case 'heavy_bulk':
      return Math.round(tdee + 500);
    default:
      return Math.round(tdee);
  }
}

/**
 * Macro split recommendations based on total calories and fitness goal
 */
export function calculateMacros(calories: number, weightKg: number, goal: FitnessGoal): { protein: number; carbs: number; fat: number } {
  // Protein: typically 2.0 - 2.4g per kg for muscle retention/growth
  let proteinPerKg = 2.0;
  if (goal === 'fat_loss' || goal === 'aggressive_cut') proteinPerKg = 2.2;
  if (goal === 'lean_bulk') proteinPerKg = 2.1;

  const protein = Math.round(Math.min(weightKg * proteinPerKg, calories * 0.35 / 4));
  const proteinKcal = protein * 4;

  // Fat: 25-30% of total calories (9 kcal/g)
  let fatPct = 0.25;
  if (goal === 'maintain' || goal === 'lean_bulk') fatPct = 0.28;
  const fat = Math.round((calories * fatPct) / 9);
  const fatKcal = fat * 9;

  // Remaining calories to carbs (4 kcal/g)
  const remainingKcal = Math.max(0, calories - proteinKcal - fatKcal);
  const carbs = Math.round(remainingKcal / 4);

  return { protein, carbs, fat };
}

/**
 * Total lifted volume (kg) across all completed sets
 */
export function calculateWorkoutVolume(session: WorkoutSession): number {
  let volume = 0;
  session.exercises.forEach((ex) => {
    ex.sets.forEach((set) => {
      if (set.completed && set.weight > 0 && set.reps > 0) {
        volume += set.weight * set.reps;
      }
    });
  });
  return Math.round(volume);
}

/**
 * Estimated calorie burn for weight training based on active duration and average intensity MET 5.5-6.0
 */
export function estimateWorkoutCalories(durationMinutes: number, weightKg: number, intensityMet = 5.5): number {
  return calculateMetCalories(intensityMet, durationMinutes, weightKg);
}

/**
 * Max Heart Rate & Heart Rate Training Zones
 */
export function calculateHeartRateZones(age: number): {
  maxHR: number;
  zone1Recovery: [number, number]; // 50-60%
  zone2AerobicFatBurn: [number, number]; // 60-70%
  zone3Tempo: [number, number]; // 70-80%
  zone4Threshold: [number, number]; // 80-90%
  zone5Anaerobic: [number, number]; // 90-100%
} {
  const maxHR = 220 - age;
  return {
    maxHR,
    zone1Recovery: [Math.round(maxHR * 0.5), Math.round(maxHR * 0.6)],
    zone2AerobicFatBurn: [Math.round(maxHR * 0.6), Math.round(maxHR * 0.7)],
    zone3Tempo: [Math.round(maxHR * 0.7), Math.round(maxHR * 0.8)],
    zone4Threshold: [Math.round(maxHR * 0.8), Math.round(maxHR * 0.9)],
    zone5Anaerobic: [Math.round(maxHR * 0.9), maxHR],
  };
}

/**
 * Format weights based on unit system
 */
export function formatWeight(weightKg: number, unitSystem: 'metric' | 'imperial'): string {
  if (unitSystem === 'imperial') {
    const lbs = Math.round(weightKg * 2.20462);
    return `${lbs} lbs`;
  }
  return `${weightKg} kg`;
}

/**
 * Format heights
 */
export function formatHeight(heightCm: number, unitSystem: 'metric' | 'imperial'): string {
  if (unitSystem === 'imperial') {
    const totalInches = heightCm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  }
  return `${heightCm} cm`;
}
