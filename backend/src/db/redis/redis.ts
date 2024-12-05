import { createClient } from "redis"
import { env } from "../../utils/env"

export const redis = createClient({
  url: env.REDIS_URL,
})

redis.on("error", (err) => {
  console.error("Redis error:", err)
})

redis.connect().then(() => {
  console.log("Connected to Redis")
})
