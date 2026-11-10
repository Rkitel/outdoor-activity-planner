import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityType,
  OutdoorRoute,
  RouteMicroclimate
} from './types/weather';
import {
  WeatherTelemetryBundle,
  fetchAllSingaporeWeather,
  calculateRouteMicroclimate,
  generateDayTimeline,
  calculateBestWindow
} from './services/weatherApi';
import { SINGAPORE_ROUTES } from './data/routesData';
import { Header } from './components/Header';
import { BestWindowBanner } from './components/BestWindowBanner';
import { HeatStressCard } from './components/HeatStressCard';
import { HazeSafeCard } from './components/HazeSafeCard';
import { RouteExplorer } from './components/RouteExplorer';
import { InteractiveMap } from './components/InteractiveMap';
import { WorkoutPlannerModal } from './components/WorkoutPlannerModal';
import { FourDayForecastStrip } from './components/FourDayForecastStrip';
import {
  Compass,
  Flame,
  Wind,
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function App() {
  const [weatherBundle, setWeatherBundle] = useState<WeatherTelemetryBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'planner' | 'heat' | 'haze' | 'routes' | 'outlook'>('planner');
  const [activity, setActivity] = useState<ActivityType>('running');
  const [selectedRouteId, setSelectedRouteId] = useState<string>(SINGAPORE_ROUTES[0].id);

  // Modal state
  const [isPlannerOpen, setIsPlannerOpen] = useState<boolean>(false);
  const [plannerRoute, setPlannerRoute] = useState<OutdoorRoute | null>(null);

  // Fetch live weather data
  const loadWeatherData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const bundle = await fetchAllSingaporeWeather();
      setWeatherBundle(bundle);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load live weather:', err);
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeatherData();
    // Auto-refresh every 3 minutes
    const interval = setInterval(() => {
      loadWeatherData();
    }, 180000);
    return () => clearInterval(interval);
  }, []);

  // Compute Islandwide Current Averages
  const currentMetrics = useMemo(() => {
    if (!weatherBundle) {
      return {
        temp: 30.5,
        rh: 75,
        rainfall: 0.0,
        wind: 6.5,
        pm25: 12,
        uv: 5
      };
    }

    // Temp avg
    const tempVals: number[] = (weatherBundle.temperature?.data?.readings?.[0]?.data || []).map((x: { value: number }) => x.value);
    const avgTemp = tempVals.length ? Math.round((tempVals.reduce((a: number, b: number) => a + b, 0) / tempVals.length) * 10) / 10 : 30.2;

    // RH avg
    const rhVals: number[] = (weatherBundle.humidity?.data?.readings?.[0]?.data || []).map((x: { value: number }) => x.value);
    const avgRH = rhVals.length ? Math.round((rhVals.reduce((a: number, b: number) => a + b, 0) / rhVals.length) * 10) / 10 : 78;

    // Rain max / active sum
    const rainVals: number[] = (weatherBundle.rainfall?.data?.readings?.[0]?.data || []).map((x: { value: number }) => x.value);
    const maxRain = rainVals.length ? Math.max(...rainVals) : 0;

    // Wind avg
    const windVals: number[] = (weatherBundle.windSpeed?.data?.readings?.[0]?.data || []).map((x: { value: number }) => x.value);
    const avgWind = windVals.length ? Math.round((windVals.reduce((a: number, b: number) => a + b, 0) / windVals.length) * 10) / 10 : 7.2;

    // PM2.5 max across regions
    const pmReadings = weatherBundle.pm25?.data?.items?.[0]?.readings?.pm25_one_hourly;
    const pmValues: number[] = pmReadings ? (Object.values(pmReadings) as number[]) : [12];
    const maxPM = Math.max(...pmValues);

    // UV latest reading
    const uvIndices = weatherBundle.uv?.data?.records?.[0]?.index || [];
    const latestUV = uvIndices.length ? uvIndices[uvIndices.length - 1].value : 4;

    return {
      temp: avgTemp,
      rh: avgRH,
      rainfall: maxRain,
      wind: avgWind,
      pm25: maxPM,
      uv: latestUV
    };
  }, [weatherBundle]);

  // Compute Micro-climates for all 8 routes
  const routeMicroclimates = useMemo<Record<string, RouteMicroclimate>>(() => {
    const map: Record<string, RouteMicroclimate> = {};
    if (!weatherBundle) return map;

    for (const r of SINGAPORE_ROUTES) {
      map[r.id] = calculateRouteMicroclimate(r, weatherBundle, activity);
    }
    return map;
  }, [weatherBundle, activity]);

  // Generate 24-hr suitability curve
  const timeline = useMemo(() => {
    return generateDayTimeline(weatherBundle || ({} as any), activity);
  }, [weatherBundle, activity]);

  // Best Window calculation
  const bestWindow = useMemo(() => {
    return calculateBestWindow(timeline, activity);
  }, [timeline, activity]);

  const handleOpenPlannerForRoute = (route: OutdoorRoute) => {
    setPlannerRoute(route);
    setIsPlannerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Strict Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPlanner={() => {
          setPlannerRoute(null);
          setIsPlannerOpen(true);
        }}
        isRefreshing={isRefreshing}
        onRefresh={() => loadWeatherData(true)}
        lastUpdated={lastUpdated}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Loading state skeleton if first load */}
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-400">
              Fetching real-time NEA weather stations & air quality sensors...
            </p>
          </div>
        ) : (
          <>
            {/* View 1: Best Windows & Day Timeline (Planner Overview) */}
            {activeTab === 'planner' && (
              <div className="space-y-10">
                {/* Hero Spotlight: Best Running/Cycling Window Today */}
                <BestWindowBanner
                  bestWindow={bestWindow}
                  timeline={timeline}
                  activity={activity}
                  setActivity={setActivity}
                  currentTemp={currentMetrics.temp}
                  currentRH={currentMetrics.rh}
                  currentRainfall={currentMetrics.rainfall}
                  currentWind={currentMetrics.wind}
                  currentPM25={currentMetrics.pm25}
                  currentUV={currentMetrics.uv}
                />

                {/* 2-Column Section: Heat Stress Warning Summary & Haze Safety */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <HeatStressCard
                    currentTemp={currentMetrics.temp}
                    currentRH={currentMetrics.rh}
                    activity={activity}
                  />
                  <HazeSafeCard
                    pm25Data={weatherBundle?.pm25 || null}
                    psiData={weatherBundle?.psi || null}
                  />
                </div>

                {/* Micro-Climate Routes & Map Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-400" />
                        Featured Singapore Outdoor Routes
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Real-time temperature, rainfall, and shade overlays for top courses
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('routes')}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Explore all 8 routes on map</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <InteractiveMap
                    routes={SINGAPORE_ROUTES}
                    selectedRouteId={selectedRouteId}
                    onSelectRoute={(id) => setSelectedRouteId(id)}
                    routeMicroclimates={routeMicroclimates}
                    tempData={weatherBundle?.temperature || null}
                    rainfallData={weatherBundle?.rainfall || null}
                    twoHrData={weatherBundle?.twoHrForecast || null}
                  />

                  <RouteExplorer
                    routes={SINGAPORE_ROUTES.slice(0, 4)}
                    selectedRouteId={selectedRouteId}
                    onSelectRoute={(id) => setSelectedRouteId(id)}
                    routeMicroclimates={routeMicroclimates}
                    activity={activity}
                    onPlanForRoute={handleOpenPlannerForRoute}
                  />
                </div>
              </div>
            )}

            {/* View 2: Heat Stress Deep Dive */}
            {activeTab === 'heat' && (
              <div className="space-y-6">
                <HeatStressCard
                  currentTemp={currentMetrics.temp}
                  currentRH={currentMetrics.rh}
                  activity={activity}
                />

                {/* Educational context for athletes */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                    Why WBGT Matters More Than Ambient Temperature in Singapore
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed">
                    <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                      <strong className="text-white block mb-1">Evaporative Cooling Limit</strong>
                      When relative humidity exceeds 80%, ambient air is nearly saturated with moisture. Sweat does not readily evaporate off the skin, nullifying the body's primary cooling engine.
                    </div>
                    <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                      <strong className="text-white block mb-1">Cardiac Output Demands</strong>
                      The cardiovascular system must divert up to 40% of stroke volume to cutaneous blood vessels near the skin for radiative cooling, reducing blood and oxygen supply to working leg muscles.
                    </div>
                    <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                      <strong className="text-white block mb-1">Practical Pacing Strategy</strong>
                      At WBGT &gt; 31.0°C, adjust aerobic targets by heart rate zones rather than pace. Expect pace to slow by 12–20 seconds per kilometer at the same physiological strain.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View 3: Haze & Air Quality Deep Dive */}
            {activeTab === 'haze' && (
              <div className="space-y-6">
                <HazeSafeCard
                  pm25Data={weatherBundle?.pm25 || null}
                  psiData={weatherBundle?.psi || null}
                />
              </div>
            )}

            {/* View 4: Routes & Micro-Climate Map */}
            {activeTab === 'routes' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Singapore Outdoor Routes & Micro-Climate Station Radar
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Select a route to zoom and inspect localized temperatures, rain sensors, and tree shade profiles.
                  </p>
                </div>

                <InteractiveMap
                  routes={SINGAPORE_ROUTES}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={(id) => setSelectedRouteId(id)}
                  routeMicroclimates={routeMicroclimates}
                  tempData={weatherBundle?.temperature || null}
                  rainfallData={weatherBundle?.rainfall || null}
                  twoHrData={weatherBundle?.twoHrForecast || null}
                />

                <RouteExplorer
                  routes={SINGAPORE_ROUTES}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={(id) => setSelectedRouteId(id)}
                  routeMicroclimates={routeMicroclimates}
                  activity={activity}
                  onPlanForRoute={handleOpenPlannerForRoute}
                />
              </div>
            )}

            {/* View 5: 4-Day Outlook */}
            {activeTab === 'outlook' && (
              <div className="space-y-6">
                <FourDayForecastStrip
                  fourDayData={weatherBundle?.fourDayOutlook || null}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Workout Planner / Slot Simulator Modal */}
      <WorkoutPlannerModal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        routes={SINGAPORE_ROUTES}
        initialRoute={plannerRoute}
        initialActivity={activity}
        timeline={timeline}
        routeMicroclimates={routeMicroclimates}
      />

      {/* Minimal Anti-Slop Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">StrideCast SG</span>
            <span aria-hidden="true">·</span>
            <span>Real-time environmental activity planner for Singapore</span>
          </div>

          <div className="text-slate-500">
            Data sourced live from National Environment Agency (NEA) & Meteorological Service Singapore (MSS) via data.gov.sg
          </div>
        </div>
      </footer>
    </div>
  );
}
