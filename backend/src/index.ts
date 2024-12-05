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

const fakeData = [
  { title: "Filme 1 falso", imagemUrl: "http://imagem-falsa-1", id: 1 },
  {
    title: "Filme 2 falso",
    imagemUrl: "http://imagem-falsa-2",
    id: 2,
  },
]

function generateTwoRandomNumbers(moviesQtd: number) {
  if (moviesQtd < 2) {
    throw new Error(
      "moviesQtd must be at least 2 to generate two different numbers."
    )
  }

  const first = Math.floor(Math.random() * moviesQtd) + 1
  let second: number

  do {
    second = Math.floor(Math.random() * moviesQtd) + 1
  } while (second === first)

  return [first, second]
}

app.get("/filmes-aleatorios", async (_req, res) => {
  // Pegar do mysql
  const quantidadeDeFilmes = fakeData.length

  const [first, second] = generateTwoRandomNumbers(quantidadeDeFilmes)

  const firstMovie = fakeData.find((movie) => movie.id === first)

  if (!firstMovie) {
    res.status(404).json({ message: "Movie not found" })
    return
  }

  const secondMovie = fakeData.find((movie) => movie.id === second)

  if (!secondMovie) {
    res.status(404).json({ message: "Movie not found" })
    return
  }

  res.status(200).json([firstMovie, secondMovie])
  return
})

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
