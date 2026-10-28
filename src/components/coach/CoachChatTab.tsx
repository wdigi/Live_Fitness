import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  Sparkles,
  Dumbbell,
  Utensils,
  Check,
  Volume2,
  VolumeX,
  Plus,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Flame,
  Award,
  Zap,
  Sliders,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useFitness } from '../../context/FitnessContext';
import { CustomAIAgent, ChatActionProposal } from '../../types';

export const CoachChatTab: React.FC = () => {
  const {
    activeAgent,
    aiAgents,
    setActiveAgentId,
    createCustomAgent,
    chatMessages,
    isChatLoading,
    sendMessageToCoach,
    applyActionProposal,
    clearChatHistory,
    profile,
    todayBurnedCalories,
    todayConsumedCalories,
    todayConsumedProtein,
    activeWorkout,
    mealPlan,
  } = useFitness();

  const [inputMessage, setInputMessage] = useState('');
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showCustomAgentForm, setShowCustomAgentForm] = useState(false);
  const [showContextBar, setShowContextBar] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // New custom agent form state
  const [customName, setCustomName] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customAvatar, setCustomAvatar] = useState('🦾');
  const [customTone, setCustomTone] = useState<any>('scientific');
  const [customPersonality, setCustomPersonality] = useState('');
  const [customPhilosophy, setCustomPhilosophy] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatLoading]);

  const handleSend = (text?: string) => {
    const toSend = text || inputMessage;
    if (!toSend.trim() || isChatLoading) return;
    sendMessageToCoach(toSend);
    setInputMessage('');
  };

  // Text to speech helper
  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    createCustomAgent({
      name: customName.trim(),
      title: customTitle || 'Personal AI Performance Coach',
      avatar: customAvatar,
      badge: 'Custom Agent',
      color: 'from-purple-600 to-indigo-700',
      tone: customTone,
      personality: customPersonality || 'Supportive, rigorous, personalized to user stats and biomechanics.',
      philosophy: customPhilosophy || 'Consistent progressive overload with macro adherence.',
    });

    setShowCustomAgentForm(false);
    setShowAgentModal(false);
  };

  const quickPrompts = [
    'My knees feel tight, suggest a joint-friendly squat swap',
    'I need 35g protein with under 300 calories right now',
    'Analyze my current workout volume and recovery balance',
    'Can you adjust my dinner for a quick 15-min high protein meal?',
    'Should I do cardio before or after lifting for fat loss?',
  ];

  return (
    <div className="pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto flex flex-col h-[calc(100vh-80px)]">
      {/* AI Coach Header & Agent Switcher */}
      <div className="glass-panel rounded-2xl p-3 border border-slate-800 mb-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shadow-md shadow-emerald-500/10">
              {activeAgent.avatar}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-sm text-white">{activeAgent.name}</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                  {activeAgent.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{activeAgent.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowContextBar(!showContextBar)}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
              title="Inspect Live Context"
            >
              <Zap className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={() => setShowAgentModal(true)}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700/60 flex items-center gap-1 transition"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Agents</span>
            </button>
          </div>
        </div>

        {/* Live Context Inspector Drawer */}
        {showContextBar && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-300 space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
              <span>Coach's Live Biometric Memory</span>
              <span className="text-emerald-400">● Synchronized</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
              <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Workout:</span>{' '}
                <span className="text-white font-bold">
                  {activeWorkout ? `${activeWorkout.title} (Live)` : 'Idle / Rest'}
                </span>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Burned:</span>{' '}
                <span className="text-amber-400 font-bold">{todayBurnedCalories} kcal</span>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Protein:</span>{' '}
                <span className="text-cyan-400 font-bold">
                  {todayConsumedProtein} / {profile.targetProtein}g
                </span>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Target Calories:</span>{' '}
                <span className="text-emerald-400 font-bold">
                  {todayConsumedCalories} / {profile.targetCalories} kcal
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-2">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in`}
            >
              {!isUser && (
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-xs">{activeAgent.avatar}</span>
                  <span className="text-[11px] font-bold text-slate-300">
                    {msg.agentName || activeAgent.name}
                  </span>
                  <span className="text-[9px] text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-sm shadow-md shadow-emerald-500/20'
                    : 'glass-panel text-slate-200 border border-slate-800 rounded-tl-sm whitespace-pre-wrap'
                }`}
              >
                {msg.content}

                {/* Speech Button for Agent Messages */}
                {!isUser && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <button
                      onClick={() => handleSpeak(msg.content)}
                      className="flex items-center gap-1 hover:text-white transition"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3 h-3 text-rose-400" />
                          <span>Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-cyan-400" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                    <span className="font-mono text-slate-500">Coach AI</span>
                  </div>
                )}

                {/* Action Proposal Card */}
                {msg.actionProposal && (
                  <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/10 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        {msg.actionProposal.type === 'workout_adjustment' ? (
                          <Dumbbell className="w-3 h-3" />
                        ) : (
                          <Utensils className="w-3 h-3" />
                        )}
                        <span>
                          {msg.actionProposal.type === 'workout_adjustment'
                            ? 'Workout Adjustment'
                            : 'Nutrition Adjustment'}
                        </span>
                      </span>
                      {msg.actionProposal.applied && (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Applied</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-xs text-white">{msg.actionProposal.title}</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">{msg.actionProposal.details}</p>

                    {/* Proposal Action Button */}
                    {!msg.actionProposal.applied ? (
                      <button
                        onClick={() => applyActionProposal(msg.id, msg.actionProposal!)}
                        className="w-full mt-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/25 transition"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>
                          {msg.actionProposal.type === 'workout_adjustment'
                            ? 'Apply to Active Workout'
                            : 'Add to Today\'s Meals'}
                        </span>
                      </button>
                    ) : (
                      <div className="w-full mt-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-center font-semibold text-[11px] border border-emerald-500/30">
                        ✓ Successfully Applied
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isChatLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-150" />
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-300" />
            <span className="text-slate-400 ml-1 text-[11px]">{activeAgent.name} is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="py-2 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition flex items-center gap-1 shrink-0"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{qp}</span>
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="pt-2 border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={`Ask ${activeAgent.name} for workout/nutrition adjustments...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isChatLoading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isChatLoading}
            className="w-10 h-10 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-emerald-500/20 transition shrink-0"
          >
            {isChatLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 fill-current" />
            )}
          </button>
        </form>
      </div>

      {/* Modal: Switch or Create Custom AI Agent */}
      {showAgentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="glass-panel max-w-md w-full rounded-2xl p-5 border border-slate-700 max-h-[85vh] flex flex-col animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Select AI Coach</h3>
              </div>
              <button
                onClick={() => setShowAgentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
              {aiAgents.map((agent) => {
                const isCurrent = agent.id === activeAgent.id;
                return (
                  <div
                    key={agent.id}
                    onClick={() => {
                      setActiveAgentId(agent.id);
                      setShowAgentModal(false);
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                      isCurrent
                        ? 'bg-emerald-500/15 border-emerald-500'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-xl shrink-0">
                      {agent.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white">{agent.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
                          {agent.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-cyan-400 font-medium">{agent.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{agent.personality}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Agent Creator Shortcut */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  setShowAgentModal(false);
                  setShowCustomAgentForm(true);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/25 transition"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Build My Custom AI Agent</span>
              </button>

              <button
                onClick={clearChatHistory}
                className="w-full py-1.5 text-xs text-rose-400 hover:text-rose-300 text-center"
              >
                Clear Conversation History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Custom AI Agent Builder */}
      {showCustomAgentForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="glass-panel max-w-md w-full rounded-2xl p-5 border border-purple-500/40 max-h-[85vh] flex flex-col animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Build Custom AI Agent</h3>
              </div>
              <button
                onClick={() => setShowCustomAgentForm(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-3 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="text-[11px] font-semibold text-slate-300">Agent Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coach Goliath, Sensei Ken, Dr. Sarah"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Title / Specialty</label>
                  <input
                    type="text"
                    placeholder="e.g. Strength Specialist"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Avatar Emoji</label>
                  <select
                    value={customAvatar}
                    onChange={(e) => setCustomAvatar(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="🦾">🦾 Bionic Arm</option>
                    <option value="🦁">🦁 Lion</option>
                    <option value="⚡">⚡ Lightning Bolt</option>
                    <option value="🥋">🥋 Sensei</option>
                    <option value="🏆">🏆 Champion</option>
                    <option value="🦅">🦅 Eagle</option>
                    <option value="👨‍🏫">👨‍🏫 Professor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300">Coaching Tone</label>
                <select
                  value={customTone}
                  onChange={(e) => setCustomTone(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="scientific">Scientific & Evidence-Based</option>
                  <option value="motivational">High Energy Motivational Drill Sergeant</option>
                  <option value="holistic">Mindful, Longevity & Mobility Focus</option>
                  <option value="culinary">Macro Chef & Nutrition Wizard</option>
                  <option value="custom">No-Nonsense Minimalist</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300">
                  Custom Personality & Coaching Rules
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Always suggest warmup cues, emphasize mind-muscle connection, recommend high protein snacks under 200 calories."
                  value={customPersonality}
                  onChange={(e) => setCustomPersonality(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition"
                >
                  Activate Custom Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
