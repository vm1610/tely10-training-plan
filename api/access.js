// api/access.js — free-slot counter backed by Upstash Redis
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const FREE_LIMIT = parseInt(process.env.FREE_LIMIT ?? '20')

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'GET') {
    const count = (await redis.get('plan_count')) ?? 0
    res.status(200).json({ free: count < FREE_LIMIT, remaining: Math.max(0, FREE_LIMIT - count) })
    return
  }

  if (req.method === 'POST') {
    await redis.incr('plan_count')
    res.status(200).end()
    return
  }

  res.status(405).end()
}
