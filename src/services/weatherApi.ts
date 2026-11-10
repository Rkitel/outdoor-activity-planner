import {
  WeatherMetricResponse,
  TwoHrForecastResponse,
  TwentyFourHrResponse,
  FourDayResponse,
  PM25Response,
  PSIResponse,
  UVResponse,
  WeatherStation,
  OutdoorRoute,
  RouteMicroclimate,
  HourSlotForecast,
  BestWindow,
  ActivityType
} from '../types/weather';

const API_BASE = 'https://api-open.data.gov.sg/v2/real-time/api';

export interface WeatherTelemetryBundle {
  twoHrForecast: TwoHrForecastResponse | null;
  twentyFourHrForecast: TwentyFourHrResponse | null;
  fourDayOutlook: FourDayResponse | null;
  temperature: WeatherMetricResponse | null;
  rainfall: WeatherMetricResponse | null;
  humidity: WeatherMetricResponse | null;
  windSpeed: WeatherMetricResponse | null;
  pm25: PM25Response | null;
  psi: PSIResponse | null;
  uv: UVResponse | null;
  lastUpdated: Date;
  isMockFallback?: boolean;
}

// Distance helper using Haversine formula
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Simplified Wet Bulb Globe Temperature (WBGT) estimation based on Australian Bureau of Meteorology & Singapore MSS models
// e: water vapor pressure (hPa) = (RH / 100) * 6.105 * exp(17.27 * Ta / (237.7 + Ta))
// WBGT = 0.567 * Ta + 0.393 * e + 3.94
export function calculateWBGT(tempC: number, rhPercent: number): number {
  const e = (rhPercent / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
  const wbgt = 0.567 * tempC + 0.393 * e + 3.94;
  return Math.round(wbgt * 10) / 10;
}

export function getHeatStressLevel(wbgt: number): 'Low' | 'Moderate' | 'High' | 'Extreme' {
  if (wbgt < 31.0) return 'Low';
  if (wbgt < 33.0) return 'Moderate';
  if (wbgt < 35.0) return 'High';
  return 'Extreme';
}

export function getHeatStressAdvisory(level: 'Low' | 'Moderate' | 'High' | 'Extreme', activity: ActivityType): {
  headline: string;
  hydrationMlPerHour: number;
  restBreakIntervalMins: number;
  recommendations: string[];
} {
  switch (level) {
    case 'Low':
      return {
        headline: 'Normal Thermal Conditions',
        hydrationMlPerHour: 400,
        restBreakIntervalMins: 45,
        recommendations: [
          'Safe for standard pacing and high-intensity interval workouts.',
          'Carry minimum 500ml water for sessions longer than 45 minutes.',
          'Maintain regular sun protection during daylight.'
        ]
      };
    case 'Moderate':
      return {
        headline: 'Moderate Heat Stress Advisory',
        hydrationMlPerHour: 600,
        restBreakIntervalMins: 30,
        recommendations: [
          'Pre-hydrate with 250ml water 15 minutes before starting.',
          'Take short 2-minute shaded rest breaks every 25–30 minutes.',
          activity === 'running'
            ? 'Adjust target marathon/tempo pace by +10–15 sec/km to manage core temp.'
            : 'Maintain constant airflow on bike; don’t draft in still air for prolonged periods.',
          'Wear breathable, light-colored technical gear and cap.'
        ]
      };
    case 'High':
      return {
        headline: 'High Heat Stress Alert',
        hydrationMlPerHour: 900,
        restBreakIntervalMins: 20,
        recommendations: [
          'High risk of heat cramps, exhaustion, and dehydration.',
          'Shift strenuous training to early morning before 8:30 AM or after 7:00 PM.',
          'Drink electrolyte fluids every 15–20 minutes even if not feeling thirsty.',
          'Choose shaded tree-canopy routes (e.g., MacRitchie, Rail Corridor) or covered paths.',
          'Monitor for dizziness, nausea, headache, or cessation of sweating.'
        ]
      };
    case 'Extreme':
      return {
        headline: 'Extreme Heat Stress Warning',
        hydrationMlPerHour: 1200,
        restBreakIntervalMins: 15,
        recommendations: [
          'Dangerous conditions for vigorous outdoor cardiovascular exertion.',
          'Postpone tempo/threshold workouts or migrate to indoor treadmill/trainer.',
          'If outdoors, strictly limit to low-exertion recovery walks with constant ice/hydration access.'
        ]
      };
  }
}

export function getHazeAdvisory(pm25: number): {
  band: 'Band I (Normal)' | 'Band II (Elevated)' | 'Band III (High)' | 'Band IV (Very High)';
  color: string;
  guidance: string;
} {
  if (pm25 <= 55) {
    return {
      band: 'Band I (Normal)',
      color: 'emerald',
      guidance: 'Air quality is normal. Safe for normal outdoor aerobic training, hill repeats, and long endurance rides.'
    };
  }
  if (pm25 <= 150) {
    return {
      band: 'Band II (Elevated)',
      color: 'amber',
      guidance: 'Elevated particulate concentration. Healthy individuals can exercise outdoors; reduce intensity if coughing or feeling throat irritation. Sensitive groups reduce strenuous outdoor activity.'
    };
  }
  if (pm25 <= 250) {
    return {
      band: 'Band III (High)',
      color: 'orange',
      guidance: 'High air pollution. Minimize strenuous outdoor exertion. Switch workouts to indoor gym or treadmill with air filtration.'
    };
  }
  return {
    band: 'Band IV (Very High)',
    color: 'rose',
    guidance: 'Air quality is hazardous. Avoid all outdoor aerobic exercise. Stay indoors.'
  };
}

// Fetch helper with timeout
async function fetchWithTimeout<T>(url: string, timeoutMs = 8000): Promise<T | null> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) {
      console.warn(`Fetch to ${url} failed with status: ${res.status}`);
      return null;
    }
    const json = await res.json();
    return json as T;
  } catch (err) {
    clearTimeout(id);
    console.warn(`Fetch error for ${url}:`, err);
    return null;
  }
}

