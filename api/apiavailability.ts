/**
 * Serverless Function: /api/apiavailability
 * Tests and benchmarks real-time availability, response latency, and payload integrity
 * for all 10 Singapore Meteorological & Environmental endpoints from data.gov.sg.
 * Compatible with Vercel Serverless Functions, Netlify, Express, and Edge runtimes.
 */

export interface EndpointConfig {
  id: string;
  name: string;
  url: string;
  description: string;
}

export interface EndpointAvailability {
  id: string;
  name: string;
  url: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  httpStatus: number | null;
  latencyMs: number;
  dataRecordsCount?: number;
  errorMessage?: string;
  testedAt: string;
}

export interface ApiAvailabilitySummary {
  timestamp: string;
  totalEndpoints: number;
  onlineCount: number;
  degradedCount: number;
  offlineCount: number;
  systemAvailabilityScorePercent: number;
  averageLatencyMs: number;
  endpoints: EndpointAvailability[];
}

export const DATA_GOV_SG_ENDPOINTS: EndpointConfig[] = [
  {
    id: 'two-hr-forecast',
    name: '2-Hour Weather Forecast',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast',
    description: 'Nowcasts for 47 localized areas across Singapore'
  },
  {
    id: 'twenty-four-hr-forecast',
    name: '24-Hour Weather Forecast',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast',
    description: 'Islandwide day/night forecast, temperature, humidity and wind bounds'
  },
  {
    id: 'four-day-outlook',
    name: '4-Day Weather Outlook',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook',
    description: 'Multi-day outlook for weekend training and cycling event planning'
  },
  {
    id: 'air-temperature',
    name: 'Air Temperature Sensors',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/air-temperature',
    description: 'Minute-by-minute ambient temperature from physical weather stations'
  },
  {
    id: 'rainfall',
    name: 'Rainfall Sensors',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/rainfall',
    description: '5-minute precipitation readings from 88+ weather radar stations'
  },
  {
    id: 'relative-humidity',
    name: 'Relative Humidity Sensors',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/relative-humidity',
    description: 'Atmospheric moisture readings required for WBGT heat stress calculations'
  },
  {
    id: 'wind-speed',
    name: 'Wind Speed Sensors',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/wind-speed',
    description: 'Surface wind velocity (knots/kph) across coastal and inland towers'
  },
  {
    id: 'pm25',
    name: '1-Hour PM2.5 Readings',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/pm25',
    description: 'Fine particulate matter concentrations (µg/m³) across North, South, East, West, Central'
  },
  {
    id: 'psi',
    name: '24-Hour Pollutant Standards Index (PSI)',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/psi',
    description: 'National air quality standard including sub-indices for O3, NO2, SO2, CO'
  },
  {
    id: 'uv',
    name: 'Ultraviolet Index (UV)',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/uv',
    description: 'Hourly solar ultraviolet radiation index for athlete skin protection'
  }
];

/**
 * Probes a single endpoint and measures latency and payload response.
 */
export async function checkEndpointAvailability(
  endpoint: EndpointConfig,
  timeoutMs = 7000
): Promise<EndpointAvailability> {
  const testedAt = new Date().toISOString();
  const start = performance.now();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let res = await fetch(endpoint.url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    // If rate-limited (429), back off 1000ms and retry once
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 1000));
      res = await fetch(endpoint.url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
    }

    clearTimeout(timer);
    const latencyMs = Math.round(performance.now() - start);

    if (!res.ok) {
      return {
        id: endpoint.id,
        name: endpoint.name,
        url: endpoint.url,
        status: 'DEGRADED',
        httpStatus: res.status,
        latencyMs,
        errorMessage: `HTTP ${res.status}: ${res.statusText}`,
        testedAt
      };
    }

    const json = await res.json();
    let recordsCount = 0;

    if (json?.data?.items?.length) {
      recordsCount = json.data.items.length;
    } else if (json?.data?.readings?.length) {
      recordsCount = json.data.readings[0]?.data?.length || json.data.readings.length;
    } else if (json?.data?.records?.length) {
      recordsCount = json.data.records.length;
    }

    const hasExpectedData = json && (json.code === 0 || json.data !== undefined);

    return {
      id: endpoint.id,
      name: endpoint.name,
      url: endpoint.url,
      status: hasExpectedData ? 'ONLINE' : 'DEGRADED',
      httpStatus: res.status,
      latencyMs,
      dataRecordsCount: recordsCount,
      errorMessage: hasExpectedData ? undefined : 'Unrecognized JSON structure',
      testedAt
    };
  } catch (err: unknown) {
    clearTimeout(timer);
    const latencyMs = Math.round(performance.now() - start);
    const message = err instanceof Error ? err.message : String(err);

    return {
      id: endpoint.id,
      name: endpoint.name,
      url: endpoint.url,
      status: 'OFFLINE',
      httpStatus: null,
      latencyMs,
      errorMessage: message,
      testedAt
    };
  }
}

/**
 * Checks all 10 endpoints with staggered calls to avoid burst 429 rate limiting.
 */
export async function checkAllEndpointsAvailability(): Promise<ApiAvailabilitySummary> {
  const results: EndpointAvailability[] = [];

  for (let i = 0; i < DATA_GOV_SG_ENDPOINTS.length; i++) {
    const endpoint = DATA_GOV_SG_ENDPOINTS[i];
    const res = await checkEndpointAvailability(endpoint);
    results.push(res);
    if (i < DATA_GOV_SG_ENDPOINTS.length - 1) {
      await new Promise((r) => setTimeout(r, 120));
    }
  }

  const onlineCount = results.filter((r) => r.status === 'ONLINE').length;
  const degradedCount = results.filter((r) => r.status === 'DEGRADED').length;
  const offlineCount = results.filter((r) => r.status === 'OFFLINE').length;

  const validLatencies = results.filter((r) => r.status !== 'OFFLINE').map((r) => r.latencyMs);
  const avgLatency = validLatencies.length
    ? Math.round(validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length)
    : 0;

  const availabilityScore = Math.round(
    ((onlineCount * 1.0 + degradedCount * 0.5) / results.length) * 100
  );

  return {
    timestamp: new Date().toISOString(),
    totalEndpoints: results.length,
    onlineCount,
    degradedCount,
    offlineCount,
    systemAvailabilityScorePercent: availabilityScore,
    averageLatencyMs: avgLatency,
    endpoints: results
  };
}

/**
 * Serverless Default HTTP Handler (Node/Vercel/Express/Web Request compatible)
 */
export default async function handler(req: any, res?: any) {
  // CORS Headers
  if (res && typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  }

  // Handle preflight OPTIONS
  if (req?.method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      return res.status(200).end();
    }
    return new Response(null, { status: 200 });
  }

  const summary = await checkAllEndpointsAvailability();

  // Express / Vercel Serverless (req, res) response
  if (res && typeof res.status === 'function') {
    return res.status(200).json(summary);
  }

  // Web Standard Fetch (Edge / Cloudflare Pages / Next Route handler)
  return new Response(JSON.stringify(summary, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
