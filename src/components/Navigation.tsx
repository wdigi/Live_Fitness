import React from 'react';
import { Dumbbell, Flame, Utensils, Bot, User, Smartphone, Monitor, Timer } from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { TabType } from '../types';

export const Navigation: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isMobileFrame,
    setIsMobileFrame,
    activeWorkout,
    activeWorkoutDuration,
    activeAgent,
  } = useFitness();

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const navItems: { tab: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      tab: 'workout',
      label: 'Workout',
      icon: <Dumbbell className="w-5 h-5" />,
      badge: activeWorkout ? 'ACTIVE' : undefined,
    },
    {
      tab: 'calories',
      label: 'Calories',
      icon: <Flame className="w-5 h-5" />,
    },
    {
      tab: 'nutrition',
      label: 'Meals',
      icon: <Utensils className="w-5 h-5" />,
    },
    {
      tab: 'coach',
      label: 'Live Coach',
      icon: (
        <div className="relative">
          <Bot className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      ),
      badge: 'LIVE',
    },
    {
      tab: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black text-base shadow-md shadow-emerald-500/20">
            P
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">PulseFit</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Live Coach
              </span>
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>{activeAgent.avatar}</span>
              <span className="truncate max-w-[140px]">{activeAgent.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Workout Pill */}
          {activeWorkout && (
            <button
              onClick={() => setActiveTab('workout')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-medium animate-pulse"
              title="Return to Active Workout"
            >
              <Timer className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="font-mono text-[11px] font-semibold">{formatTimer(activeWorkoutDuration)}</span>
            </button>
          )}

          {/* Desktop/Mobile Device Frame Toggle */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="hidden md:flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
            title={isMobileFrame ? 'Switch to Full Screen' : 'Switch to Phone Mockup View'}
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-800/80 px-2 py-2 max-w-lg mx-auto md:max-w-none">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                )}
                <div className={`p-1 transition-transform ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
                {item.badge && !isActive && (
                  <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