// Fetch all live bundles
export async function fetchAllSingaporeWeather(): Promise<WeatherTelemetryBundle> {
  const [
    twoHr,
    twentyFourHr,
    fourDay,
    temp,
    rain,
    hum,
    wind,
    pm25,
    psi,
    uv
  ] = await Promise.all([
    fetchWithTimeout<TwoHrForecastResponse>(`${API_BASE}/two-hr-forecast`),
    fetchWithTimeout<TwentyFourHrResponse>(`${API_BASE}/twenty-four-hr-forecast`),
    fetchWithTimeout<FourDayResponse>(`${API_BASE}/four-day-outlook`),
    fetchWithTimeout<WeatherMetricResponse>(`${API_BASE}/air-temperature`),
    fetchWithTimeout<WeatherMetricResponse>(`${API_BASE}/rainfall`),
    fetchWithTimeout<WeatherMetricResponse>(`${API_BASE}/relative-humidity`),
    fetchWithTimeout<WeatherMetricResponse>(`${API_BASE}/wind-speed`),
    fetchWithTimeout<PM25Response>(`${API_BASE}/pm25`),
    fetchWithTimeout<PSIResponse>(`${API_BASE}/psi`),
    fetchWithTimeout<UVResponse>(`${API_BASE}/uv`)
  ]);

  return {
    twoHrForecast: twoHr,
    twentyFourHrForecast: twentyFourHr,
    fourDayOutlook: fourDay,
    temperature: temp,
    rainfall: rain,
    humidity: hum,
    windSpeed: wind,
    pm25,
    psi,
    uv,
    lastUpdated: new Date()
  };
}

