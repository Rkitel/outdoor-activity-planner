import React, { useState } from 'react';
import { OutdoorRoute, RouteMicroclimate, ActivityType } from '../types/weather';
import {
  MapPin,
  TrendingUp,
  TreePine,
  Umbrella,
  Thermometer,
  CloudRain,
  Flame,
  ArrowRight,
  Filter,
  Check,
  Compass,
  Navigation
} from 'lucide-react';

interface RouteExplorerProps {
  routes: OutdoorRoute[];
  selectedRouteId: string;
  onSelectRoute: (id: string) => void;
  routeMicroclimates: Record<string, RouteMicroclimate>;
  activity: ActivityType;
  onPlanForRoute: (route: OutdoorRoute) => void;
}

export const RouteExplorer: React.FC<RouteExplorerProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  routeMicroclimates,
  activity,
  onPlanForRoute
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [minShadeFilter, setMinShadeFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRoutes = routes.filter((route) => {
    if (selectedRegion !== 'all' && route.region !== selectedRegion) return false;
    if (minShadeFilter && route.shadePercent < 50) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = route.name.toLowerCase().includes(q);
      const matchDesc = route.description.toLowerCase().includes(q);
      const matchArea = route.forecastAreaName.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchArea) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters & Control bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Region</span>
          </span>

          {['all', 'central', 'east', 'south', 'north'].map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                selectedRegion === region
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {region === 'all' ? 'All Island' : `${region} SG`}
            </button>
          ))}

          <button
            onClick={() => setMinShadeFilter(!minShadeFilter)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              minShadeFilter
                ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <TreePine className="w-3.5 h-3.5" />
            <span>High Shade (&gt;50%)</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search routes or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Route Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredRoutes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          const micro = routeMicroclimates[route.id];

          return (
            <div
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className={`bg-slate-900/90 rounded-2xl p-5 border transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-emerald-500/80 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-500/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Top header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                      <span className="capitalize">{route.region} Singapore</span>
                      <span aria-hidden="true">·</span>
                      <span>{route.forecastAreaName}</span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {route.name}
                    </h3>
                  </div>

                  {micro && (
                    <div className="flex flex-col items-end shrink-0">
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                        micro.suitabilityScore >= 80
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : micro.suitabilityScore >= 60
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {micro.suitabilityScore}/100 Match
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        {micro.forecastText}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-4">
                  {route.description}
                </p>

                {/* Micro-Climate Overlay Data Box */}
                {micro && (
                  <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl mb-4">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Navigation className="w-3 h-3" /> Live Micro-Climate Overlay
                      </span>
                      <span className="text-slate-500 font-mono">
                        {micro.nearestStationName} (~{micro.nearestStationDistKm}km)
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-1.5 bg-slate-900/80 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Air Temp</span>
                        <span className="text-xs font-bold text-white font-mono">{micro.temp}°C</span>
                      </div>
                      <div className="p-1.5 bg-slate-900/80 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Rainfall</span>
                        <span className={`text-xs font-bold font-mono ${
                          micro.rainfall > 0 ? 'text-cyan-400' : 'text-slate-300'
                        }`}>
                          {micro.rainfall} mm
                        </span>
                      </div>
                      <div className="p-1.5 bg-slate-900/80 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Humidity</span>
                        <span className="text-xs font-bold text-white font-mono">{micro.humidity}%</span>
                      </div>
                      <div className="p-1.5 bg-slate-900/80 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">WBGT</span>
                        <span className={`text-xs font-bold font-mono ${
                          micro.heatStressLevel === 'Low' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {micro.heatStressWbgt}°C
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Course Technical Attributes */}
                <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{route.distanceKm} km</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                    <span>+{route.elevationGainM}m vert</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <TreePine className="w-3.5 h-3.5 text-slate-500" />
                    <span>{route.shadePercent}% Shade</span>
                  </div>
                </div>

                {/* Rain Shelter Information */}
                <div className="flex items-start gap-1.5 text-[11px] text-slate-400 mb-4 bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                  <Umbrella className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">
                    <strong className="text-slate-300">Shelter:</strong> {route.shelterPoints}
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Surface: {route.surface}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRoute(route.id);
                    }}
                    className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                  >
                    View Map
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlanForRoute(route);
                    }}
                    className="px-3 py-1 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Plan Slot</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
