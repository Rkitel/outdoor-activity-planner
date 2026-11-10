import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { OutdoorRoute, RouteMicroclimate, WeatherMetricResponse, TwoHrForecastResponse } from '../types/weather';
import { Layers, MapPin, Eye, Compass, CloudRain, Thermometer } from 'lucide-react';

interface InteractiveMapProps {
  routes: OutdoorRoute[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  routeMicroclimates: Record<string, RouteMicroclimate>;
  tempData: WeatherMetricResponse | null;
  rainfallData: WeatherMetricResponse | null;
  twoHrData: TwoHrForecastResponse | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  routeMicroclimates,
  tempData,
  rainfallData,
  twoHrData
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups refs
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const tempLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const rainLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const forecastLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // UI layer visibility toggles
  const [showRoutes, setShowRoutes] = useState(true);
  const [showTempStations, setShowTempStations] = useState(true);
  const [showRainfall, setShowRainfall] = useState(true);
  const [showForecastAreas, setShowForecastAreas] = useState(false);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Singapore center: lat 1.3521, lng 103.8198, zoom 11
    const map = L.map(mapContainerRef.current, {
      center: [1.3521, 103.8198],
      zoom: 12,
      minZoom: 10,
      maxZoom: 17,
      zoomControl: false,
      attributionControl: false
    });

    // Dark sleek CartoDB basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    routesLayerGroupRef.current = L.layerGroup().addTo(map);
    tempLayerGroupRef.current = L.layerGroup().addTo(map);
    rainLayerGroupRef.current = L.layerGroup().addTo(map);
    forecastLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Route Polylines and Markers
  useEffect(() => {
    const lg = routesLayerGroupRef.current;
    if (!lg || !mapInstanceRef.current) return;
    lg.clearLayers();

    if (!showRoutes) return;

    routes.forEach((route) => {
      const isSelected = route.id === selectedRouteId;
      const micro = routeMicroclimates[route.id];

      // Route polyline with clean styling
      const polyline = L.polyline(route.coordinates, {
        color: isSelected ? '#10b981' : '#38bdf8',
        weight: isSelected ? 5 : 3.5,
        opacity: isSelected ? 1 : 0.7,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: route.surface.includes('Trail') ? '6, 6' : undefined
      });

      // Interactive popup
      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 200px;">
          <div style="font-weight: 700; color: #fff; font-size: 13px; margin-bottom: 4px;">
            ${route.name}
          </div>
          <div style="color: #94a3b8; margin-bottom: 8px;">
            ${route.distanceKm} km · ${route.surface} · ${route.shadePercent}% Shade
          </div>
          ${
            micro
              ? `
            <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-family: monospace;">
              <div>Temp: <strong style="color: #fff;">${micro.temp}°C</strong></div>
              <div>Rain: <strong style="color: #38bdf8;">${micro.rainfall} mm</strong></div>
              <div>WBGT: <strong style="color: #f59e0b;">${micro.heatStressWbgt}°C</strong></div>
              <div>Score: <strong style="color: #10b981;">${micro.suitabilityScore}/100</strong></div>
            </div>
            <div style="margin-top: 6px; color: #cbd5e1; font-size: 11px;">
              Forecast: <strong>${micro.forecastText}</strong>
            </div>
          `
              : ''
          }
        </div>
      `;

      polyline.bindPopup(popupHtml);
      polyline.on('click', () => {
        onSelectRoute(route.id);
      });
      polyline.addTo(lg);

      // Route Start Marker
      const startCoord = route.coordinates[0];
      if (startCoord) {
        const markerIcon = L.divIcon({
          className: 'custom-route-icon',
          html: `
            <div style="
              background: ${isSelected ? '#10b981' : '#0284c7'};
              color: #fff;
              width: 22px;
              height: 22px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: bold;
              border: 2px solid #0f172a;
              box-shadow: 0 2px 6px rgba(0,0,0,0.6);
              cursor: pointer;
            ">
              ${route.distanceKm}k
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const marker = L.marker(startCoord, { icon: markerIcon });
        marker.bindPopup(popupHtml);
        marker.on('click', () => onSelectRoute(route.id));
        marker.addTo(lg);
      }
    });
  }, [routes, selectedRouteId, routeMicroclimates, showRoutes, onSelectRoute]);