// Extract closest weather station reading for a specific lat/lng
export function getClosestStationReading(
  lat: number,
  lng: number,
  metricData: WeatherMetricResponse | null
): { value: number; stationName: string; stationId: string; distanceKm: number } {
  if (!metricData || !metricData.data || !metricData.data.stations || !metricData.data.readings) {
    return { value: 29.5, stationName: 'Singapore Central', stationId: 'S00', distanceKm: 5.0 };
  }

  const latestReadingMap = new Map<string, number>();
  const latestReadings = metricData.data.readings[0]?.data || [];
  for (const item of latestReadings) {
    latestReadingMap.set(item.stationId, item.value);
  }

  let closestStation: WeatherStation | null = null;
  let minDistance = Infinity;

  for (const station of metricData.data.stations) {
    if (!station.location) continue;
    // ensure station has an active reading
    if (!latestReadingMap.has(station.id)) continue;

    const dist = haversineDistanceKm(lat, lng, station.location.latitude, station.location.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closestStation = station;
    }
  }

  if (closestStation && latestReadingMap.has(closestStation.id)) {
    return {
      value: latestReadingMap.get(closestStation.id)!,
      stationName: closestStation.name,
      stationId: closestStation.id,
      distanceKm: minDistance
    };
  }

  // fallback to average of all active stations
  const values = Array.from(latestReadingMap.values());
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 29.5;
  return {
    value: Math.round(avg * 10) / 10,
    stationName: 'Islandwide Average',
    stationId: 'SG_AVG',
    distanceKm: 8.0
  };
}

// Get 2-hr forecast for a given area or closest area
export function getForecastForArea(
  areaName: string,
  twoHrData: TwoHrForecastResponse | null
): string {
  if (!twoHrData?.data?.items?.[0]?.forecasts) {
    return 'Partly Cloudy';
  }

  const forecasts = twoHrData.data.items[0].forecasts;
  const match = forecasts.find(
    (f) => f.area.toLowerCase() === areaName.toLowerCase()
  );
  if (match) return match.forecast;

  // find partial match
  const partial = forecasts.find((f) =>
    f.area.toLowerCase().includes(areaName.toLowerCase()) ||
    areaName.toLowerCase().includes(f.area.toLowerCase())
  );
  if (partial) return partial.forecast;

  return forecasts[0]?.forecast || 'Partly Cloudy';
}

// Compute microclimate metrics for a route
export function calculateRouteMicroclimate(
  route: OutdoorRoute,
  bundle: WeatherTelemetryBundle,
  activity: ActivityType = 'running'
): RouteMicroclimate {
  const [lat, lng] = route.center;

  const tempReading = getClosestStationReading(lat, lng, bundle.temperature);
  const rhReading = getClosestStationReading(lat, lng, bundle.humidity);
  const rainReading = getClosestStationReading(lat, lng, bundle.rainfall);
  const windReading = getClosestStationReading(lat, lng, bundle.windSpeed);
  const forecastText = getForecastForArea(route.forecastAreaName, bundle.twoHrForecast);

  const temp = tempReading.value || 30.5;
  const humidity = rhReading.value || 75;
  const rainfall = rainReading.value || 0;
  const windSpeed = windReading.value || 6.5;

  const wbgt = calculateWBGT(temp, humidity);
  const heatStressLevel = getHeatStressLevel(wbgt);

  // Compute 0-100 Suitability score
  let score = 100;

  // Penalty for heat stress
  if (wbgt >= 34.0) score -= 35;
  else if (wbgt >= 32.5) score -= 22;
  else if (wbgt >= 31.0) score -= 12;
  else if (wbgt >= 29.0) score -= 5;

  // Penalty for rain
  if (rainfall > 5.0) score -= 45;
  else if (rainfall > 1.0) score -= 25;
  else if (rainfall > 0.0) score -= 15;

  // Forecast text penalties
  const lowerForecast = forecastText.toLowerCase();
  if (lowerForecast.includes('thundery') || lowerForecast.includes('heavy rain')) score -= 40;
  else if (lowerForecast.includes('showers') || lowerForecast.includes('rain')) score -= 25;

  // Wind penalties
  if (activity === 'cycling') {
    if (windSpeed > 22) score -= 25;
    else if (windSpeed > 15) score -= 10;
  } else {
    // runners enjoy light-to-moderate breeze (5-15 km/h)
    if (windSpeed >= 5 && windSpeed <= 16) score += 4;
    else if (windSpeed > 25) score -= 15;
  }

  // Route specific bonuses:
  // Shade bonus during warm days
  if (temp > 30 && route.shadePercent >= 60) score += 6;
  if (temp > 32 && route.shadePercent <= 25) score -= 8;

  score = Math.max(15, Math.min(98, Math.round(score)));

  return {
    temp,
    humidity,
    rainfall,
    windSpeed,
    forecastText,
    nearestStationName: tempReading.stationName,
    nearestStationDistKm: tempReading.distanceKm,
    suitabilityScore: score,
    heatStressLevel,
    heatStressWbgt: wbgt
  };
}

