export type TabType = 'workout' | 'calories' | 'nutrition' | 'coach' | 'profile';

export type Gender = 'male' | 'female' | 'other';
export type FitnessGoal = 'fat_loss' | 'aggressive_cut' | 'maintain' | 'lean_bulk' | 'heavy_bulk';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
export type DietType = 'balanced' | 'high_protein' | 'keto' | 'mediterranean' | 'vegan' | 'low_carb';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  weight: number; // in kg internally
  height: number; // in cm internally
  unitSystem: 'metric' | 'imperial';
  goal: FitnessGoal;
  activityLevel: ActivityLevel;
  targetCalories: number;
  targetProtein: number; // in grams
  targetCarbs: number; // in grams
  targetFat: number; // in grams
  dailyWaterTarget: number; // in ml
  dietType: DietType;
  allergies: string[];
}

export type MuscleGroup = 
  | 'Chest' 
  | 'Back' 
  | 'Legs' 
  | 'Shoulders' 
  | 'Arms' 
  | 'Core' 
  | 'Full Body' 
  | 'Cardio';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string;
  instructions: string;
  defaultSets?: number;
  defaultReps?: string;
  metValue?: number;
}

export type SetType = 'normal' | 'warmup' | 'dropset' | 'failure';

export interface ExerciseSet {
  id: string;
  setNumber: number;
  type: SetType;
  weight: number; // in kg
  reps: number;
  rpe?: number; // 1-10
  completed: boolean;
}

export interface WorkoutExerciseLog {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  sets: ExerciseSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  title: string;
  startTime: number;
  endTime?: number;
  durationMinutes: number;
  exercises: WorkoutExerciseLog[];
  estimatedCaloriesBurned: number;
  completed: boolean;
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  durationEstimate: number; // minutes
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  exercises: {
    exerciseId: string;
    exerciseName: string;
    muscleGroup: MuscleGroup;
    targetSets: number;
    targetReps: string;
  }[];
}

export interface ActivityMet {
  id: string;
  name: string;
  category: 'Gym' | 'Cardio' | 'Sports' | 'Outdoor' | 'Daily Life';
  met: number;
  icon: string;
}

export interface LoggedActivity {
  id: string;
  activityName: string;
  category: string;
  durationMinutes: number;
  met: number;
  caloriesBurned: number;
  timestamp: number;
}

export interface MealItem {
  id: string;
  name: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime?: string;
  description?: string;
  ingredients: string[];
  instructions?: string[];
  loggedAsEaten?: boolean;
}

export interface CustomAIAgent {
  id: string;
  name: string;
  title: string;
  avatar: string;
  badge: string;
  color: string;
  personality: string;
  philosophy: string;
  tone: 'scientific' | 'motivational' | 'holistic' | 'culinary' | 'custom';
  isCustom?: boolean;
}

export interface ChatActionProposal {
  type: 'workout_adjustment' | 'nutrition_adjustment';
  title: string;
  details: string;
  data: any;
  applied?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  agentName?: string;
  content: string;
  timestamp: number;
  actionProposal?: ChatActionProposal;
}
