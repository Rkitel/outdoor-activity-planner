import React from 'react';
import { Flame, RefreshCw, Compass, ShieldAlert, Wind, Calendar } from 'lucide-react';

interface HeaderProps {
  activeTab: 'planner' | 'heat' | 'haze' | 'routes' | 'outlook';
  setActiveTab: (tab: 'planner' | 'heat' | 'haze' | 'routes' | 'outlook') => void;
  onOpenPlanner: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdated: Date;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenPlanner,
  isRefreshing,
  onRefresh,
  lastUpdated
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            StrideCast <span className="text-emerald-400 font-medium text-sm">SG</span>
          </span>
        </div>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('planner')}
            className={`cursor-pointer whitespace-nowrap transition-colors py-1 ${
              activeTab === 'planner'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Best Windows
          </button>
          <button
            onClick={() => setActiveTab('heat')}
            className={`cursor-pointer whitespace-nowrap transition-colors py-1 ${
              activeTab === 'heat'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Heat Stress & WBGT
          </button>
          <button
            onClick={() => setActiveTab('haze')}
            className={`cursor-pointer whitespace-nowrap transition-colors py-1 ${
              activeTab === 'haze'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Haze & PM2.5
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`cursor-pointer whitespace-nowrap transition-colors py-1 ${
              activeTab === 'routes'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Routes & Micro-Climates
          </button>
          <button
            onClick={() => setActiveTab('outlook')}
            className={`cursor-pointer whitespace-nowrap transition-colors py-1 ${
              activeTab === 'outlook'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            4-Day Outlook
          </button>
        </nav>

        {/* Zone 3: 1 primary action button + refresh affordance */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRefresh}
            title={`Last updated ${lastUpdated.toLocaleTimeString()}`}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={onOpenPlanner}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm shadow-emerald-500/20 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Simulate Time Slot</span>
          </button>
        </div>
      </div>
    </header>
  );
};