// Generate the 24-hour workout suitability curve for today
export function generateDayTimeline(
  bundle: WeatherTelemetryBundle,
  activity: ActivityType = 'running'
): HourSlotForecast[] {
  // Extract general forecast highs/lows if available
  const gen = bundle.twentyFourHrForecast?.data?.records?.[0]?.general;
  const highTemp = gen?.temperature?.high ?? 33;
  const lowTemp = gen?.temperature?.low ?? 25;
  const highRH = gen?.relativeHumidity?.high ?? 95;
  const lowRH = gen?.relativeHumidity?.low ?? 60;
  const windLow = gen?.wind?.speed?.low ?? 5;
  const windHigh = gen?.wind?.speed?.high ?? 15;

  const currentHour = new Date().getHours();

  const slots: HourSlotForecast[] = [];

  for (let h = 5; h <= 23; h++) {
    // Diurnal temperature curve modeling for Singapore (min at 06:30, max at 14:30)
    // Normalized diurnal phase:
    let tempFraction: number;
    if (h >= 6 && h <= 14) {
      tempFraction = Math.sin(((h - 6) / 8) * (Math.PI / 2));
    } else if (h > 14) {
      tempFraction = Math.cos(((h - 14) / 10) * (Math.PI / 2));
    } else {
      tempFraction = 0.05;
    }
    const temp = Math.round((lowTemp + (highTemp - lowTemp) * tempFraction) * 10) / 10;
    // Humidity is inverse of temperature
    const humidity = Math.round((highRH - (highRH - lowRH) * tempFraction) * 10) / 10;
    const wbgt = calculateWBGT(temp, humidity);

    // UV Index curve (peaks at noon 12:00-14:00, 0 before 07:00 and after 18:30)
    let uvIndex = 0;
    if (h >= 8 && h <= 17) {
      const uvPeak = 11;
      uvIndex = Math.round(uvPeak * Math.sin(((h - 7) / 11) * Math.PI));
    }

    // Wind speed
    const windSpeed = Math.round((windLow + (windHigh - windLow) * Math.sin(((h - 6) / 12) * Math.PI)) * 10) / 10;

    // Rain probability in Singapore typically peaks in early-to-mid afternoon (13:00 - 17:00) during monsoon / inter-monsoon
    let rainProb = 15;
    let forecastSummary = 'Partly Cloudy';

    if (h >= 13 && h <= 17) {
      rainProb = 55;
      forecastSummary = 'Afternoon Thundery Showers';
    } else if (h >= 18 && h <= 20) {
      rainProb = 25;
      forecastSummary = 'Passing Showers / Overcast';
    } else if (h >= 5 && h <= 9) {
      rainProb = 10;
      forecastSummary = 'Fair & Clear Dawn';
    } else {
      rainProb = 18;
      forecastSummary = 'Partly Cloudy';
    }

    // Suitability score 0 - 100
    let score = 95;

    // Thermal / WBGT
    if (wbgt >= 33.5) score -= 38;
    else if (wbgt >= 32.0) score -= 25;
    else if (wbgt >= 30.5) score -= 12;

    // UV penalty
    if (uvIndex >= 8) score -= 18;
    else if (uvIndex >= 5) score -= 8;

    // Rain penalty
    if (rainProb >= 50) score -= 30;
    else if (rainProb >= 30) score -= 15;

    // Activity specific adjustments
    if (activity === 'cycling') {
      if (rainProb > 40) score -= 15; // wet roads are hazardous for bikes
      if (temp < 29 && uvIndex < 4) score += 6;
    } else if (activity === 'running') {
      if (h <= 8 || h >= 19) score += 8; // runners love low core temp
      if (temp > 31) score -= 10;
    } else {
      // hiking
      if (rainProb > 40) score -= 25; // muddy trails
    }

    score = Math.max(18, Math.min(99, Math.round(score)));

    const isRecommended = score >= 75;

    let verdictText = 'Good for Training';
    if (score >= 85) verdictText = 'Prime Window - Optimal!';
    else if (score >= 70) verdictText = 'Pleasant - Stay Hydrated';
    else if (score >= 50) verdictText = 'Challenging Heat & Humidity';
    else verdictText = 'High Rain/Heat Risk - Caution';

    const timeLabel = `${h.toString().padStart(2, '0')}:00`;

    slots.push({
      hour: h,
      timeLabel,
      temp,
      humidity,
      heatIndex: Math.round(temp + 0.55 * (humidity / 100) * (temp - 14.5)),
      wbgt,
      rainProbability: rainProb,
      forecastSummary,
      uvIndex,
      windSpeed,
      score,
      isRecommended,
      verdictText
    });
  }

  return slots;
}

