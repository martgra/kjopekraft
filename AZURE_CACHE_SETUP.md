# Azure Web Service Cache Configuration for SSB Data

## Current Implementation

- Next.js 16 Cache Components with `cacheLife('weeks')` (1 week)
- Shared across all users on the same server instance
- SSB salary data cached per occupation/sector combination

## Issue

Azure Web Services may restart or scale, losing in-memory cache. For production, you need persistent, shared caching.

---

## Solution Options

### Option 1: Use Azure Cache for Redis (Recommended for Production)

**Best for:** Multi-instance deployments, high traffic

#### Setup Steps:

1. **Create Azure Cache for Redis:**

```bash
az redis create \
  --name kjopekraft-cache \
  --resource-group <your-rg> \
  --location norwayeast \
  --sku Basic \
  --vm-size c0
```

2. **Install Redis client:**

```bash
npm install @vercel/kv
# or
npm install ioredis
```

3. **Add environment variables in Azure:**

```
KV_REST_API_URL=<redis-connection-string>
KV_REST_API_TOKEN=<redis-access-key>
```

4. **Create Redis cache wrapper:**

Create `lib/cache/redis.ts`:

```typescript
import { kv } from '@vercel/kv'

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 604800, // 1 week in seconds
): Promise<T> {
  // Try to get from cache
  const cached = await kv.get<T>(key)
  if (cached) return cached

  // Fetch fresh data
  const data = await fetcher()

  // Store in cache
  await kv.set(key, data, { ex: ttl })

  return data
}
```

5. **Update the API route:**

```typescript
import { getCachedData } from '@/lib/cache/redis'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const occupation = sp.get('occupation') ?? '2223'
  const sector = sp.get('sector') ?? 'ALLE'
  // ... other params

  const cacheKey = `ssb:salary:${occupation}:${sector}:${fromYear}`

  const data = await getCachedData(
    cacheKey,
    () => fetchSsbSalaryData({ occupation, sector /* ... */ }),
    604800, // 1 week
  )

  return NextResponse.json(data)
}
```

**Cost:** ~$20-40/month for Basic tier

---

### Option 2: Pre-generate Static Data (Best Performance, No Cost)

**Best for:** Data that rarely changes (like SSB annual data)

1. **Create a data generation script:**

Create `scripts/fetch-ssb-data.ts`:

```typescript
import fs from 'fs'
import path from 'path'

const OCCUPATIONS = {
  nurses: { code: '2223' },
  teachers: { code: '2341' },
  managersState: { code: '1120', sector: 'STAT' },
  // ... etc
}

async function fetchAndCacheAll() {
  const cache = {}

  for (const [key, occupation] of Object.entries(OCCUPATIONS)) {
    const url = buildSsbUrl({
      occupation: occupation.code,
      sector: occupation.sector || 'ALLE',
      // ... other params
    })

    const response = await fetch(url)
    const data = await response.json()

    cache[key] = data
    console.log(`Fetched ${key}`)
  }

  // Write to public directory
  fs.writeFileSync(
    path.join(process.cwd(), 'public/cache/ssb-salaries.json'),
    JSON.stringify(cache, null, 2),
  )

  console.log('Cache generated successfully')
}

fetchAndCacheAll()
```

2. **Add to package.json:**

```json
{
  "scripts": {
    "fetch-ssb": "tsx scripts/fetch-ssb-data.ts",
    "build": "npm run fetch-ssb && next build"
  }
}
```

3. **Serve from static file:**

```typescript
// app/api/ssb/salary/route.ts
import ssbCache from '@/public/cache/ssb-salaries.json'

export async function GET(req: NextRequest) {
  const occupation = sp.get('occupation') ?? '2223'

  // Return pre-cached data
  return NextResponse.json(ssbCache[occupation])
}
```

**Cost:** $0 (uses local file system)

---

### Option 3: Azure Blob Storage Cache

**Best for:** Large datasets, serverless deployments

