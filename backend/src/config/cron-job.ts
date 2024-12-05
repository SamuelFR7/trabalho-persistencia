import { CronJob } from "cron"
import { redis } from "../db/redis/redis"
import pool from "../db/mysql"
import queries from "../db/queries"

export const votesJob = new CronJob("* * * * *", async () => {
  console.log("Running the cron job to process movie counts")

  try {
    const keys = (await redis.keys("*")).filter((key) => key !== "ranking")

    if (keys.length === 0) {
      console.log("No movies found in Redis")
      return
    }

    const counts = await redis.mGet(keys)

    const movieData = keys
      .map((key, index) => ({
        movieId: key,
        count: parseInt(counts[index] || "0", 10),
      }))
      .filter(({ count }) => count > 0)

    if (movieData.length === 0) {
      console.log("No movies with non-zero counts to process")
      return
    }

    console.log("Movies to update in MySQL: ", movieData)
    await Promise.all(
      movieData.map(({ movieId, count }) => {
        pool.execute(queries.incrementVoto, [count, movieId])
      })
    )

    const pipeline = redis.multi()
    movieData.forEach(({ movieId, count }) => {
      pipeline.decrBy(movieId, count)
    })
    await pipeline.exec()

    console.log("Cron job completed successfully")
  } catch (error) {
    console.log(`Error running the cronjob: ${error}`)
  }
})
