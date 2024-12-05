import { createClient } from "redis"

export const redis = createClient()

redis.on("error", (err) => {
  console.error("Redis error:", err)
})

redis.connect().then(() => {
  console.log("Connected to Redis")
})
