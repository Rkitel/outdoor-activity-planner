import React, { useState } from 'react';
import {
  ActivityType,
  BestWindow,
  HourSlotForecast
} from '../types/weather';
import {
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Thermometer,
  Clock,
  Sparkles,
  ShieldCheck,
  Flame,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

interface BestWindowBannerProps {
  bestWindow: BestWindow;
  timeline: HourSlotForecast[];
  activity: ActivityType;
  setActivity: (act: ActivityType) => void;
  currentTemp: number;
  currentRH: number;
  currentRainfall: number;
  currentWind: number;
  currentPM25: number;
  currentUV: number;
  onSelectHour?: (hour: number) => void;
}

export const BestWindowBanner: React.FC<BestWindowBannerProps> = ({
  bestWindow,
  timeline,
  activity,
  setActivity,
  currentTemp,
  currentRH,
  currentRainfall,
  currentWind,
  currentPM25,
  currentUV,
  onSelectHour
}) => {
  const [selectedSlotHour, setSelectedSlotHour] = useState<number>(timeline[0]?.hour ?? 6);

  const selectedSlot = timeline.find((s) => s.hour === selectedSlotHour) || timeline[0];

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top row: Activity Mode Selector & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Singapore Meteorological Synthesis</span>
            <span aria-hidden="true">·</span>
            <span>Live NEA Sensor Fusion</span>
            <span aria-hidden="true">·</span>
            <span>2-Hr & 24-Hr Outlook</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Optimal Outdoor Window
          </h1>
        </div>

        {/* Activity Segmented Control */}
        <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl self-start md:self-auto">
          <button
            onClick={() => setActivity('running')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activity === 'running'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Running & Jogging
          </button>
          <button
            onClick={() => setActivity('cycling')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activity === 'cycling'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Road Cycling
          </button>
          <button
            onClick={() => setActivity('hiking')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activity === 'hiking'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Trail & Hiking
          </button>
        </div>
      </div>

      {/* Main Spotlight Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* Left Column: Top Recommendation Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950/90 to-slate-900/90 border border-slate-800/90 rounded-xl p-5 lg:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">
                Peak Recommended Slot
              </span>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{bestWindow.score}/100 Match</span>
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1 font-mono">
              {bestWindow.startTime} – {bestWindow.endTime}
            </div>
            <div className="text-sm font-medium text-slate-300 mb-4">
              {bestWindow.periodName}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              {bestWindow.reason}
            </p>

            {/* Micro stats strip */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 text-center">
              <div>
                <span className="block text-[11px] text-slate-400">Mean Temp</span>
                <span className="text-sm font-bold text-white font-mono">{bestWindow.avgTemp}°C</span>
              </div>
              <div className="border-x border-slate-800">
                <span className="block text-[11px] text-slate-400">Rain Risk</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{bestWindow.rainRisk}</span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-400">Heat Stress</span>
                <span className={`text-sm font-bold font-mono ${
                  bestWindow.heatStressLevel === 'Low' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {bestWindow.heatStressLevel}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Optimized for {activity}</span>
            </span>
            <span className="text-slate-500">Auto-calculated from live data</span>
          </div>
        </div>

        {/* Right Column: 24-Hour Timeline Scrubber & Inspector */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-slate-300">
                Hourly Suitability Timeline (05:00 – 23:00)
              </div>
              <span className="text-xs text-slate-500">
                Click any bar to preview conditions
              </span>
            </div>

            {/* Visual Bar Timeline */}
            <div className="grid grid-cols-10 sm:grid-cols-19 gap-1 h-32 items-end p-2 bg-slate-950/70 border border-slate-800/80 rounded-xl mb-4 overflow-x-auto">
              {timeline.map((slot) => {
                const isSelected = slot.hour === selectedSlotHour;
                // Height based on score (18 to 99)
                const heightPercent = Math.max(20, Math.min(100, slot.score));
                // Bar color
                let barColor = 'bg-slate-700 hover:bg-slate-600';
                if (slot.score >= 80) barColor = isSelected ? 'bg-emerald-400' : 'bg-emerald-500/80 hover:bg-emerald-400';
                else if (slot.score >= 65) barColor = isSelected ? 'bg-teal-400' : 'bg-teal-500/70 hover:bg-teal-400';
                else if (slot.score >= 45) barColor = isSelected ? 'bg-amber-400' : 'bg-amber-500/60 hover:bg-amber-400';
                else barColor = isSelected ? 'bg-rose-400' : 'bg-rose-500/60 hover:bg-rose-400';

                return (
                  <button
                    key={slot.hour}
                    onClick={() => {
                      setSelectedSlotHour(slot.hour);
                      if (onSelectHour) onSelectHour(slot.hour);
                    }}
                    title={`${slot.timeLabel}: ${slot.score}/100 - ${slot.temp}°C, ${slot.forecastSummary}`}
                    className="flex flex-col items-center justify-end h-full group focus:outline-none cursor-pointer"
                  >
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-sm transition-all duration-150 ${barColor} ${
                        isSelected ? 'ring-2 ring-white shadow-lg' : ''
                      }`}
                    />
                    <span className={`text-[10px] mt-1 font-mono tabular-nums ${
                      isSelected ? 'text-white font-bold' : 'text-slate-500 group-hover:text-slate-300'
                    }`}>
                      {slot.hour}h
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Inspector detail card for selected hour */}
            {selectedSlot && (
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white font-mono">
                      {selectedSlot.timeLabel} Window
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-300 font-medium">
                      {selectedSlot.forecastSummary}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Suitability:</span>
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                      selectedSlot.score >= 75
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : selectedSlot.score >= 50
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {selectedSlot.score}/100 · {selectedSlot.verdictText}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Temp
                    </span>
                    <span className="text-sm font-semibold text-white font-mono block mt-0.5">
                      {selectedSlot.temp}°C
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400" /> WBGT
                    </span>
                    <span className="text-sm font-semibold text-white font-mono block mt-0.5">
                      {selectedSlot.wbgt}°C
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Humidity
                    </span>
                    <span className="text-sm font-semibold text-white font-mono block mt-0.5">
                      {selectedSlot.humidity}%
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1">
                      <CloudRain className="w-3.5 h-3.5 text-blue-400" /> Rain Prob
                    </span>
                    <span className="text-sm font-semibold text-white font-mono block mt-0.5">
                      {selectedSlot.rainProbability}%
                    </span>
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-yellow-400" /> UV Index
                    </span>
                    <span className="text-sm font-semibold text-white font-mono block mt-0.5">
                      {selectedSlot.uvIndex} (Max)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Islandwide Live Telemetry Bar */}
      <div className="mt-6 pt-5 border-t border-slate-800/80">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span>Live Singapore Environmental Readings (Islandwide Average)</span>
          <span className="text-slate-500 font-normal">Real-time NEA stations</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <span className="text-xs text-slate-400 block">Air Temperature</span>
            <span className="text-lg font-bold text-white font-mono mt-0.5 block">{currentTemp}°C</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <span className="text-xs text-slate-400 block">Relative Humidity</span>
            <span className="text-lg font-bold text-white font-mono mt-0.5 block">{currentRH}%</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <span className="text-xs text-slate-400 block">5-Min Rainfall</span>
            <span className="text-lg font-bold text-white font-mono mt-0.5 block">{currentRainfall} mm</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <span className="text-xs text-slate-400 block">Wind Speed</span>
            <span className="text-lg font-bold text-white font-mono mt-0.5 block">{currentWind} knots</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <span className="text-xs text-slate-400 block">1-Hr PM2.5</span>
            <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">{currentPM25} µg/m³</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <span className="text-xs text-slate-400 block">Current UV Index</span>
            <span className="text-lg font-bold text-yellow-400 font-mono mt-0.5 block">{currentUV}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