  // Center on selected route when selectedRouteId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const targetRoute = routes.find((r) => r.id === selectedRouteId);
    if (targetRoute) {
      map.flyTo(targetRoute.center, 13, { duration: 1.2 });
    }
  }, [selectedRouteId, routes]);

  // Update Weather Stations (Air Temperature)
  useEffect(() => {
    const lg = tempLayerGroupRef.current;
    if (!lg) return;
    lg.clearLayers();

    if (!showTempStations || !tempData?.data?.stations || !tempData?.data?.readings) return;

    const readingsMap = new Map<string, number>();
    (tempData.data.readings[0]?.data || []).forEach((r) => readingsMap.set(r.stationId, r.value));

    tempData.data.stations.forEach((station) => {
      const val = readingsMap.get(station.id);
      if (val === undefined || !station.location) return;

      const marker = L.circleMarker([station.location.latitude, station.location.longitude], {
        radius: 12,
        fillColor: val >= 32 ? '#f97316' : val >= 30 ? '#eab308' : '#10b981',
        fillOpacity: 0.85,
        color: '#0f172a',
        weight: 1.5
      });

      marker.bindTooltip(
        `<strong>${station.name}</strong><br/>Temp: ${val}°C`,
        { direction: 'top', className: 'text-xs' }
      );

      marker.addTo(lg);
    });
  }, [tempData, showTempStations]);

  // Update Rainfall Stations
  useEffect(() => {
    const lg = rainLayerGroupRef.current;
    if (!lg) return;
    lg.clearLayers();

    if (!showRainfall || !rainfallData?.data?.stations || !rainfallData?.data?.readings) return;

    const readingsMap = new Map<string, number>();
    (rainfallData.data.readings[0]?.data || []).forEach((r) => readingsMap.set(r.stationId, r.value));

    rainfallData.data.stations.forEach((station) => {
      const val = readingsMap.get(station.id);
      if (val === undefined || !station.location) return;
      if (val <= 0.0) return; // only render stations with active rain detected

      const marker = L.circleMarker([station.location.latitude, station.location.longitude], {
        radius: Math.min(20, Math.max(8, val * 3)),
        fillColor: '#38bdf8',
        fillOpacity: 0.8,
        color: '#0284c7',
        weight: 2
      });

      marker.bindTooltip(
        `<strong>${station.name}</strong><br/>Active Rain: ${val} mm (last 5 min)`,
        { direction: 'top' }
      );

      marker.addTo(lg);
    });
  }, [rainfallData, showRainfall]);

  // Update 2-Hour Forecast Areas
  useEffect(() => {
    const lg = forecastLayerGroupRef.current;
    if (!lg) return;
    lg.clearLayers();

    if (!showForecastAreas || !twoHrData?.data?.area_metadata || !twoHrData?.data?.items?.[0]?.forecasts) return;

    const forecastsMap = new Map<string, string>();
    twoHrData.data.items[0].forecasts.forEach((f) => forecastsMap.set(f.area, f.forecast));

    twoHrData.data.area_metadata.forEach((area) => {
      const forecast = forecastsMap.get(area.name) || 'Partly Cloudy';
      const loc = area.label_location;
      if (!loc) return;

      const isRaining = forecast.toLowerCase().includes('rain') || forecast.toLowerCase().includes('shower');

      const icon = L.divIcon({
        className: 'custom-forecast-pill',
        html: `
          <div style="
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(4px);
            color: ${isRaining ? '#38bdf8' : '#e2e8f0'};
            border: 1px solid ${isRaining ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.15)'};
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.5);
          ">
            ${area.name}: ${forecast}
          </div>
        `,
        iconAnchor: [30, 10]
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon });
      marker.addTo(lg);
    });
  }, [twoHrData, showForecastAreas]);

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Micro-Climate Layer Toggles Header */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 p-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl shadow-lg">
        <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Layers</span>
        </span>

        <button
          onClick={() => setShowRoutes(!showRoutes)}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            showRoutes
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          Routes ({routes.length})
        </button>

        <button
          onClick={() => setShowTempStations(!showTempStations)}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
            showTempStations
              ? 'bg-orange-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Thermometer className="w-3 h-3" />
          <span>Temp Stations</span>
        </button>

        <button
          onClick={() => setShowRainfall(!showRainfall)}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
            showRainfall
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <CloudRain className="w-3 h-3" />
          <span>Live Rain Sensor</span>
        </button>

        <button
          onClick={() => setShowForecastAreas(!showForecastAreas)}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            showForecastAreas
              ? 'bg-blue-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          2-Hr Areas
        </button>
      </div>

      {/* Floating Legend in Bottom Left */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-[11px] shadow-lg max-w-xs hidden sm:block">
        <span className="font-semibold text-slate-300 block mb-1.5 uppercase tracking-wider text-[10px]">
          Micro-Climate Overlays
        </span>
        <div className="space-y-1 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-emerald-400 rounded-full" />
            <span>Selected Activity Route</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-sky-400 rounded-full" />
            <span>Paved / Trail Course</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Active Rain Detected (&gt;0mm)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
            <span>Live Temperature Station</span>
          </div>
        </div>
      </div>
    </div>
  );
};
