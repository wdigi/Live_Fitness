import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  Exercise,
  WorkoutTemplate,
  WorkoutSession,
  WorkoutExerciseLog,
  ExerciseSet,
  LoggedActivity,
  MealItem,
  CustomAIAgent,
  ChatMessage,
  ChatActionProposal,
  TabType,
  MuscleGroup,
} from '../types';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_EXERCISES,
  DEFAULT_WORKOUT_TEMPLATES,
  DEFAULT_MEALS,
  PRESET_AI_AGENTS,
  MET_ACTIVITIES_LIST,
} from '../data/defaultData';
import {
  calculateMetCalories,
  calculateWorkoutVolume,
  estimateWorkoutCalories,
} from '../utils/fitnessCalculations';
import { playCountdownBeep, playSuccessChime } from '../utils/audio';

interface FitnessContextType {
  // Navigation & View
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;

  // User Profile
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Exercises & Templates
  exercises: Exercise[];
  addCustomExercise: (ex: Omit<Exercise, 'id'>) => void;
  templates: WorkoutTemplate[];
  createCustomTemplate: (template: Omit<WorkoutTemplate, 'id'>) => void;

  // Active Workout Session
  activeWorkout: WorkoutSession | null;
  startWorkout: (templateId?: string, customTitle?: string) => void;
  cancelWorkout: () => void;
  finishWorkout: () => void;
  addExerciseToActiveWorkout: (exerciseId: string) => void;
  removeExerciseFromActiveWorkout: (exerciseIndex: number) => void;
  addSetToExercise: (exerciseIndex: number) => void;
  removeSetFromExercise: (exerciseIndex: number, setIndex: number) => void;
  updateSet: (exerciseIndex: number, setIndex: number, field: keyof ExerciseSet, value: any) => void;
  activeWorkoutDuration: number;

  // Rest Timer
  restTimerSeconds: number;
  isRestTimerActive: boolean;
  startRestTimer: (seconds?: number) => void;
  stopRestTimer: () => void;
  addRestTimerSeconds: (seconds: number) => void;

  // History & Activity Calories
  workoutHistory: WorkoutSession[];
  loggedActivities: LoggedActivity[];
  logCustomActivity: (name: string, category: string, durationMinutes: number, met: number) => void;
  removeLoggedActivity: (id: string) => void;

  // Nutrition & Meals
  mealPlan: MealItem[];
  toggleMealEaten: (mealId: string) => void;
  addCustomMeal: (meal: Omit<MealItem, 'id'>) => void;
  setFullMealPlan: (meals: MealItem[]) => void;
  removeMeal: (mealId: string) => void;
  waterIntakeMl: number;
  addWater: (amountMl: number) => void;
  resetWater: () => void;

  // AI Agent & Chat
  aiAgents: CustomAIAgent[];
  activeAgent: CustomAIAgent;
  setActiveAgentId: (id: string) => void;
  createCustomAgent: (agent: Omit<CustomAIAgent, 'id' | 'isCustom'>) => void;
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  sendMessageToCoach: (text: string) => Promise<void>;
  applyActionProposal: (messageId: string, proposal: ChatActionProposal) => void;
  clearChatHistory: () => void;

  // Aggregated Daily Metrics
  todayBurnedCalories: number;
  todayConsumedCalories: number;
  todayConsumedProtein: number;
  todayConsumedCarbs: number;
  todayConsumedFat: number;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'pulsefit_profile_v1',
  HISTORY: 'pulsefit_history_v1',
  ACTIVITIES: 'pulsefit_activities_v1',
  MEAL_PLAN: 'pulsefit_mealplan_v1',
  WATER: 'pulsefit_water_v1',
  AGENTS: 'pulsefit_agents_v1',
  ACTIVE_AGENT_ID: 'pulsefit_active_agent_id_v1',
  CHAT_MESSAGES: 'pulsefit_chat_messages_v1',
  CUSTOM_EXERCISES: 'pulsefit_custom_exercises_v1',
};

