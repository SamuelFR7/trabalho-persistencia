import "dotenv/config"
import express from "express"
import { redis } from "./db/redis/redis"

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000

redis.on("error", (err) => {
  console.error("Redis error:", err)
})

redis.connect().then(() => {
  console.log("Connected to Redis")
})

app.post("/votar", async (req, res) => {
  const { id } = req.body as {
    id: number
  }

  if (!id || typeof id !== "number") {
    res.status(400).json({ error: "movieId must be a number" })
    return
  }

  try {
    const newCount = await redis.incr(String(id))

    res.status(200).json({ movieId: id, count: newCount })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