// Calculate the absolute "Best Running / Cycling Window Today"
export function calculateBestWindow(
  timeline: HourSlotForecast[],
  activity: ActivityType
): BestWindow {
  // We want to find a contiguous block of at least 2 hours with the highest average score
  let bestAvg = -1;
  let bestStartIdx = 0;
  let bestEndIdx = 2;

  for (let i = 0; i <= timeline.length - 2; i++) {
    const avg = (timeline[i].score + timeline[i + 1].score) / 2;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestStartIdx = i;
      bestEndIdx = i + 2;
    }
  }

  const startSlot = timeline[bestStartIdx];
  const endSlot = timeline[Math.min(timeline.length - 1, bestEndIdx)];

  const windowSlots = timeline.slice(bestStartIdx, bestEndIdx);
  const avgTemp = Math.round((windowSlots.reduce((s, x) => s + x.temp, 0) / windowSlots.length) * 10) / 10;
  const avgHum = Math.round((windowSlots.reduce((s, x) => s + x.humidity, 0) / windowSlots.length) * 10) / 10;
  const maxWbgt = Math.max(...windowSlots.map((x) => x.wbgt));

  let periodName = 'Dawn Patrol';
  if (startSlot.hour >= 5 && startSlot.hour < 9) {
    periodName = activity === 'cycling' ? 'Dawn Peloton Window' : 'Early Morning Sunrise Stride';
  } else if (startSlot.hour >= 18) {
    periodName = activity === 'cycling' ? 'Twilight Coastal Cruise' : 'Dusk Cooler Horizon Run';
  } else if (startSlot.hour >= 9 && startSlot.hour < 12) {
    periodName = 'Late Morning Aerobic Block';
  } else {
    periodName = 'Post-Shower Cooler Window';
  }

  const rainRisk = windowSlots.some((x) => x.rainProbability >= 45)
    ? 'Moderate'
    : windowSlots.some((x) => x.rainProbability >= 25)
    ? 'Low'
    : 'Very Low';

  return {
    activity,
    startTime: startSlot.timeLabel,
    endTime: endSlot ? `${endSlot.hour}:30` : `${startSlot.hour + 2}:00`,
    periodName,
    score: Math.round(bestAvg),
    reason: `Lowest heat stress of the day (${avgTemp}°C, WBGT ${maxWbgt}°C) with only ${rainRisk.toLowerCase()} rain probability and minimal UV exposure.`,
    avgTemp,
    avgHumidity: avgHum,
    rainRisk,
    heatStressLevel: getHeatStressLevel(maxWbgt)
  };
}
