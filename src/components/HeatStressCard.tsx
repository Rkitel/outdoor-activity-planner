import React, { useState } from 'react';
import {
  Flame,
  Droplets,
  HeartPulse,
  Info,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Thermometer
} from 'lucide-react';
import { calculateWBGT, getHeatStressLevel, getHeatStressAdvisory } from '../services/weatherApi';
import { ActivityType } from '../types/weather';

interface HeatStressCardProps {
  currentTemp: number;
  currentRH: number;
  activity: ActivityType;
}

export const HeatStressCard: React.FC<HeatStressCardProps> = ({
  currentTemp,
  currentRH,
  activity
}) => {
  const [simTemp, setSimTemp] = useState<number>(currentTemp || 31.0);
  const [simRH, setSimRH] = useState<number>(currentRH || 78);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const activeTemp = isSimulating ? simTemp : currentTemp;
  const activeRH = isSimulating ? simRH : currentRH;

  const currentWbgt = calculateWBGT(activeTemp, activeRH);
  const level = getHeatStressLevel(currentWbgt);
  const advisory = getHeatStressAdvisory(level, activity);

  // Gauge bar calculation (range 26 to 37)
  const gaugePercent = Math.min(100, Math.max(0, ((currentWbgt - 26) / (37 - 26)) * 100));

  const levelColor =
    level === 'Low'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      : level === 'Moderate'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      : level === 'High'
      ? 'text-orange-400 bg-orange-500/10 border-orange-500/30'
      : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Thermal Strain Model</span>
            <span aria-hidden="true">·</span>
            <span>Wet Bulb Globe Temperature (WBGT)</span>
            <span aria-hidden="true">·</span>
            <span>MSS / NEA Standard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Heat Stress Advisory
          </h2>
        </div>

        <button
          onClick={() => {
            if (!isSimulating) {
              setSimTemp(currentTemp);
              setSimRH(currentRH);
            }
            setIsSimulating(!isSimulating);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer self-start sm:self-auto ${
            isSimulating
              ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isSimulating ? 'Reset to Live Sensors' : 'Test Custom Temp & Humidity'}</span>
        </button>
      </div>

      {/* Simulator Sliders when active */}
      {isSimulating && (
        <div className="my-5 p-4 bg-slate-950 border border-orange-500/30 rounded-xl space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-orange-400 font-semibold uppercase tracking-wider">
              Heat Stress Sandbox Simulator
            </span>
            <span className="text-slate-400">Preview conditions under midday sun or afternoon humidity</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Ambient Air Temperature</span>
                <span className="text-white font-mono font-bold">{simTemp.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="24"
                max="36"
                step="0.5"
                value={simTemp}
                onChange={(e) => setSimTemp(parseFloat(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Relative Humidity</span>
                <span className="text-white font-mono font-bold">{simRH.toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="98"
                step="1"
                value={simRH}
                onChange={(e) => setSimRH(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Meter & Advisory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left: Gauge & Status */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Current Estimated WBGT
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${levelColor}`}>
                {level} Heat Stress
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tabular-nums">
                {currentWbgt.toFixed(1)}
              </span>
              <span className="text-slate-400 text-lg font-medium">°C WBGT</span>
            </div>

            <p className="text-xs text-slate-400 mb-6">
              Calculated using ambient temperature (<span className="text-white font-mono">{activeTemp}°C</span>) and tropical relative humidity (<span className="text-white font-mono">{activeRH}%</span>).
            </p>

            {/* Gauge progress line */}
            <div className="space-y-2 mb-4">
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 relative flex">
                <div className="w-[45%] h-full bg-emerald-500 rounded-l-full" title="Low (<31°C)" />
                <div className="w-[18%] h-full bg-amber-500" title="Moderate (31-33°C)" />
                <div className="w-[18%] h-full bg-orange-500" title="High (33-35°C)" />
                <div className="w-[19%] h-full bg-rose-500 rounded-r-full" title="Extreme (>35°C)" />

                {/* Marker Pin */}
                <div
                  style={{ left: `${gaugePercent}%` }}
                  className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] rounded-full -translate-x-1/2"
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>&lt;31°C Low</span>
                <span>31–33°C Mod</span>
                <span>33–35°C High</span>
                <span>&gt;35°C Extreme</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="block text-[11px] text-slate-400">Target Hydration</span>
              <span className="text-base font-bold text-cyan-400 font-mono mt-0.5 block">
                {advisory.hydrationMlPerHour} ml/hr
              </span>
            </div>
            <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
              <span className="block text-[11px] text-slate-400">Shade Rest Cadence</span>
              <span className="text-base font-bold text-amber-400 font-mono mt-0.5 block">
                Every {advisory.restBreakIntervalMins} mins
              </span>
            </div>
          </div>
        </div>

        {/* Right: Detailed Actionable Guidelines */}
        <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className={`w-4 h-4 ${
                level === 'Low' ? 'text-emerald-400' : 'text-amber-400'
              }`} />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {advisory.headline}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              In Singapore’s equatorial humidity, sweat cannot evaporate rapidly, reducing the body’s primary cooling mechanism. Follow these empirical pacing and thermoregulation guidelines:
            </p>

            <ul className="space-y-2.5 mb-6">
              {advisory.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Athlete Physiological Note */}
          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-200 font-medium">Heart Rate Drift Notice: </span>
              In high WBGT, cardiac drift will elevate heart rate by 8–15 bpm at identical paces. Gauge your workout by perceived exertion (RPE) or power rather than strict target pace.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
