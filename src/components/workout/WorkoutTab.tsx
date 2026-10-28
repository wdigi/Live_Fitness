import React, { useState } from 'react';
import {
  Play,
  Plus,
  Trash2,
  Check,
  Timer,
  Clock,
  Flame,
  Dumbbell,
  Search,
  X,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useFitness } from '../../context/FitnessContext';
import { Exercise, MuscleGroup, SetType, WorkoutTemplate } from '../../types';
import { calculateWorkoutVolume, estimateWorkoutCalories, formatWeight } from '../../utils/fitnessCalculations';
import { playShortBeep } from '../../utils/audio';

export const WorkoutTab: React.FC = () => {
  const {
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
    templates,
    exercises,
    addCustomExercise,
    profile,
    setActiveTab,
    sendMessageToCoach,
  } = useFitness();

  // Modals & States
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('All');
  const [showCustomExerciseModal, setShowCustomExerciseModal] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState<MuscleGroup>('Chest');
  const [newExEquipment, setNewExEquipment] = useState('Barbell');
  const [newExInstructions, setNewExInstructions] = useState('');
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);

  const muscleGroups: ('All' | MuscleGroup)[] = [
    'All',
    'Chest',
    'Back',
    'Legs',
    'Shoulders',
    'Arms',
    'Core',
    'Cardio',
  ];

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesMuscle = selectedMuscleFilter === 'All' || ex.muscleGroup === selectedMuscleFilter;
    return matchesSearch && matchesMuscle;
  });

  const handleAskCoachAboutExercise = (exerciseName: string) => {
    setActiveTab('coach');
    sendMessageToCoach(
      `I'm currently performing ${exerciseName}. Can you review optimal form cues, recommended RPE/tempo, or a joint-friendly swap if needed?`
    );
  };

  const handleCreateCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    addCustomExercise({
      name: newExName.trim(),
      muscleGroup: newExMuscle,
      equipment: newExEquipment,
      instructions: newExInstructions || 'Perform with controlled eccentric and full range of motion.',
      defaultSets: 3,
      defaultReps: '10-12',
    });
    setNewExName('');
    setNewExInstructions('');
    setShowCustomExerciseModal(false);
  };

  // -------------------------------------------------------------
  // ACTIVE WORKOUT VIEW
  // -------------------------------------------------------------
  if (activeWorkout) {
    const liveCalories = estimateWorkoutCalories(
      Math.max(1, Math.round(activeWorkoutDuration / 60)),
      profile.weight
    );
    const totalVolume = calculateWorkoutVolume(activeWorkout);
    const totalSetsCompleted = activeWorkout.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
      0
    );

    return (
      <div className="pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto">
        {/* Active Session Top Card */}
        <div className="glass-panel rounded-2xl p-4 border border-emerald-500/30 glow-emerald mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Active Workout
              </span>
            </div>
            <button
              onClick={cancelWorkout}
              className="text-xs text-rose-400 hover:text-rose-300 transition"
            >
              Discard
            </button>
          </div>

          <h2 className="text-lg font-bold text-white tracking-tight">{activeWorkout.title}</h2>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800">
            <div className="text-center bg-slate-900/60 rounded-xl p-2 border border-slate-800/60">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-0.5">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>Duration</span>
              </div>
              <span className="font-mono text-base font-bold text-white">
                {formatTimer(activeWorkoutDuration)}
              </span>
            </div>

            <div className="text-center bg-slate-900/60 rounded-xl p-2 border border-slate-800/60">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-0.5">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Burned</span>
              </div>
              <span className="font-mono text-base font-bold text-amber-300">
                {liveCalories} <span className="text-[10px] font-normal text-slate-400">kcal</span>
              </span>
            </div>

            <div className="text-center bg-slate-900/60 rounded-xl p-2 border border-slate-800/60">
              <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-0.5">
                <Dumbbell className="w-3 h-3 text-emerald-400" />
                <span>Volume</span>
              </div>
              <span className="font-mono text-base font-bold text-emerald-300">
                {formatWeight(totalVolume, profile.unitSystem)}
              </span>
            </div>
          </div>

          {/* Finish Button */}
          <button
            onClick={() => setShowConfirmFinish(true)}
            className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Finish Workout ({totalSetsCompleted} sets done)</span>
          </button>
        </div>

        {/* Rest Timer Floating Bar (Sticky) */}
        {isRestTimerActive && (
          <div className="sticky top-16 z-30 mb-4 glass-panel rounded-2xl p-3 border border-cyan-500/40 glow-cyan flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full border-2 border-cyan-500 flex items-center justify-center">
                <Timer className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                  Rest Timer Active
                </span>
                <div className="font-mono text-lg font-bold text-white">
                  {formatTimer(restTimerSeconds)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => addRestTimerSeconds(30)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/40"
              >
                +30s
              </button>
              <button
                onClick={stopRestTimer}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Exercises List */}
        <div className="space-y-4">
          {activeWorkout.exercises.map((exLog, exIdx) => (
            <div
              key={`${exLog.exerciseId}-${exIdx}`}
              className="glass-panel rounded-2xl p-4 border border-slate-800/80"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {exLog.muscleGroup}
                    </span>
                    <button
                      onClick={() => handleAskCoachAboutExercise(exLog.exerciseName)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium bg-cyan-950/50 px-2 py-0.5 rounded-full border border-cyan-500/20"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Ask Coach</span>
                    </button>
                  </div>
                  <h3 className="font-bold text-base text-white">{exLog.exerciseName}</h3>
                  {exLog.notes && (
                    <p className="text-xs text-amber-300/90 mt-0.5">{exLog.notes}</p>
                  )}
                </div>

                <button
                  onClick={() => removeExerciseFromActiveWorkout(exIdx)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/50 transition"
                  title="Remove exercise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Sets Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800">
                      <th className="pb-2 w-8 text-center">Set</th>
                      <th className="pb-2 w-14">Type</th>
                      <th className="pb-2 text-center">
                        Weight ({profile.unitSystem === 'imperial' ? 'lbs' : 'kg'})
                      </th>
                      <th className="pb-2 text-center">Reps</th>
                      <th className="pb-2 text-center">RPE</th>
                      <th className="pb-2 w-10 text-center">Done</th>
                      <th className="pb-2 w-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {exLog.sets.map((set, setIdx) => (
                      <tr
                        key={set.id}
                        className={`transition ${set.completed ? 'bg-emerald-500/10' : ''}`}
                      >
                        {/* Set Number */}
                        <td className="py-2 text-center text-slate-400 font-medium font-sans">
                          {set.setNumber}
                        </td>

                        {/* Set Type */}
                        <td className="py-2">
                          <select
                            value={set.type}
                            onChange={(e) =>
                              updateSet(exIdx, setIdx, 'type', e.target.value as SetType)
                            }
                            className="bg-slate-900 border border-slate-700/60 rounded px-1.5 py-1 text-[11px] text-slate-300 focus:outline-none"
                          >
                            <option value="normal">Normal</option>
                            <option value="warmup">Warm</option>
                            <option value="dropset">Drop</option>
                            <option value="failure">Fail</option>
                          </select>
                        </td>

                        {/* Weight */}
                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            step="0.5"
                            value={
                              profile.unitSystem === 'imperial'
                                ? Math.round(set.weight * 2.20462)
                                : set.weight
                            }
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const weightInKg =
                                profile.unitSystem === 'imperial' ? val / 2.20462 : val;
                              updateSet(exIdx, setIdx, 'weight', Math.round(weightInKg * 10) / 10);
                            }}
                            className="w-16 bg-slate-900/90 border border-slate-700/60 rounded px-1 py-1 text-center text-white font-bold focus:border-emerald-500 focus:outline-none"
                          />
                        </td>

                        {/* Reps */}
                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) =>
                              updateSet(exIdx, setIdx, 'reps', parseInt(e.target.value) || 0)
                            }
                            className="w-14 bg-slate-900/90 border border-slate-700/60 rounded px-1 py-1 text-center text-white font-bold focus:border-emerald-500 focus:outline-none"
                          />
                        </td>

                        {/* RPE */}
                        <td className="py-2 px-1 text-center">
                          <input
                            type="number"
                            min="1"
                            max="10"
                            step="0.5"
                            value={set.rpe || 8}
                            onChange={(e) =>
                              updateSet(exIdx, setIdx, 'rpe', parseFloat(e.target.value) || 8)
                            }
                            className="w-12 bg-slate-900/90 border border-slate-700/60 rounded px-1 py-1 text-center text-slate-300 focus:border-cyan-500 focus:outline-none"
                          />
                        </td>

                        {/* Complete Checkbox */}
                        <td className="py-2 text-center">
                          <button
                            onClick={() => {
                              playShortBeep(set.completed ? 440 : 880);
                              updateSet(exIdx, setIdx, 'completed', !set.completed);
                            }}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                              set.completed
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                                : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        </td>

                        {/* Delete Set */}
                        <td className="py-2 text-right">
                          {exLog.sets.length > 1 && (
                            <button
                              onClick={() => removeSetFromExercise(exIdx, setIdx)}
                              className="text-slate-600 hover:text-rose-400 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Set Button */}
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => addSetToExercise(exIdx)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Set</span>
                </button>

                <button
                  onClick={() => startRestTimer(90)}
                  className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition"
                >
                  <Timer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Rest 90s</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Exercise CTA */}
        <button
          onClick={() => setShowAddExerciseModal(true)}
          className="w-full mt-4 py-3 rounded-2xl border-2 border-dashed border-slate-700/80 hover:border-emerald-500/60 bg-slate-900/40 text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add Exercise to Session</span>
        </button>

        {/* Modal: Confirm Finish Workout */}
        {showConfirmFinish && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel max-w-sm w-full rounded-2xl p-5 border border-slate-700 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-3">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-lg font-bold text-center text-white">Complete Workout?</h3>
              <p className="text-xs text-slate-400 text-center mt-1 mb-4">
                You trained for {formatTimer(activeWorkoutDuration)} and burned an estimated{' '}
                <strong className="text-amber-400">{liveCalories} kcal</strong>.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowConfirmFinish(false)}
                  className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Keep Going
                </button>
                <button
                  onClick={() => {
                    setShowConfirmFinish(false);
                    finishWorkout();
                  }}
                  className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/30"
                >
                  Save & Finish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Exercise Selector */}
        {showAddExerciseModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3">
            <div className="glass-panel max-w-md w-full rounded-2xl p-4 border border-slate-700 max-h-[85vh] flex flex-col animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-base">Select Exercise</h3>
                <button
                  onClick={() => setShowAddExerciseModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mt-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search bench press, squat, pull-up..."
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Muscle Group Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none">
                {muscleGroups.map((mg) => (
                  <button
                    key={mg}
                    onClick={() => setSelectedMuscleFilter(mg)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                      selectedMuscleFilter === mg
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mg}
                  </button>
                ))}
              </div>

              {/* Exercise List */}
              <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
                {filteredExercises.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => {
                      addExerciseToActiveWorkout(ex.id);
                      setShowAddExerciseModal(false);
                    }}
                    className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer flex items-center justify-between group transition"
                  >
                    <div>
                      <h4 className="font-semibold text-sm text-white group-hover:text-emerald-400 transition">
                        {ex.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="text-emerald-400 font-medium">{ex.muscleGroup}</span>
                        <span>•</span>
                        <span>{ex.equipment}</span>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Custom Exercise Shortcut */}
              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    setShowAddExerciseModal(false);
                    setShowCustomExerciseModal(true);
                  }}
                  className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 font-medium flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Create Custom Exercise</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // IDLE / DASHBOARD WORKOUT VIEW (No active session running)
  // -------------------------------------------------------------
  return (
    <div className="pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-5">
      {/* Quick Start Action Card */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Ready to Train</span>
          </span>
          <span className="text-xs text-slate-400">
            Weight: {formatWeight(profile.weight, profile.unitSystem)}
          </span>
        </div>

        <h1 className="text-xl font-extrabold text-white tracking-tight">
          Track Your Workout Session
        </h1>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          Real-time set logging, automated rest timers with audio cues, and precise calorie
          expenditure tracking.
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => startWorkout()}
            className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Empty Workout</span>
          </button>

          <button
            onClick={() => setShowCustomExerciseModal(true)}
            className="py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/60 flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>New Exercise</span>
          </button>
        </div>
      </div>

      {/* Routine Templates */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Workout Routines</span>
          </h2>
          <span className="text-[11px] text-slate-400">{templates.length} Pro Splits</span>
        </div>

        <div className="space-y-3">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="glass-panel rounded-2xl p-4 border border-slate-800/80 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700/60">
                      {tmpl.difficulty}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>~{tmpl.durationEstimate} mins</span>
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white">{tmpl.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{tmpl.description}</p>
                </div>

                <button
                  onClick={() => startWorkout(tmpl.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs border border-emerald-500/40 transition flex items-center gap-1 shrink-0 ml-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start</span>
                </button>
              </div>

              {/* Exercises Preview */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                {tmpl.exercises.map((e, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800"
                  >
                    {e.exerciseName} ({e.targetSets} sets)
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workout History */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Recent Sessions</span>
          </h2>
          <span className="text-[11px] text-slate-400">
            {workoutHistory.length} completed
          </span>
        </div>

        {workoutHistory.length === 0 ? (
          <div className="glass-panel rounded-2xl p-6 text-center border border-slate-800">
            <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-slate-300">No logged sessions yet</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Start an empty session or pick a routine above to log your first workout!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {workoutHistory.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="glass-panel rounded-2xl p-3.5 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-white">{session.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span>{new Date(session.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    <span>•</span>
                    <span>{session.durationMinutes} mins</span>
                    <span>•</span>
                    <span className="text-emerald-400">
                      {formatWeight(calculateWorkoutVolume(session), profile.unitSystem)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-amber-400">
                    +{session.estimatedCaloriesBurned} kcal
                  </span>
                  <div className="text-[10px] text-slate-500">
                    {session.exercises.length} exercises
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Exercise Modal */}
      {showCustomExerciseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full rounded-2xl p-5 border border-slate-700 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base">New Custom Exercise</h3>
              <button
                onClick={() => setShowCustomExerciseModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomExercise} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300">Exercise Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bulgarian Split Squat"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Muscle Group</label>
                  <select
                    value={newExMuscle}
                    onChange={(e) => setNewExMuscle(e.target.value as MuscleGroup)}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Chest">Chest</option>
                    <option value="Back">Back</option>
                    <option value="Legs">Legs</option>
                    <option value="Shoulders">Shoulders</option>
                    <option value="Arms">Arms</option>
                    <option value="Core">Core</option>
                    <option value="Cardio">Cardio</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Equipment</label>
                  <input
                    type="text"
                    value={newExEquipment}
                    onChange={(e) => setNewExEquipment(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300">Form Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Key form cue..."
                  value={newExInstructions}
                  onChange={(e) => setNewExInstructions(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition"
                >
                  Save Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
