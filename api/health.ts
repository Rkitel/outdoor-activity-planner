/**
 * Serverless Function: /api/health
 * Compatible with Vercel Serverless Functions, Netlify, Express, and Edge runtimes.
 */

export interface SystemHealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  runtime: {
    nodeVersion: string;
    platform: string;
    arch: string;
    memory: {
      heapUsedMB: number;
      heapTotalMB: number;
      rssMB: number;
      externalMB: number;
    };
  };
  checks: {
    weatherServiceConfigured: boolean;
    appUrlConfigured: boolean;
    geminiApiKeyAvailable: boolean;
  };
}

/**
 * Returns instantaneous system runtime health metrics.
 */
export function getSystemHealth(): SystemHealthReport {
  const mem = typeof process !== 'undefined' && process.memoryUsage
    ? process.memoryUsage()
    : { heapUsed: 0, heapTotal: 0, rss: 0, external: 0 };

  const toMB = (bytes: number) => Math.round((bytes / 1024 / 1024) * 100) / 100;
  const env = typeof process !== 'undefined' ? process.env : {};

  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: typeof process !== 'undefined' ? Math.floor(process.uptime()) : 0,
    environment: env.NODE_ENV || 'production',
    runtime: {
      nodeVersion: typeof process !== 'undefined' ? process.version : 'unknown',
      platform: typeof process !== 'undefined' ? process.platform : 'browser',
      arch: typeof process !== 'undefined' ? process.arch : 'unknown',
      memory: {
        heapUsedMB: toMB(mem.heapUsed),
        heapTotalMB: toMB(mem.heapTotal),
        rssMB: toMB(mem.rss),
        externalMB: toMB(mem.external)
      }
    },
    checks: {
      weatherServiceConfigured: true,
      appUrlConfigured: Boolean(env.APP_URL),
      geminiApiKeyAvailable: Boolean(env.GEMINI_API_KEY)
    }
  };
}

/**
 * Perform a deep health check including quick external network connectivity probe.
 */
export async function performDeepHealthCheck(): Promise<SystemHealthReport> {
  const baseHealth = getSystemHealth();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const probeRes = await fetch(
      'https://api-open.data.gov.sg/v2/real-time/api/air-temperature',
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!probeRes.ok) {
      baseHealth.status = 'degraded';
    }
  } catch {
    baseHealth.status = 'degraded';
  }

  return baseHealth;
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

  const report = await performDeepHealthCheck();

  // Express / Vercel Serverless (req, res) response
  if (res && typeof res.status === 'function') {
    return res.status(200).json(report);
  }

  // Web Standard Fetch (Edge / Cloudflare Pages / Next Route handler)
  return new Response(JSON.stringify(report, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
