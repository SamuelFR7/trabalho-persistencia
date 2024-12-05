import "dotenv/config"
import express from "express"
import { redis } from "./db/redis/redis"
import { CronJob } from "cron"
import cors from "cors"

const app = express()
app.use(express.json())
app.use(cors())

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

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "movieId must be a non-empty string" })
    return
  }

  try {
    const newCount = await redis.incr(id)

    res.status(200).json({ movieId: parseInt(id), count: newCount })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" })
  }
})

const fakeData = [
  {
    titulo: "Um corpo que cai",
    imagemUrl:
      "https://i.pinimg.com/originals/28/07/79/280779b8a1ca10ffc7269846c9bea474.jpg",
    id: 1,
  },
  {
    titulo: "A viagem de chihiro",
    imagemUrl:
      "https://m.media-amazon.com/images/I/71E4cV914GL._AC_UF894,1000_QL80_.jpg",
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
