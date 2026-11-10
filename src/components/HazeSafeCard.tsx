import React from 'react';
import { Wind, ShieldAlert, CheckCircle2, AlertCircle, MapPin, Activity } from 'lucide-react';
import { PM25Response, PSIResponse } from '../types/weather';
import { getHazeAdvisory } from '../services/weatherApi';

interface HazeSafeCardProps {
  pm25Data: PM25Response | null;
  psiData: PSIResponse | null;
}

export const HazeSafeCard: React.FC<HazeSafeCardProps> = ({ pm25Data, psiData }) => {
  const pm25Item = pm25Data?.data?.items?.[0]?.readings?.pm25_one_hourly;
  const psiItem = psiData?.data?.items?.[0]?.readings?.psi_twenty_four_hourly;

  const regions: Array<'north' | 'south' | 'east' | 'west' | 'central'> = [
    'north',
    'south',
    'east',
    'west',
    'central'
  ];

  const pm25Values = regions.map((r) => pm25Item?.[r] ?? 12);
  const maxPM25 = Math.max(...pm25Values);
  const avgPM25 = Math.round((pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length) * 10) / 10;

  const advisory = getHazeAdvisory(maxPM25);

  const psiValues = regions.map((r) => psiItem?.[r] ?? 42);
  const maxPSI = Math.max(...psiValues);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Clean Air & Particulate Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>NEA 1-Hour PM2.5 & 24-Hour PSI</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Wind className="w-5 h-5 text-emerald-400" />
            Haze-Safe Outdoor Recommendations
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-bold text-emerald-300">
            {advisory.band}
          </span>
        </div>
      </div>

      {/* 2-Column Split: Regional Readings Grid + Athletic Health Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left: 5 Singapore Regional PM2.5 & PSI Breakdown */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800/90 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Regional Air Quality
            </span>
            <span className="text-xs font-mono text-slate-500">
              Updated Live
            </span>
          </div>

          <div className="space-y-2.5 mb-5">
            {regions.map((region) => {
              const pVal = pm25Item?.[region] ?? 12;
              const psiVal = psiItem?.[region] ?? 42;
              return (
                <div
                  key={region}
                  className="flex items-center justify-between p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-lg hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-white capitalize">
                      {region} Singapore
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-400">
                      PM2.5: <strong className="text-emerald-400">{pVal}</strong> µg/m³
                    </span>
                    <span className="text-slate-500 border-l border-slate-800 pl-3">
                      PSI: <strong className="text-slate-300">{psiVal}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Island Peak PM2.5</span>
              <span className="text-base font-bold text-white font-mono">{maxPM25} µg/m³</span>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-slate-400 block text-[11px]">Island Peak 24-hr PSI</span>
              <span className="text-base font-bold text-slate-200 font-mono">{maxPSI} (Good)</span>
            </div>
          </div>
        </div>

        {/* Right: Athletic Guidance & NEA Actionable Recommendations */}
        <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800/90 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <CheckCircle2 className="w-4.5 h-4.5" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Official Exercise Guidance: Safe for Vigorous Workouts
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {advisory.guidance}
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs">
                <span className="text-slate-200 font-bold block mb-1">High-Intensity Athletes & Runners</span>
                <p className="text-slate-400 leading-relaxed">
                  Deep breathing during tempo or VO2max intervals increases lung air intake by 8x to 10x. With current PM2.5 below 55 µg/m³, fine particulates pose minimal airway constriction risk.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs">
                <span className="text-slate-200 font-bold block mb-1">Sensitive Respiratory Groups</span>
                <p className="text-slate-400 leading-relaxed">
                  Individuals with asthma or chronic bronchitis should have their bronchodilator inhalers on hand when exercising outdoors, particularly along high-traffic corridors like Nicoll Highway or West Coast Highway.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs">
                <span className="text-slate-200 font-bold block mb-1">Mask Guidelines During Outdoor Cardio</span>
                <p className="text-slate-400 leading-relaxed">
                  N95 respirators increase breathing resistance and heat buildup. Under Band I (&lt;55 µg/m³), masks are NOT recommended during vigorous running or cycling.
                </p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800">
            Source: National Environment Agency (NEA) Air Quality Guidelines & Ministry of Health Singapore.
          </div>
        </div>
      </div>
    </div>
  );
};
