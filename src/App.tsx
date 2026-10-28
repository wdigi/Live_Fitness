/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FitnessProvider, useFitness } from './context/FitnessContext';
import { Navigation } from './components/Navigation';
import { WorkoutTab } from './components/workout/WorkoutTab';
import { CaloriesTab } from './components/calories/CaloriesTab';
import { NutritionTab } from './components/nutrition/NutritionTab';
import { CoachChatTab } from './components/coach/CoachChatTab';
import { ProfileTab } from './components/profile/ProfileTab';

const MainAppContent: React.FC = () => {
  const { activeTab, isMobileFrame } = useFitness();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'workout':
        return <WorkoutTab />;
      case 'calories':
        return <CaloriesTab />;
      case 'nutrition':
        return <NutritionTab />;
      case 'coach':
        return <CoachChatTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <WorkoutTab />;
    }
  };

  if (isMobileFrame) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-0 sm:p-4 md:p-6 lg:p-8">
        {/* Device Frame */}
        <div className="relative w-full max-w-[420px] h-[100dvh] sm:h-[860px] bg-slate-950 sm:rounded-[48px] shadow-2xl sm:border-[8px] sm:border-slate-800 flex flex-col overflow-hidden sm:ring-1 sm:ring-slate-700/50">
          {/* Dynamic Island / Speaker Pill */}
          <div className="hidden sm:flex absolute top-3 left-1/2 -translate-x-1/2 z-50 items-center justify-center">
            <div className="w-24 h-4 rounded-full bg-black/90 border border-slate-800 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 mr-2" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>
          </div>

          {/* App Container */}
          <div className="flex-1 flex flex-col overflow-hidden relative sm:pt-4">
            <Navigation />
            <main className="flex-1 overflow-y-auto scrollbar-none">
              {renderActiveTab()}
            </main>
          </div>
        </div>
      </div>
    );
  }

  // Full Screen Responsive View
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navigation />
      <main className="flex-1 overflow-y-auto">
        {renderActiveTab()}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <FitnessProvider>
      <MainAppContent />
    </FitnessProvider>
  );
}
