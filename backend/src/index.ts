import "dotenv/config"
import express from "express"
import { redis } from "./db/redis/redis"
import { CronJob } from "cron"

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000

redis.on("error", (err) => {
  console.error("Redis error:", err)
})

redis.connect().then(() => {
  console.log("Connected to Redis")
})

const job = new CronJob("* * * * *", async () => {
  console.log("Running the cron job to process movie counts")

  try {
    const keys = await redis.keys("*")

    if (keys.length === 0) {
      console.log("No movies found in Redis")
      return
    }

    const counts = await redis.mGet(keys)

    const movieData = keys.map((key, index) => ({
      movieId: key,
      count: parseInt(counts[index] || "0", 10),
    }))

    console.log("Movies to update in MySQL: ", movieData)
    // Implement incrementation in mysql

    const pipeline = redis.multi()
    movieData.forEach(({ movieId, count }) => {
      pipeline.decrBy(movieId, count)
    })
    await pipeline.exec()
  } catch (error) {
    console.log(`Error running the cronjob: ${error}`)
  }
})

job.start()

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
