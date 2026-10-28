import React, { useState } from 'react';
import {
  Flame,
  Activity,
  Plus,
  Clock,
  Trash2,
  Heart,
  TrendingDown,
  TrendingUp,
  Zap,
  Check,
  Info,
  Dumbbell,
  Compass,
} from 'lucide-react';
import { useFitness } from '../../context/FitnessContext';
import { MET_ACTIVITIES_LIST } from '../../data/defaultData';
import {
  calculateBMR,
  calculateTDEE,
  calculateMetCalories,
  calculateHeartRateZones,
  formatWeight,
} from '../../utils/fitnessCalculations';
import { ActivityMet } from '../../types';

export const CaloriesTab: React.FC = () => {
  const {
    profile,
    todayBurnedCalories,
    todayConsumedCalories,
    loggedActivities,
    logCustomActivity,
    removeLoggedActivity,
    workoutHistory,
  } = useFitness();

  // MET Calculator states
  const [selectedActivity, setSelectedActivity] = useState<ActivityMet>(MET_ACTIVITIES_LIST[0]);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [customMetName, setCustomMetName] = useState<string>('');
  const [customMetValue, setCustomMetValue] = useState<number>(6.0);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [activitySearch, setActivitySearch] = useState<string>('');

  // Daily energy calculations
  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel);

  // Total daily expenditure = TDEE baseline + active workouts/activities burned today
  const totalDailyExpenditure = tdee + todayBurnedCalories;
  const netEnergyBalance = todayConsumedCalories - totalDailyExpenditure;
  const isDeficit = netEnergyBalance < 0;

  // Heart rate zones
  const hrZones = calculateHeartRateZones(profile.age);

  // Current calculation preview
  const activeMet = isCustomMode ? customMetValue : selectedActivity.met;
  const activeName = isCustomMode ? customMetName || 'Custom Activity' : selectedActivity.name;
  const calculatedBurn = calculateMetCalories(activeMet, durationMinutes, profile.weight);

  const handleLogActivity = () => {
    logCustomActivity(
      activeName,
      isCustomMode ? 'Custom' : selectedActivity.category,
      durationMinutes,
      activeMet
    );
  };

  const filteredActivities = MET_ACTIVITIES_LIST.filter((act) =>
    act.name.toLowerCase().includes(activitySearch.toLowerCase()) ||
    act.category.toLowerCase().includes(activitySearch.toLowerCase())
  );

  return (
    <div className="pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-5">
      {/* Energy Balance Hero Card */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-800 glow-amber relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>Energy Expenditure</span>
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            Goal: {profile.goal.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Big Numbers Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">Total Burned Today</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                {totalDailyExpenditure}
              </span>
              <span className="text-xs text-slate-400">kcal</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              BMR {bmr} + Active {todayBurnedCalories}
            </span>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1">Consumed Today</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                {todayConsumedCalories}
              </span>
              <span className="text-xs text-slate-400">kcal</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Target: {profile.targetCalories} kcal
            </span>
          </div>
        </div>

        {/* Net Energy Status Bar */}
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDeficit ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {isDeficit ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {isDeficit ? 'Caloric Deficit (Fat Loss Zone)' : 'Caloric Surplus (Growth Zone)'}
              </span>
              <span className="text-[10px] text-slate-400">
                {Math.abs(netEnergyBalance)} kcal {isDeficit ? 'under expenditure' : 'over expenditure'}
              </span>
            </div>
          </div>

          <span
            className={`font-mono text-sm font-black px-2.5 py-1 rounded-lg ${
              isDeficit
                ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
            }`}
          >
            {netEnergyBalance > 0 ? `+${netEnergyBalance}` : netEnergyBalance} kcal
          </span>
        </div>
      </div>

      {/* MET Activity Calorie Calculator */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>MET Activity Calorie Calculator</span>
          </h2>
          <button
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
          >
            {isCustomMode ? 'Use Preset Library' : '+ Custom MET'}
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Calculates scientifically verified calorie burn using the Compendium of Physical
          Activities (ACSM standard).
        </p>

        {isCustomMode ? (
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300">Activity Name</label>
              <input
                type="text"
                placeholder="e.g. Kettlebell Sport, Pickleball"
                value={customMetName}
                onChange={(e) => setCustomMetName(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span>MET Intensity Value</span>
                <span className="font-mono text-cyan-400 font-bold">{customMetValue.toFixed(1)} MET</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="14.0"
                step="0.5"
                value={customMetValue}
                onChange={(e) => setCustomMetValue(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>Light (3.0)</span>
                <span>Moderate (6.0)</span>
                <span>Vigorous (9.0)</span>
                <span>Extreme (12.0+)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {/* Search Activity */}
            <input
              type="text"
              placeholder="Search running, cycling, rowing, HIIT..."
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />

            {/* Quick Activity Selector Carousel */}
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredActivities.map((act) => {
                const isSelected = selectedActivity.id === act.id;
                return (
                  <button
                    key={act.id}
                    onClick={() => setSelectedActivity(act)}
                    className={`p-2.5 rounded-xl text-left border transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white font-semibold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs line-clamp-1">{act.name}</span>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                      <span>{act.category}</span>
                      <span className="font-mono text-amber-400 font-semibold">{act.met} MET</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Duration Slider */}
        <div className="mb-4 bg-slate-900/80 rounded-2xl p-3 border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Duration</span>
            </span>
            <span className="font-mono text-sm font-bold text-white">{durationMinutes} mins</span>
          </div>

          <input
            type="range"
            min="5"
            max="120"
            step="5"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
            className="w-full accent-amber-400"
          />

          <div className="flex items-center justify-between gap-1.5 mt-2">
            {[15, 30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                onClick={() => setDurationMinutes(mins)}
                className={`flex-1 py-1 text-[11px] rounded-lg font-medium transition ${
                  durationMinutes === mins
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Calculated Burn Preview & Formula Box */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-2xl p-4 border border-amber-500/30 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                Calculated Calorie Burn
              </span>
              <div className="font-mono text-2xl font-black text-white mt-0.5">
                {calculatedBurn} <span className="text-sm font-normal text-slate-400">kcal</span>
              </div>
            </div>

            <button
              onClick={handleLogActivity}
              className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/25 flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Log Burn</span>
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-amber-500/20 text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <Info className="w-3 h-3 text-amber-400 shrink-0" />
            <span>
              Formula: ({durationMinutes}m × {activeMet} MET × 3.5 × {profile.weight}kg) ÷ 200
            </span>
          </div>
        </div>
      </div>

      {/* Heart Rate Training Zones */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Heart Rate Training Zones</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Max HR: {hrZones.maxHR} bpm</span>
        </div>

        <p className="text-xs text-slate-400 mb-3">
          Estimated based on age ({profile.age} yrs). Target Zone 2 for maximal mitochondrial fat
          oxidation without muscle breakdown.
        </p>

        <div className="space-y-2">
          {/* Zone 1 */}
          <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <div>
                <span className="font-semibold text-white">Zone 1: Active Recovery</span>
                <span className="text-[10px] text-slate-400 block">50 - 60% Max HR</span>
              </div>
            </div>
            <span className="font-mono font-bold text-slate-300">
              {hrZones.zone1Recovery[0]} - {hrZones.zone1Recovery[1]} bpm
            </span>
          </div>

          {/* Zone 2 */}
          <div className="bg-emerald-950/40 rounded-xl p-2.5 border border-emerald-500/40 flex items-center justify-between text-xs glow-emerald">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white">Zone 2: Aerobic Fat Burn</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                    Optimal
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400/80 block">60 - 70% Max HR</span>
              </div>
            </div>
            <span className="font-mono font-bold text-emerald-300">
              {hrZones.zone2AerobicFatBurn[0]} - {hrZones.zone2AerobicFatBurn[1]} bpm
            </span>
          </div>

          {/* Zone 3 */}
          <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <div>
                <span className="font-semibold text-white">Zone 3: Aerobic Tempo</span>
                <span className="text-[10px] text-slate-400 block">70 - 80% Max HR</span>
              </div>
            </div>
            <span className="font-mono font-bold text-cyan-300">
              {hrZones.zone3Tempo[0]} - {hrZones.zone3Tempo[1]} bpm
            </span>
          </div>

          {/* Zone 4 */}
          <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div>
                <span className="font-semibold text-white">Zone 4: Anaerobic Threshold</span>
                <span className="text-[10px] text-slate-400 block">80 - 90% Max HR</span>
              </div>
            </div>
            <span className="font-mono font-bold text-amber-300">
              {hrZones.zone4Threshold[0]} - {hrZones.zone4Threshold[1]} bpm
            </span>
          </div>

          {/* Zone 5 */}
          <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div>
                <span className="font-semibold text-white">Zone 5: Maximum V02 Effort</span>
                <span className="text-[10px] text-slate-400 block">90 - 100% Max HR</span>
              </div>
            </div>
            <span className="font-mono font-bold text-rose-400">
              {hrZones.zone5Anaerobic[0]} - {hrZones.zone5Anaerobic[1]} bpm
            </span>
          </div>
        </div>
      </div>

      {/* Logged Activities Today List */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Today's Logged Activities</span>
          </h2>
          <span className="text-[11px] text-slate-400">
            {loggedActivities.length} activities
          </span>
        </div>

        {loggedActivities.length === 0 ? (
          <div className="glass-panel rounded-2xl p-5 text-center border border-slate-800">
            <Flame className="w-7 h-7 text-slate-600 mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-slate-300">No cardio or sports logged today</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select an activity from the calculator above and click Log Burn!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {loggedActivities.map((act) => (
              <div
                key={act.id}
                className="glass-panel rounded-xl p-3 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{act.activityName}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                    <span className="text-amber-400">{act.durationMinutes} mins</span>
                    <span>•</span>
                    <span>{act.met} MET</span>
                    <span>•</span>
                    <span>{act.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-amber-400">
                    +{act.caloriesBurned} kcal
                  </span>
                  <button
                    onClick={() => removeLoggedActivity(act.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
