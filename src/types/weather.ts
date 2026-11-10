export interface StationLocation {
  latitude: number;
  longitude: number;
}

export interface WeatherStation {
  id: string;
  deviceId?: string;
  name: string;
  location: StationLocation;
}

export interface StationReading {
  stationId: string;
  value: number;
}

export interface WeatherMetricResponse {
  code: number;
  data: {
    stations: WeatherStation[];
    readings: Array<{
      timestamp: string;
      data: StationReading[];
    }>;
    readingType?: string;
    readingUnit?: string;
  };
}

export interface TwoHrForecastArea {
  name: string;
  label_location: StationLocation;
}

export interface TwoHrForecastItem {
  area: string;
  forecast: string;
}

export interface TwoHrForecastResponse {
  code: number;
  data: {
    area_metadata: TwoHrForecastArea[];
    items: Array<{
      update_timestamp: string;
      timestamp: string;
      valid_period: {
        start: string;
        end: string;
        text: string;
      };
      forecasts: TwoHrForecastItem[];
    }>;
  };
}

export interface RegionalForecast {
  code: string;
  text: string;
}

export interface TwentyFourHrPeriod {
  regions: {
    east: RegionalForecast;
    west: RegionalForecast;
    north: RegionalForecast;
    south: RegionalForecast;
    central: RegionalForecast;
  };
  timePeriod: {
    text: string;
    start: string;
    end: string;
  };
}

export interface TwentyFourHrResponse {
  code: number;
  data: {
    records: Array<{
      date: string;
      updatedTimestamp: string;
      timestamp: string;
      general: {
        validPeriod: {
          start: string;
          end: string;
          text: string;
        };
        temperature: { high: number; low: number; unit: string };
        relativeHumidity: { high: number; low: number; unit: string };
        wind: { direction: string; speed: { low: number; high: number } };
        forecast: { code: string; text: string };
      };
      periods: TwentyFourHrPeriod[];
    }>;
  };
}

export interface FourDayRecord {
  day: string;
  forecast: {
    code: string;
    summary: string;
    text: string;
  };
  relativeHumidity: { high: number; low: number; unit: string };
  temperature: { high: number; low: number; unit: string };
  timestamp: string;
  wind: { direction: string; speed: { high: number; low: number } };
}

export interface FourDayResponse {
  code: number;
  data: {
    records: Array<{
      forecasts: FourDayRecord[];
    }>;
  };
}

export interface RegionalReadings {
  north: number;
  south: number;
  east: number;
  west: number;
  central: number;
  national?: number;
}

export interface PM25Response {
  code: number;
  data: {
    regionMetadata: Array<{
      name: string;
      labelLocation: StationLocation;
    }>;
    items: Array<{
      date: string;
      updatedTimestamp: string;
      timestamp: string;
      readings: {
        pm25_one_hourly: RegionalReadings;
      };
    }>;
  };
}

export interface PSIResponse {
  code: number;
  data: {
    regionMetadata: Array<{
      name: string;
      labelLocation: StationLocation;
    }>;
    items: Array<{
      date: string;
      updatedTimestamp: string;
      timestamp: string;
      readings: {
        psi_twenty_four_hourly: RegionalReadings;
        pm25_twenty_four_hourly?: RegionalReadings;
        pm10_twenty_four_hourly?: RegionalReadings;
        o3_eight_hour_max?: RegionalReadings;
      };
    }>;
  };
}

export interface UVResponse {
  code: number;
  data: {
    records: Array<{
      date: string;
      updatedTimestamp: string;
      timestamp: string;
      index: Array<{
        hour: string;
        value: number;
      }>;
    }>;
  };
}

export type ActivityType = 'running' | 'cycling' | 'hiking';

export interface RouteMicroclimate {
  temp: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  forecastText: string;
  nearestStationName: string;
  nearestStationDistKm: number;
  suitabilityScore: number;
  heatStressLevel: 'Low' | 'Moderate' | 'High' | 'Extreme';
  heatStressWbgt: number;
}

export interface OutdoorRoute {
  id: string;
  name: string;
  region: 'central' | 'south' | 'east' | 'west' | 'north';
  distanceKm: number;
  elevationGainM: number;
  surface: 'Paved' | 'Gravel / Trail' | 'Boardwalk & Paved' | 'Mixed';
  shadePercent: number; // 0 to 100
  shelterPoints: string;
  description: string;
  highlights: string[];
  coordinates: Array<[number, number]>; // [lat, lng]
  center: [number, number];
  forecastAreaName: string; // matches 2-hr forecast area
}

export interface HourSlotForecast {
  hour: number;
  timeLabel: string;
  temp: number;
  humidity: number;
  heatIndex: number;
  wbgt: number;
  rainProbability: number;
  forecastSummary: string;
  uvIndex: number;
  windSpeed: number;
  score: number; // 0 - 100
  isRecommended: boolean;
  verdictText: string;
}

export interface BestWindow {
  activity: ActivityType;
  startTime: string;
  endTime: string;
  periodName: string; // e.g. "Early Morning Dawn Patrol", "Golden Hour Sunset Stride"
  score: number;
  reason: string;
  avgTemp: number;
  avgHumidity: number;
  rainRisk: 'Very Low' | 'Low' | 'Moderate' | 'High';
  heatStressLevel: 'Low' | 'Moderate' | 'High' | 'Extreme';
}
