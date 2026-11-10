import React, { useState } from 'react';
import { OutdoorRoute, ActivityType, HourSlotForecast, RouteMicroclimate } from '../types/weather';
import {
  X,
  Compass,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Thermometer,
  Flame,
  Droplets,
  CloudRain,
  Wind,
  ShieldCheck,
  PackageCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { calculateWBGT, getHeatStressLevel } from '../services/weatherApi';

interface WorkoutPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: OutdoorRoute[];
  initialRoute?: OutdoorRoute | null;
  initialActivity?: ActivityType;
  timeline: HourSlotForecast[];
  routeMicroclimates: Record<string, RouteMicroclimate>;
}

export const WorkoutPlannerModal: React.FC<WorkoutPlannerModalProps> = ({
  isOpen,
  onClose,
  routes,
  initialRoute,
  initialActivity = 'running',
  timeline,
  routeMicroclimates
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(initialRoute?.id || routes[0]?.id || '');
  const [activity, setActivity] = useState<ActivityType>(initialActivity);
  const [selectedHour, setSelectedHour] = useState<number>(7); // default 7 AM
  const [durationMins, setDurationMins] = useState<number>(60);

  if (!isOpen) return null;

  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const micro = currentRoute ? routeMicroclimates[currentRoute.id] : null;

  // Forecast for selected hour
  const slot = timeline.find((s) => s.hour === selectedHour) || timeline[0];

  const estTemp = slot ? slot.temp : 28;
  const estRH = slot ? slot.humidity : 80;
  const estWBGT = calculateWBGT(estTemp, estRH);
  const heatLevel = getHeatStressLevel(estWBGT);
  const rainProb = slot ? slot.rainProbability : 20;

  // Compute Session Verdict
  let verdict: 'optimal' | 'caution' | 'not-recommended' = 'optimal';
  let verdictTitle = 'Prime Window — Full Go!';
  let verdictReason = 'Low thermal strain and favorable meteorological conditions for high-intensity training.';

  if (rainProb >= 50 || estWBGT >= 33.5) {
    verdict = 'not-recommended';
    verdictTitle = 'Not Recommended — High Risk Window';
    verdictReason = rainProb >= 50
      ? `High probability of torrential showers (${rainProb}%) and wet surfaces.`
      : `Elevated Heat Stress (WBGT ${estWBGT}°C). High danger of core overheating and dehydration.`;
  } else if (rainProb >= 25 || estWBGT >= 31.0 || estTemp >= 31) {
    verdict = 'caution';
    verdictTitle = 'Proceed with Caution';
    verdictReason = `Moderate thermal stress (WBGT ${estWBGT}°C) and warm temperatures. Maintain active hydration and adjust pacing.`;
  }

  // Calculate recommended hydration based on duration and heat
  const mlPerMin = estWBGT >= 33 ? 16 : estWBGT >= 31 ? 12 : 8;
  const totalWaterMl = Math.round((durationMins * mlPerMin) / 50) * 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Dynamic Activity Simulator</span>
            <span aria-hidden="true">·</span>
            <span>Micro-Climate Forecast Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            Plan Outdoor Workout Slot
          </h2>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Target Route */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Route
            </label>
            <select
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.distanceKm} km · {r.region})
                </option>
              ))}
            </select>
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Discipline
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl">
              {(['running', 'cycling', 'hiking'] as ActivityType[]).map((act) => (
                <button
                  key={act}
                  onClick={() => setActivity(act)}
                  className={`py-1 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                    activity === act
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

          {/* Departure Hour */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Planned Start Time: <strong className="text-emerald-400 font-mono">{selectedHour.toString().padStart(2, '0')}:00</strong>
            </label>
            <input
              type="range"
              min="5"
              max="22"
              step="1"
              value={selectedHour}
              onChange={(e) => setSelectedHour(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>05:00 Dawn</span>
              <span>12:00 Noon</span>
              <span>18:00 Dusk</span>
              <span>22:00 Night</span>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Duration
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDurationMins(mins)}
                  className={`py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    durationMins === mins
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Verdict Banner */}
        <div className={`p-4 rounded-xl border mb-6 ${
          verdict === 'optimal'
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : verdict === 'caution'
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-rose-500/10 border-rose-500/30'
        }`}>
          <div className="flex items-start gap-3">
            {verdict === 'optimal' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : verdict === 'caution' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}

            <div>
              <h4 className={`text-sm font-bold ${
                verdict === 'optimal'
                  ? 'text-emerald-400'
                  : verdict === 'caution'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}>
                {verdictTitle}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {verdictReason}
              </p>
            </div>
          </div>
        </div>

        {/* Expected Weather Snapshot */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
            Expected Environmental Telemetry at {selectedHour}:00
          </span>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-900/60 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Predicted Temp</span>
              <span className="text-sm font-bold text-white font-mono mt-0.5 block">{estTemp}°C</span>
            </div>
            <div className="p-2 bg-slate-900/60 rounded-lg">
              <span className="text-slate-400 block text-[10px]">WBGT Strain</span>
              <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">{estWBGT}°C</span>
            </div>
            <div className="p-2 bg-slate-900/60 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Rain Probability</span>
              <span className="text-sm font-bold text-cyan-400 font-mono mt-0.5 block">{rainProb}%</span>
            </div>
            <div className="p-2 bg-slate-900/60 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Route Shade</span>
              <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">{currentRoute?.shadePercent}%</span>
            </div>
          </div>
        </div>

        {/* Required Athlete Checklist & Gear */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-2.5">
            <PackageCheck className="w-4 h-4 text-emerald-400" />
            <span>Prescribed Gear & Hydration Pack</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Hydration Target: <strong>{totalWaterMl} ml</strong> {estWBGT > 31 ? 'with electrolytes (sodium & magnesium)' : 'water'}.</span>
            </li>
            {selectedHour >= 18 || selectedHour <= 6 ? (
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                <span>Lighting: Active headlamp or front/rear bike blinking lights (mandatory along dark park connectors).</span>
              </li>
            ) : null}
            {slot?.uvIndex && slot.uvIndex >= 4 ? (
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Sun Protection: Broad-spectrum sweatproof SPF50+ sunscreen and UV sports sunglasses.</span>
              </li>
            ) : null}
            {currentRoute?.surface.includes('Trail') ? (
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Footwear: Lugged trail shoes recommended for damp roots and unpaved clay track.</span>
              </li>
            ) : null}
          </ul>
        </div>

        {/* Action button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