1. **Install Azure Storage SDK:**

```bash
npm install @azure/storage-blob
```

2. **Create cache wrapper:**

```typescript
// lib/cache/blob.ts
import { BlobServiceClient } from '@azure/storage-blob'

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!,
)

export async function getBlobCache<T>(
  containerName: string,
  blobName: string,
  fetcher: () => Promise<T>,
  maxAge: number = 604800000, // 1 week in ms
): Promise<T> {
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blobClient = containerClient.getBlobClient(blobName)

  try {
    // Check if blob exists and is fresh
    const props = await blobClient.getProperties()
    const age = Date.now() - props.createdOn!.getTime()

    if (age < maxAge) {
      const downloadResponse = await blobClient.download()
      const data = await streamToString(downloadResponse.readableStreamBody!)
      return JSON.parse(data)
    }
  } catch (error) {
    // Blob doesn't exist, fetch fresh
  }

  // Fetch and store
  const data = await fetcher()
  await blobClient.upload(JSON.stringify(data), JSON.stringify(data).length)

  return data
}
```

---

### Option 4: Extend Next.js Cache with Persistent Storage (Current + Improvement)

**Best for:** Quick improvement without infrastructure changes

Add to `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,

  // Ensure cache persists across restarts
  experimental: {
    incrementalCacheHandlerPath: './lib/cache/file-system-cache.ts',
  },

  images: {
    /* ... */
  },
  output: 'standalone',
}
```

Create `lib/cache/file-system-cache.ts`:

```typescript
import { CacheHandler } from 'next/dist/server/lib/incremental-cache'
import fs from 'fs/promises'
import path from 'path'

const CACHE_DIR = path.join(process.cwd(), '.next/cache/custom')

export default class FileSystemCache implements CacheHandler {
  async get(key: string) {
    try {
      const filePath = path.join(CACHE_DIR, `${key}.json`)
      const data = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(data)
    } catch {
      return null
    }
  }

  async set(key: string, data: any, ttl?: number) {
    const filePath = path.join(CACHE_DIR, `${key}.json`)
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(
      filePath,
      JSON.stringify({ data, expireAt: Date.now() + (ttl || 604800000) }),
    )
  }
}
```

For Azure, mount persistent storage:

```bash
# In Azure Portal > Configuration > Path mappings
# Add: /home/site/wwwroot/.next/cache -> Azure File Share
```

---

## Recommended Approach

For your use case (SSB salary data):

1. **Short term (now):** Use Option 1 with extended cache duration ✅ (already done - 1 week)
2. **Medium term:** Implement Option 2 (static generation) - no cost, perfect for annual data
3. **Long term:** Add Redis cache (Option 1) when you scale to multiple instances

## Manual Cache Invalidation

When SSB releases new data (November each year), invalidate cache:

```typescript
// Add an admin API route: app/api/admin/clear-cache/route.ts
import { revalidateTag } from 'next/cache'

export async function POST(req: Request) {
  const { secret } = await req.json()

  if (secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  revalidateTag('ssb-salary')

  return Response.json({ revalidated: true })
}
```

Call from admin panel or cron job:

```bash
curl -X POST https://your-app.azurewebsites.net/api/admin/clear-cache \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-secret"}'
```

---

## Cost Comparison

| Option                      | Monthly Cost | Performance | Complexity |
| --------------------------- | ------------ | ----------- | ---------- |
| Option 1 (Redis)            | $20-40       | Excellent   | Medium     |
| Option 2 (Static)           | $0           | Best        | Low        |
| Option 3 (Blob)             | $1-5         | Good        | Medium     |
| Option 4 (Extended Next.js) | $0           | Good        | Low        |

## Monitoring

Add cache hit/miss logging:

```typescript
console.log(`[Cache] ${hit ? 'HIT' : 'MISS'} - occupation:${occupation}, sector:${sector}`)
```

Monitor in Azure Application Insights to track cache effectiveness.
