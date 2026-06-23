import type { VercelRequest, VercelResponse } from '@vercel/node';

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
]);

async function readRawBody(req: VercelRequest): Promise<Buffer | undefined> {
  if (!req.method || req.method === 'GET' || req.method === 'HEAD') {
    return undefined;
  }

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on('end', () => resolve());
    req.on('error', reject);
  });

  return chunks.length ? Buffer.concat(chunks) : undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const backendBase = process.env.RAILWAY_BACKEND_URL?.replace(/\/$/, '');
  if (!backendBase) {
    res.status(503).json({
      detail:
        'RAILWAY_BACKEND_URL is not set. Add it in Vercel → Project Settings → Environment Variables.',
    });
    return;
  }

  const incomingPath = req.url || '/api';
  const targetUrl = `${backendBase}${incomingPath}`;

  const headers: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower) || lower === 'host') continue;
    headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
  }

  const body = await readRawBody(req);

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: body as BodyInit | undefined,
    redirect: 'manual',
  });

  res.status(upstream.status);

  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower)) return;
    if (lower === 'set-cookie') {
      res.appendHeader('set-cookie', value);
      return;
    }
    res.setHeader(key, value);
  });

  const responseBody = Buffer.from(await upstream.arrayBuffer());
  res.send(responseBody);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
