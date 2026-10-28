import React, { useState } from 'react';
import {
  User,
  Settings,
  Scale,
  Ruler,
  Target,
  Activity,
  Flame,
  RotateCcw,
  Check,
  Sparkles,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useFitness } from '../../context/FitnessContext';
import { ActivityLevel, FitnessGoal, Gender } from '../../types';
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
  formatWeight,
  formatHeight,
} from '../../utils/fitnessCalculations';
import { playSuccessChime } from '../../utils/audio';

export const ProfileTab: React.FC = () => {
  const { profile, updateProfile } = useFitness();

  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [weightKg, setWeightKg] = useState(profile.weight);
  const [heightCm, setHeightCm] = useState(profile.height);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>(profile.unitSystem);
  const [goal, setGoal] = useState<FitnessGoal>(profile.goal);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel);

  const [targetCalories, setTargetCalories] = useState(profile.targetCalories);
  const [targetProtein, setTargetProtein] = useState(profile.targetProtein);
  const [targetCarbs, setTargetCarbs] = useState(profile.targetCarbs);
  const [targetFat, setTargetFat] = useState(profile.targetFat);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Recalculate target macros scientifically
  const handleRecalculate = () => {
    const bmr = calculateBMR(weightKg, heightCm, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const calculatedTargetCal = calculateTargetCalories(tdee, goal);
    const macros = calculateMacros(calculatedTargetCal, weightKg, goal);

    setTargetCalories(calculatedTargetCal);
    setTargetProtein(macros.protein);
    setTargetCarbs(macros.carbs);
    setTargetFat(macros.fat);

    updateProfile({
      name,
      age,
      gender,
      weight: weightKg,
      height: heightCm,
      unitSystem,
      goal,
      activityLevel,
      targetCalories: calculatedTargetCal,
      targetProtein: macros.protein,
      targetCarbs: macros.carbs,
      targetFat: macros.fat,
    });

    setSavedSuccess(true);
    playSuccessChime();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      age,
      gender,
      weight: weightKg,
      height: heightCm,
      unitSystem,
      goal,
      activityLevel,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
    });

    setSavedSuccess(true);
    playSuccessChime();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);

  return (
    <div className="pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-5">
      {/* Header Profile Card */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-800 glow-emerald flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-emerald-500/25">
          {name.charAt(0) || 'A'}
        </div>
        <div>
          <h2 className="text-base font-extrabold text-white tracking-tight">{name}</h2>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
            <span>{formatWeight(weightKg, unitSystem)}</span>
            <span>•</span>
            <span>{formatHeight(heightCm, unitSystem)}</span>
            <span>•</span>
            <span className="capitalize">{gender}</span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mt-1 block">
            {goal.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Form Settings */}
      <form onSubmit={handleSaveAll} className="space-y-4">
        {/* Unit Toggle & Bio Stats */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>Unit Preferences</span>
            </span>

            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setUnitSystem('metric');
                  updateProfile({ unitSystem: 'metric' });
                }}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold transition ${
                  unitSystem === 'metric'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Metric (kg/cm)
              </button>
              <button
                type="button"
                onClick={() => {
                  setUnitSystem('imperial');
                  updateProfile({ unitSystem: 'imperial' });
                }}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold transition ${
                  unitSystem === 'imperial'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Imperial (lbs/ft)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300">
                Weight ({unitSystem === 'imperial' ? 'lbs' : 'kg'})
              </label>
              <input
                type="number"
                step="0.5"
                value={
                  unitSystem === 'imperial'
                    ? Math.round(weightKg * 2.20462)
                    : weightKg
                }
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setWeightKg(unitSystem === 'imperial' ? Math.round((val / 2.20462) * 10) / 10 : val);
                }}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value) || 175)}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Goal & Activity Level */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Target Goal & Lifestyle</span>
          </span>

          <div>
            <label className="text-[11px] font-semibold text-slate-300">Primary Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as FitnessGoal)}
              className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="lean_bulk">Lean Bulk (+250 kcal progressive muscle building)</option>
              <option value="fat_loss">Fat Loss (-450 kcal steady deficit)</option>
              <option value="aggressive_cut">Aggressive Cut (-650 kcal contest prep)</option>
              <option value="maintain">Maintenance / Body Recomposition</option>
              <option value="heavy_bulk">Heavy Bulk (+500 kcal strength focus)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300">Weekly Activity Level</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
              className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="sedentary">Sedentary (Desk job, little to no exercise)</option>
              <option value="light">Lightly Active (1-3 workout days per week)</option>
              <option value="moderate">Moderately Active (3-5 workout days per week)</option>
              <option value="very_active">Very Active (6-7 intense training sessions)</option>
              <option value="extra_active">Extra Active (Athlete / Heavy physical labor)</option>
            </select>
          </div>
        </div>

        {/* Daily Calorie & Macro Targets */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Calorie & Macro Targets</span>
            </span>

            <button
              type="button"
              onClick={handleRecalculate}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto Calculate</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 font-mono">
            <div>
              <span>BMR: </span>
              <strong className="text-white">{bmr} kcal</strong>
            </div>
            <div>
              <span>TDEE: </span>
              <strong className="text-white">{tdee} kcal</strong>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-400">Calories</label>
              <input
                type="number"
                value={targetCalories}
                onChange={(e) => setTargetCalories(parseInt(e.target.value) || 0)}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white text-center font-bold focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-cyan-400">Protein (g)</label>
              <input
                type="number"
                value={targetProtein}
                onChange={(e) => setTargetProtein(parseInt(e.target.value) || 0)}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white text-center font-bold focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-amber-400">Carbs (g)</label>
              <input
                type="number"
                value={targetCarbs}
                onChange={(e) => setTargetCarbs(parseInt(e.target.value) || 0)}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white text-center font-bold focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-rose-400">Fat (g)</label>
              <input
                type="number"
                value={targetFat}
                onChange={(e) => setTargetFat(parseInt(e.target.value) || 0)}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white text-center font-bold focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <button
          type="submit"
          className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Profile & Targets Saved!</span>
            </>
          ) : (
            <span>Save Profile & Targets</span>
          )}
        </button>
      </form>
    </div>
  );
};
