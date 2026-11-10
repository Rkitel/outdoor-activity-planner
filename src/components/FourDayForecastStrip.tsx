import React from 'react';
import { FourDayResponse, FourDayRecord } from '../types/weather';
import { Calendar, Sun, CloudRain, Wind, Droplets, Thermometer, ShieldCheck } from 'lucide-react';

interface FourDayForecastStripProps {
  fourDayData: FourDayResponse | null;
}

export const FourDayForecastStrip: React.FC<FourDayForecastStripProps> = ({ fourDayData }) => {
  const forecasts: FourDayRecord[] = fourDayData?.data?.records?.[0]?.forecasts || [];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Extended Horizon Planning</span>
            <span aria-hidden="true">·</span>
            <span>Weekend Long Runs & Century Rides</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            4-Day Outdoor Training Outlook
          </h2>
        </div>

        <span className="text-xs text-slate-400 font-mono self-start sm:self-auto">
          MSS 4-Day Forecast
        </span>
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {forecasts.length === 0 ? (
          <div className="col-span-4 text-center py-12 text-slate-500 text-xs">
            Loading extended outlook...
          </div>
        ) : (
          forecasts.map((item, idx) => {
            const isRainy = item.forecast.text.toLowerCase().includes('shower') || item.forecast.text.toLowerCase().includes('rain');
            const isHeavy = item.forecast.text.toLowerCase().includes('thundery');

            return (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-white">
                      {item.day}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isHeavy
                        ? 'bg-rose-500/20 text-rose-400'
                        : isRainy
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {item.forecast.code || 'FC'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {isRainy ? (
                      <CloudRain className="w-5 h-5 text-blue-400 shrink-0" />
                    ) : (
                      <Sun className="w-5 h-5 text-yellow-400 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {item.forecast.summary || item.forecast.text}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Temp Range
                      </span>
                      <span className="text-white font-mono font-medium">
                        {item.temperature.low}°C – {item.temperature.high}°C
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Humidity
                      </span>
                      <span className="text-white font-mono font-medium">
                        {item.relativeHumidity.low}% – {item.relativeHumidity.high}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Wind className="w-3.5 h-3.5 text-teal-400" /> Wind
                      </span>
                      <span className="text-white font-mono font-medium">
                        {item.wind.speed.low}–{item.wind.speed.high} km/h
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-300">
                  <span className="text-emerald-400 font-semibold block mb-0.5">Recommended Strategy:</span>
                  {isHeavy
                    ? 'Schedule long runs before 11:00 AM to avoid afternoon lightning risk.'
                    : 'Optimal morning conditions; pack extra hydration for high humidity.'}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
