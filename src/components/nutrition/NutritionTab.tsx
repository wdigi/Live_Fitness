import React, { useState } from 'react';
import {
  Utensils,
  Plus,
  Sparkles,
  Check,
  Droplet,
  ChevronDown,
  ChevronUp,
  Clock,
  ShoppingCart,
  Send,
  Trash2,
  X,
  RefreshCw,
  Flame,
  Leaf,
  Layers,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useFitness } from '../../context/FitnessContext';
import { DietType, MealItem } from '../../types';
import { playShortBeep, playSuccessChime } from '../../utils/audio';

export const NutritionTab: React.FC = () => {
  const {
    profile,
    mealPlan,
    toggleMealEaten,
    addCustomMeal,
    setFullMealPlan,
    removeMeal,
    waterIntakeMl,
    addWater,
    resetWater,
    todayConsumedCalories,
    todayConsumedProtein,
    todayConsumedCarbs,
    todayConsumedFat,
    setActiveTab,
    sendMessageToCoach,
  } = useFitness();

  // Modals & Panels
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showGroceryModal, setShowGroceryModal] = useState(false);
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);

  // AI Meal Plan Generator inputs
  const [selectedDiet, setSelectedDiet] = useState<DietType>(profile.dietType || 'high_protein');
  const [customCalories, setCustomCalories] = useState<number>(profile.targetCalories);
  const [mealsCount, setMealsCount] = useState<number>(4);
  const [allergiesText, setAllergiesText] = useState<string>(profile.allergies.join(', '));
  const [isGenerating, setIsGenerating] = useState(false);

  // Quick NLP Food Estimator
  const [naturalFoodInput, setNaturalFoodInput] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);

  // Grocery Checklist checked states
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  // Manual meal add
  const [manualName, setManualName] = useState('');
  const [manualType, setManualType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
  const [manualCalories, setManualCalories] = useState(450);
  const [manualProtein, setManualProtein] = useState(30);
  const [manualCarbs, setManualCarbs] = useState(45);
  const [manualFat, setManualFat] = useState(12);

  // Progress calculations
  const calPercent = Math.min(100, Math.round((todayConsumedCalories / profile.targetCalories) * 100));
  const proteinPercent = Math.min(100, Math.round((todayConsumedProtein / profile.targetProtein) * 100));
  const carbsPercent = Math.min(100, Math.round((todayConsumedCarbs / profile.targetCarbs) * 100));
  const fatPercent = Math.min(100, Math.round((todayConsumedFat / profile.targetFat) * 100));
  const waterPercent = Math.min(100, Math.round((waterIntakeMl / profile.dailyWaterTarget) * 100));

  // AI Meal Generator handler
  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dietStyle: selectedDiet,
          targetCalories: customCalories,
          targetMacros: {
            protein: profile.targetProtein,
            carbs: profile.targetCarbs,
            fat: profile.targetFat,
          },
          mealsCount: mealsCount,
          allergies: allergiesText.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });

      if (!res.ok) throw new Error('Failed to generate meal plan');

      const data = await res.json();
      if (data.meals && Array.isArray(data.meals) && data.meals.length > 0) {
        setFullMealPlan(data.meals);
        setShowGenerateModal(false);
        playSuccessChime();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick NLP Food Estimator handler
  const handleQuickEstimateAndLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalFoodInput.trim() || isEstimating) return;

    setIsEstimating(true);
    try {
      const res = await fetch('/api/quick-nutritional-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodDescription: naturalFoodInput }),
      });

      if (!res.ok) throw new Error('Estimation failed');
      const data = await res.json();

      addCustomMeal({
        name: data.name || naturalFoodInput,
        type: 'Snack',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calories: Number(data.calories) || 350,
        protein: Number(data.protein) || 20,
        carbs: Number(data.carbs) || 30,
        fat: Number(data.fat) || 10,
        prepTime: 'Logged item',
        description: data.notes || 'Logged via quick natural language estimator',
        ingredients: [naturalFoodInput],
        loggedAsEaten: true,
      });

      setNaturalFoodInput('');
      playShortBeep(880);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEstimating(false);
    }
  };

  // Manual meal add handler
  const handleAddManualMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    addCustomMeal({
      name: manualName.trim(),
      type: manualType,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calories: manualCalories,
      protein: manualProtein,
      carbs: manualCarbs,
      fat: manualFat,
      prepTime: 'Custom',
      ingredients: [],
      loggedAsEaten: true,
    });

    setManualName('');
    setShowQuickAddModal(false);
    playShortBeep(880);
  };

  // Ask coach to swap a meal
  const handleAskCoachToSwapMeal = (meal: MealItem) => {
    setActiveTab('coach');
    sendMessageToCoach(
      `Can you suggest a healthy alternative or swap for my ${meal.type} ("${meal.name}") that matches ~${meal.calories} kcal and ${meal.protein}g protein?`
    );
  };

  // Gather all grocery ingredients
  const allGroceryIngredients = Array.from(
    new Set(mealPlan.flatMap((m) => m.ingredients || []))
  );

  const toggleGroceryCheck = (item: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  return (
    <div className="pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto space-y-5">
      {/* Macro Dashboard Card */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-800 glow-emerald">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Utensils className="w-3.5 h-3.5" />
            <span>Today's Nutrition</span>
          </span>
          <span className="text-xs text-slate-400">
            {calPercent}% of Daily Target
          </span>
        </div>

        {/* Big Calories Progress */}
        <div className="mb-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">{todayConsumedCalories}</span>
              <span className="text-xs text-slate-400">/ {profile.targetCalories} kcal</span>
            </div>
            <span className="text-xs font-semibold text-emerald-400">
              {profile.targetCalories - todayConsumedCalories > 0
                ? `${profile.targetCalories - todayConsumedCalories} kcal remaining`
                : 'Target Reached!'}
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${calPercent}%` }}
            />
          </div>
        </div>

        {/* 3 Macro Bars Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-800/80">
          {/* Protein */}
          <div className="bg-slate-900/80 rounded-2xl p-2.5 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-bold text-cyan-400">Protein</span>
              <span className="font-mono text-[10px] text-slate-400">
                {todayConsumedProtein}/{profile.targetProtein}g
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block font-mono">
              {proteinPercent}% done
            </span>
          </div>

          {/* Carbs */}
          <div className="bg-slate-900/80 rounded-2xl p-2.5 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-bold text-amber-400">Carbs</span>
              <span className="font-mono text-[10px] text-slate-400">
                {todayConsumedCarbs}/{profile.targetCarbs}g
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${carbsPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block font-mono">
              {carbsPercent}% done
            </span>
          </div>

          {/* Fat */}
          <div className="bg-slate-900/80 rounded-2xl p-2.5 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-bold text-rose-400">Fats</span>
              <span className="font-mono text-[10px] text-slate-400">
                {todayConsumedFat}/{profile.targetFat}g
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-rose-400 rounded-full transition-all duration-500"
                style={{ width: `${fatPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block font-mono">
              {fatPercent}% done
            </span>
          </div>
        </div>
      </div>

      {/* Hydration Tracker */}
      <div className="glass-panel rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Droplet className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Water Intake</span>
              <span className="text-[10px] font-mono text-blue-400 font-semibold">{waterPercent}%</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {waterIntakeMl} / {profile.dailyWaterTarget} ml
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => addWater(250)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-950/60 text-blue-300 border border-blue-500/30 hover:bg-blue-900/40 transition"
          >
            +250ml
          </button>
          <button
            onClick={() => addWater(500)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30 transition"
          >
            +500ml
          </button>
        </div>
      </div>

      {/* Action Buttons: AI Generator & Grocery List */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setShowGenerateModal(true)}
          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 flex items-center justify-center gap-1.5 transition"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Generate AI Plan</span>
        </button>

        <button
          onClick={() => setShowGroceryModal(true)}
          className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/60 flex items-center justify-center gap-1.5 transition"
        >
          <ShoppingCart className="w-4 h-4 text-cyan-400" />
          <span>Grocery List ({allGroceryIngredients.length})</span>
        </button>
      </div>

      {/* Natural Language Quick Food Logger */}
      <form onSubmit={handleQuickEstimateAndLog} className="glass-panel rounded-2xl p-3 border border-slate-800">
        <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
          Quick AI Food Logger (Natural Language)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 2 boiled eggs, sourdough toast with butter, black coffee"
            value={naturalFoodInput}
            onChange={(e) => setNaturalFoodInput(e.target.value)}
            disabled={isEstimating}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!naturalFoodInput.trim() || isEstimating}
            className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center transition"
          >
            {isEstimating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>

      {/* Meal Plan Schedule */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-emerald-400" />
            <span>Personalized Meal Plan</span>
          </h2>
          <button
            onClick={() => setShowQuickAddModal(true)}
            className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Meal</span>
          </button>
        </div>

        <div className="space-y-3">
          {mealPlan.map((meal) => {
            const isExpanded = expandedMealId === meal.id;
            return (
              <div
                key={meal.id}
                className={`glass-panel rounded-2xl p-4 border transition ${
                  meal.loggedAsEaten ? 'border-emerald-500/40 bg-slate-900/60' : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {meal.type}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{meal.time}</span>
                      </span>
                      {meal.prepTime && (
                        <span className="text-[10px] text-slate-500">({meal.prepTime})</span>
                      )}
                    </div>

                    <h3
                      className={`font-bold text-sm text-white ${
                        meal.loggedAsEaten ? 'text-slate-200' : ''
                      }`}
                    >
                      {meal.name}
                    </h3>

                    {/* Macro Tags */}
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono">
                      <span className="text-amber-400 font-bold">{meal.calories} kcal</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-cyan-300">{meal.protein}g P</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-amber-300">{meal.carbs}g C</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-rose-300">{meal.fat}g F</span>
                    </div>
                  </div>

                  {/* Log as Eaten Checkbox */}
                  <button
                    onClick={() => {
                      playShortBeep(meal.loggedAsEaten ? 440 : 880);
                      toggleMealEaten(meal.id);
                    }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition shrink-0 ml-3 ${
                      meal.loggedAsEaten
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                    title={meal.loggedAsEaten ? 'Mark as Uneaten' : 'Log as Eaten'}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>

                {/* Description */}
                {meal.description && (
                  <p className="text-xs text-slate-400 mt-2">{meal.description}</p>
                )}

                {/* Collapsible Recipe & Ingredients */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedMealId(isExpanded ? null : meal.id)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                  >
                    <span>Ingredients & Recipe</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAskCoachToSwapMeal(meal)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Swap</span>
                    </button>
                    <button
                      onClick={() => removeMeal(meal.id)}
                      className="text-slate-600 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-3 animate-in fade-in">
                    {meal.ingredients?.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                          Ingredients
                        </span>
                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                          {meal.ingredients.map((ing, idx) => (
                            <li key={idx}>{ing}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {meal.instructions && meal.instructions.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                          Preparation Steps
                        </span>
                        <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1">
                          {meal.instructions.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: AI Meal Plan Generator */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="glass-panel max-w-md w-full rounded-2xl p-5 border border-slate-700 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Generate Personalized Meal Plan</h3>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Diet Style</label>
                <select
                  value={selectedDiet}
                  onChange={(e) => setSelectedDiet(e.target.value as DietType)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="high_protein">High Protein (Muscle Growth & Satiety)</option>
                  <option value="balanced">Balanced Clean Nutrition</option>
                  <option value="keto">Ketogenic (Very Low Carb, High Fat)</option>
                  <option value="mediterranean">Mediterranean (Heart Health & Longevity)</option>
                  <option value="vegan">Plant-Based / Vegan</option>
                  <option value="low_carb">Low Carb Athlete</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Daily Calories (kcal)
                  </label>
                  <input
                    type="number"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(parseInt(e.target.value) || 2000)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Meals / Day</label>
                  <select
                    value={mealsCount}
                    onChange={(e) => setMealsCount(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value={3}>3 Meals</option>
                    <option value={4}>3 Meals + 1 Snack</option>
                    <option value={5}>3 Meals + 2 Snacks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Allergies or Dislikes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gluten-free, no peanuts, lactose intolerant"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Cooking up your AI meal plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 stroke-[2.5]" />
                      <span>Generate Full Day Meal Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Interactive Grocery Checklist */}
      {showGroceryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="glass-panel max-w-md w-full rounded-2xl p-5 border border-slate-700 max-h-[80vh] flex flex-col animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Grocery Checklist</h3>
              </div>
              <button
                onClick={() => setShowGroceryModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-2 mb-3">
              Generated automatically from your active meal plan recipes. Check items off as you shop.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {allGroceryIngredients.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No ingredients found in current meal plan.
                </p>
              ) : (
                allGroceryIngredients.map((ing, idx) => {
                  const isChecked = !!checkedIngredients[ing];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleGroceryCheck(ing)}
                      className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-400 line-through'
                          : 'bg-slate-900/60 border-slate-800 text-white'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span className="text-xs">{ing}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowGroceryModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Done Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manual Add Meal */}
      {showQuickAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-sm w-full rounded-2xl p-5 border border-slate-700 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base">Add Custom Meal</h3>
              <button
                onClick={() => setShowQuickAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualMeal} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300">Meal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grilled Chicken Wrap"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300">Meal Type</label>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value as any)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Calories (kcal)</label>
                  <input
                    type="number"
                    value={manualCalories}
                    onChange={(e) => setManualCalories(parseInt(e.target.value) || 0)}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Protein (g)</label>
                  <input
                    type="number"
                    value={manualProtein}
                    onChange={(e) => setManualProtein(parseInt(e.target.value) || 0)}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Carbs (g)</label>
                  <input
                    type="number"
                    value={manualCarbs}
                    onChange={(e) => setManualCarbs(parseInt(e.target.value) || 0)}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Fat (g)</label>
                  <input
                    type="number"
                    value={manualFat}
                    onChange={(e) => setManualFat(parseInt(e.target.value) || 0)}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition"
                >
                  Add to Meal Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