export const FitnessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('workout');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 768;
    }
    return false;
  });

  // User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  // Exercises
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
      return saved ? [...DEFAULT_EXERCISES, ...JSON.parse(saved)] : DEFAULT_EXERCISES;
    } catch {
      return DEFAULT_EXERCISES;
    }
  });

  const [templates, setTemplates] = useState<WorkoutTemplate[]>(DEFAULT_WORKOUT_TEMPLATES);

  // Active Workout Session
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [activeWorkoutDuration, setActiveWorkoutDuration] = useState<number>(0);

  // Rest Timer
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(false);

  // History & Activity Logs
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loggedActivities, setLoggedActivities] = useState<LoggedActivity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Nutrition
  const [mealPlan, setMealPlan] = useState<MealItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEAL_PLAN);
      return saved ? JSON.parse(saved) : DEFAULT_MEALS;
    } catch {
      return DEFAULT_MEALS;
    }
  });

  const [waterIntakeMl, setWaterIntakeMl] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATER);
      return saved ? JSON.parse(saved) : 1750;
    } catch {
      return 1750;
    }
  });

  // AI Agents
  const [aiAgents, setAiAgents] = useState<CustomAIAgent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AGENTS);
      return saved ? JSON.parse(saved) : PRESET_AI_AGENTS;
    } catch {
      return PRESET_AI_AGENTS;
    }
  });

  const [activeAgentId, setActiveAgentIdState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_AGENT_ID) || PRESET_AI_AGENTS[0].id;
    } catch {
      return PRESET_AI_AGENTS[0].id;
    }
  });

  const activeAgent = aiAgents.find((a) => a.id === activeAgentId) || aiAgents[0] || PRESET_AI_AGENTS[0];

  // Chat Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const updatedWelcomeContent = `Welcome to PulseFit! I'm Dr. Marcus Vance, your Exercise Science and Hypertrophy Coach. I have trained this Live Chat to be my assistant. Should you need any one to one session with me personally, please mention that to my assistant. I have direct access to your real-time workout logs, target macros (165g P / 270g C / 75g F), and burned calories.\n\nWhether you need an immediate exercise adjustment for sore joints, volume analysis, or a fast post-workout high-protein meal recommendation, I am on standby. How are you feeling today?`;

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m: any) =>
            m.id === 'welcome-msg'
              ? {
                  ...m,
                  content: updatedWelcomeContent,
                }
              : m
          );
        }
      }
    } catch {}

    return [
      {
        id: 'welcome-msg',
        sender: 'agent',
        agentName: 'Dr. Marcus Vance',
        content: updatedWelcomeContent,
        timestamp: Date.now() - 3600000,
      },
    ];
  });

  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {}
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(workoutHistory));
    } catch {}
  }, [workoutHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(loggedActivities));
    } catch {}
  }, [loggedActivities]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEAL_PLAN, JSON.stringify(mealPlan));
    } catch {}
  }, [mealPlan]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(waterIntakeMl));
    } catch {}
  }, [waterIntakeMl]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(aiAgents));
    } catch {}
  }, [aiAgents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_AGENT_ID, activeAgentId);
    } catch {}
  }, [activeAgentId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(chatMessages));
    } catch {}
  }, [chatMessages]);

  // Active workout session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeWorkout) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - activeWorkout.startTime) / 1000);
        setActiveWorkoutDuration(elapsed);
      }, 1000);
    } else {
      setActiveWorkoutDuration(0);
    }
    return () => clearInterval(interval);
  }, [activeWorkout]);

  // Rest Timer countdown with audio cues
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRestTimerActive && restTimerSeconds > 0) {
      interval = setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev <= 4 && prev > 1) {
            playCountdownBeep(false);
          } else if (prev === 1) {
            playCountdownBeep(true);
            setIsRestTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (restTimerSeconds === 0) {
      setIsRestTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isRestTimerActive, restTimerSeconds]);

  // Profile actions
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  // Workout Actions
  const startWorkout = (templateId?: string, customTitle?: string) => {
    const template = templates.find((t) => t.id === templateId);
    let exercisesLog: WorkoutExerciseLog[] = [];

    if (template) {
      exercisesLog = template.exercises.map((tEx) => ({
        exerciseId: tEx.exerciseId,
        exerciseName: tEx.exerciseName,
        muscleGroup: tEx.muscleGroup,
        sets: Array.from({ length: tEx.targetSets }, (_, i) => ({
          id: `set-${Date.now()}-${i}`,
          setNumber: i + 1,
          type: 'normal' as const,
          weight: 60,
          reps: 10,
          rpe: 8,
          completed: false,
        })),
      }));
    } else {
      // Default to first compound exercise if blank
      const defaultEx = exercises[0];
      exercisesLog = [
        {
          exerciseId: defaultEx.id,
          exerciseName: defaultEx.name,
          muscleGroup: defaultEx.muscleGroup,
          sets: [
            {
              id: `set-${Date.now()}-1`,
              setNumber: 1,
              type: 'normal',
              weight: 60,
              reps: 10,
              rpe: 8,
              completed: false,
            },
          ],
        },
      ];
    }

    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      title: customTitle || template?.title || 'Open Workout Session',
      startTime: Date.now(),
      durationMinutes: 0,
      exercises: exercisesLog,
      estimatedCaloriesBurned: 0,
      completed: false,
    };

    setActiveWorkout(newSession);
    setActiveWorkoutDuration(0);
  };

  const cancelWorkout = () => {
    setActiveWorkout(null);
    setActiveWorkoutDuration(0);
    setIsRestTimerActive(false);
  };

  const finishWorkout = () => {
    if (!activeWorkout) return;

    const durationMin = Math.max(1, Math.round(activeWorkoutDuration / 60));
    const calories = estimateWorkoutCalories(durationMin, profile.weight, 6.0);
    const completedSession: WorkoutSession = {
      ...activeWorkout,
      endTime: Date.now(),
      durationMinutes: durationMin,
      estimatedCaloriesBurned: calories,
      completed: true,
    };

    setWorkoutHistory((prev) => [completedSession, ...prev]);
    setActiveWorkout(null);
    setActiveWorkoutDuration(0);
    setIsRestTimerActive(false);
    playSuccessChime();

    // Trigger celebration confetti if available
    if (typeof window !== 'undefined') {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      }).catch(() => {});
    }
  };

  const addExerciseToActiveWorkout = (exerciseId: string) => {
    if (!activeWorkout) return;
    const exData = exercises.find((e) => e.id === exerciseId);
    if (!exData) return;

    const newExerciseLog: WorkoutExerciseLog = {
      exerciseId: exData.id,
      exerciseName: exData.name,
      muscleGroup: exData.muscleGroup,
      sets: [
        {
          id: `set-${Date.now()}-1`,
          setNumber: 1,
          type: 'normal',
          weight: 50,
          reps: 10,
          rpe: 8,
          completed: false,
        },
      ],
    };

    setActiveWorkout((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: [...prev.exercises, newExerciseLog],
      };
    });
  };

  const removeExerciseFromActiveWorkout = (exerciseIndex: number) => {
    if (!activeWorkout) return;
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const updated = [...prev.exercises];
      updated.splice(exerciseIndex, 1);
      return { ...prev, exercises: updated };
    });
  };

  const addSetToExercise = (exerciseIndex: number) => {
    if (!activeWorkout) return;
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const updated = [...prev.exercises];
      const target = updated[exerciseIndex];
      const lastSet = target.sets[target.sets.length - 1];

      const newSet: ExerciseSet = {
        id: `set-${Date.now()}-${target.sets.length + 1}`,
        setNumber: target.sets.length + 1,
        type: lastSet ? lastSet.type : 'normal',
        weight: lastSet ? lastSet.weight : 50,
        reps: lastSet ? lastSet.reps : 10,
        rpe: lastSet ? lastSet.rpe : 8,
        completed: false,
      };

      target.sets = [...target.sets, newSet];
      return { ...prev, exercises: updated };
    });
  };

  const removeSetFromExercise = (exerciseIndex: number, setIndex: number) => {
    if (!activeWorkout) return;
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const updated = [...prev.exercises];
      const target = updated[exerciseIndex];
      target.sets.splice(setIndex, 1);
      // Renumber
      target.sets.forEach((s, idx) => {
        s.setNumber = idx + 1;
      });
      return { ...prev, exercises: updated };
    });
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof ExerciseSet, value: any) => {
    if (!activeWorkout) return;
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const updated = [...prev.exercises];
      const currentSet = { ...updated[exerciseIndex].sets[setIndex], [field]: value };
      updated[exerciseIndex].sets[setIndex] = currentSet;

      // Auto start rest timer if user marked set as completed
      if (field === 'completed' && value === true) {
        startRestTimer(90);
      }

      return { ...prev, exercises: updated };
    });
  };

  // Rest Timer controls
  const startRestTimer = (seconds = 90) => {
    setRestTimerSeconds(seconds);
    setIsRestTimerActive(true);
  };

  const stopRestTimer = () => {
    setIsRestTimerActive(false);
    setRestTimerSeconds(0);
  };

  const addRestTimerSeconds = (seconds: number) => {
    setRestTimerSeconds((prev) => Math.max(0, prev + seconds));
    if (!isRestTimerActive && seconds > 0) {
      setIsRestTimerActive(true);
    }
  };

  // Custom Exercise & Template Creation
  const addCustomExercise = (ex: Omit<Exercise, 'id'>) => {
    const newEx: Exercise = {
      ...ex,
      id: `custom-ex-${Date.now()}`,
    };
    const updated = [...exercises, newEx];
    setExercises(updated);
    try {
      const customOnly = updated.filter((e) => e.id.startsWith('custom-ex-'));
      localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(customOnly));
    } catch {}
  };

  const createCustomTemplate = (template: Omit<WorkoutTemplate, 'id'>) => {
    const newTemplate: WorkoutTemplate = {
      ...template,
      id: `tmpl-${Date.now()}`,
    };
    setTemplates((prev) => [...prev, newTemplate]);
  };

  // Calorie & Activity Tracking
  const logCustomActivity = (name: string, category: string, durationMinutes: number, met: number) => {
    const calories = calculateMetCalories(met, durationMinutes, profile.weight);
    const newActivity: LoggedActivity = {
      id: `act-${Date.now()}`,
      activityName: name,
      category,
      durationMinutes,
      met,
      caloriesBurned: calories,
      timestamp: Date.now(),
    };
    setLoggedActivities((prev) => [newActivity, ...prev]);
  };

  const removeLoggedActivity = (id: string) => {
    setLoggedActivities((prev) => prev.filter((a) => a.id !== id));
  };

  // Nutrition Tracking
  const toggleMealEaten = (mealId: string) => {
    setMealPlan((prev) =>
      prev.map((m) => (m.id === mealId ? { ...m, loggedAsEaten: !m.loggedAsEaten } : m))
    );
  };

  const addCustomMeal = (meal: Omit<MealItem, 'id'>) => {
    const newMeal: MealItem = {
      ...meal,
      id: `meal-${Date.now()}`,
      loggedAsEaten: meal.loggedAsEaten ?? true,
    };
    setMealPlan((prev) => [...prev, newMeal]);
  };

  const setFullMealPlan = (meals: MealItem[]) => {
    setMealPlan(meals);
  };

  const removeMeal = (mealId: string) => {
    setMealPlan((prev) => prev.filter((m) => m.id !== mealId));
  };

  const addWater = (amountMl: number) => {
    setWaterIntakeMl((prev) => Math.max(0, prev + amountMl));
  };

  const resetWater = () => {
    setWaterIntakeMl(0);
  };

  // Custom AI Agent Management
  const setActiveAgentId = (id: string) => {
    setActiveAgentIdState(id);
  };

  const createCustomAgent = (agent: Omit<CustomAIAgent, 'id' | 'isCustom'>) => {
    const newAgent: CustomAIAgent = {
      ...agent,
      id: `agent-${Date.now()}`,
      isCustom: true,
    };
    setAiAgents((prev) => [...prev, newAgent]);
    setActiveAgentIdState(newAgent.id);
  };

  // Send Message to AI Coach
  const sendMessageToCoach = async (text: string) => {
    if (!text.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      // Prepare full context
      const currentContext = {
        todayWorkout: activeWorkout
          ? {
              title: activeWorkout.title,
              durationSeconds: activeWorkoutDuration,
              exercises: activeWorkout.exercises.map((e) => ({
                name: e.exerciseName,
                sets: e.sets.map((s) => `${s.weight}kg x ${s.reps} reps (RPE ${s.rpe || 8}) ${s.completed ? '✓' : 'Pending'}`),
              })),
            }
          : workoutHistory.length > 0
          ? `Last workout: ${workoutHistory[0].title} (${workoutHistory[0].durationMinutes} mins, ${workoutHistory[0].estimatedCaloriesBurned} kcal)`
          : 'No workouts completed yet today',
        todayBurnedCalories,
        todayNutrition: {
          calories: todayConsumedCalories,
          protein: todayConsumedProtein,
          carbs: todayConsumedCarbs,
          fat: todayConsumedFat,
          waterMl: waterIntakeMl,
        },
        activeMealPlan: mealPlan,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
          agentConfig: activeAgent,
          userProfile: profile,
          currentContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat API error (${res.status})`);
      }

      const data = await res.json();
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        agentName: activeAgent.name,
        content: data.reply || "Let's keep crushing it!",
        timestamp: Date.now(),
        actionProposal: data.actionProposal || undefined,
      };

      setChatMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      console.error('Coach chat failed:', err);
      // Graceful local fallback message
      const fallbackMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        agentName: activeAgent.name,
        content: `I'm keeping an eye on your numbers (${profile.targetCalories} kcal goal, ${todayConsumedProtein}/${profile.targetProtein}g protein logged). Stay consistent with your progressive overload and hydration! What specific adjustment would you like to make?`,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Apply Action Proposal directly into user's active session or meals!
  const applyActionProposal = (messageId: string, proposal: ChatActionProposal) => {
    if (proposal.type === 'workout_adjustment') {
      const data = proposal.data;
      if (activeWorkout) {
        // If there's an original exercise, swap it
        let swapped = false;
        if (data.originalExercise && data.replacementExercise) {
          setActiveWorkout((prev) => {
            if (!prev) return null;
            const updated = prev.exercises.map((e) => {
              if (e.exerciseName.toLowerCase().includes(data.originalExercise.toLowerCase())) {
                swapped = true;
                return {
                  ...e,
                  exerciseName: data.replacementExercise,
                  muscleGroup: e.muscleGroup,
                  notes: data.reason || 'AI Coach joint adjustment',
                };
              }
              return e;
            });
            if (!swapped) {
              // Add as a new exercise
              updated.push({
                exerciseId: `swap-${Date.now()}`,
                exerciseName: data.replacementExercise,
                muscleGroup: 'Chest',
                sets: [
                  {
                    id: `set-${Date.now()}-1`,
                    setNumber: 1,
                    type: 'normal',
                    weight: 45,
                    reps: 12,
                    rpe: data.rpe || 8,
                    completed: false,
                  },
                ],
                notes: data.reason,
              });
            }
            return { ...prev, exercises: updated };
          });
        }
      } else {
        // Start a workout with the adjusted exercise!
        startWorkout(undefined, `Adjusted Session: ${proposal.title}`);
      }
    } else if (proposal.type === 'nutrition_adjustment') {
      const data = proposal.data;
      const newMeal: MealItem = {
        id: `ai-meal-${Date.now()}`,
        name: data.mealName || 'Coach Recommended Fuel',
        type: (data.mealType ? data.mealType.charAt(0).toUpperCase() + data.mealType.slice(1) : 'Snack') as any,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calories: Number(data.calories) || 350,
        protein: Number(data.protein) || 30,
        carbs: Number(data.carbs) || 30,
        fat: Number(data.fat) || 10,
        prepTime: '10 mins',
        description: proposal.details,
        ingredients: data.ingredients || ['Custom nutrient blend recommended by coach'],
        loggedAsEaten: true,
      };
      setMealPlan((prev) => [...prev, newMeal]);
    }

    // Mark proposal as applied in chat
    setChatMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.actionProposal) {
          return {
            ...msg,
            actionProposal: { ...msg.actionProposal, applied: true },
          };
        }
        return msg;
      })
    );

    playSuccessChime();
  };

  const clearChatHistory = () => {
    setChatMessages([]);
  };

  // Aggregated Daily Metrics
  // Workout calories today + activity calories today
  const historyCaloriesToday = workoutHistory
    .filter((w) => w.startTime > Date.now() - 24 * 60 * 60 * 1000)
    .reduce((sum, w) => sum + (w.estimatedCaloriesBurned || 0), 0);

  const activeWorkoutLiveCalories = activeWorkout
    ? estimateWorkoutCalories(Math.max(1, Math.round(activeWorkoutDuration / 60)), profile.weight)
    : 0;

  const activitiesCaloriesToday = loggedActivities
    .filter((a) => a.timestamp > Date.now() - 24 * 60 * 60 * 1000)
    .reduce((sum, a) => sum + (a.caloriesBurned || 0), 0);

  const todayBurnedCalories = historyCaloriesToday + activeWorkoutLiveCalories + activitiesCaloriesToday;

  // Nutrition consumed today (eaten meals)
  const eatenMeals = mealPlan.filter((m) => m.loggedAsEaten);
  const todayConsumedCalories = eatenMeals.reduce((sum, m) => sum + m.calories, 0);
  const todayConsumedProtein = eatenMeals.reduce((sum, m) => sum + m.protein, 0);
  const todayConsumedCarbs = eatenMeals.reduce((sum, m) => sum + m.carbs, 0);
  const todayConsumedFat = eatenMeals.reduce((sum, m) => sum + m.fat, 0);

  return (
    <FitnessContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isMobileFrame,
        setIsMobileFrame,
        profile,
        updateProfile,
        exercises,
        addCustomExercise,
        templates,
        createCustomTemplate,
        activeWorkout,
        startWorkout,
        cancelWorkout,
        finishWorkout,
        addExerciseToActiveWorkout,
        removeExerciseFromActiveWorkout,
        addSetToExercise,
        removeSetFromExercise,
        updateSet,
        activeWorkoutDuration,
        restTimerSeconds,
        isRestTimerActive,
        startRestTimer,
        stopRestTimer,
        addRestTimerSeconds,
        workoutHistory,
        loggedActivities,
        logCustomActivity,
        removeLoggedActivity,
        mealPlan,
        toggleMealEaten,
        addCustomMeal,
        setFullMealPlan,
        removeMeal,
        waterIntakeMl,
        addWater,
        resetWater,
        aiAgents,
        activeAgent,
        setActiveAgentId,
        createCustomAgent,
        chatMessages,
        isChatLoading,
        sendMessageToCoach,
        applyActionProposal,
        clearChatHistory,
        todayBurnedCalories,
        todayConsumedCalories,
        todayConsumedProtein,
        todayConsumedCarbs,
        todayConsumedFat,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};
