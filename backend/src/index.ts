import "dotenv/config"
import express from "express"
import { redis } from "./db/redis/redis"
import { CronJob } from "cron"
import cors from "cors"
import pool from "./db/mysql"
import queries from "./db/queries"
import type { RowDataPacket } from "mysql2"
import { z } from "zod"
import { env } from "./utils/env"

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
        pool.execute(queries.incrementVoto, [movieId, count])
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

job.start()

const bodySchema = z.object({
  id: z.coerce.number(),
})

app.post("/votar", async (req, res) => {
  const { error, data } = bodySchema.safeParse(req.body)

  if (error) {
    res.status(422).json({ error: error.format() })
    return
  }

  const { id } = data

  try {
    const newCount = await redis.incr(String(id))

    res.status(200).json({ movieId: id, count: newCount })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" })
  }
})

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

interface Count extends RowDataPacket {
  count: number
}

interface Movie extends RowDataPacket {
  id: number
  titulo: string
  imagemUrl: string
  votos: number
}

async function getMovieFromDatabase(id: number) {
  const [movies] = await pool.query<Movie[]>(queries.getFilmeById, [id])

  const first = movies[0]

  if (!first) return null

  return {
    id: first.id,
    titulo: first.titulo,
    imagemUrl: `${env.R2_PUBLIC_URL}/${first.imagemUrl}`,
    votos: first.votos,
  }
}

app.get("/filmes-aleatorios", async (_req, res) => {
  const [count] = await pool.query<Count[]>(queries.getFilmesCount)
  const quantidadeDeFilmes = count[0]?.count
  if (!quantidadeDeFilmes) {
    res.status(404).json({ message: "Could not get movies count" })
    return
  }

  const [first, second] = generateTwoRandomNumbers(quantidadeDeFilmes)

  if (!first || !second) {
    res.status(500).json({ message: "Internal server error" })
    return
  }

  const firstMovie = await getMovieFromDatabase(first)

  if (!firstMovie) {
    res.status(404).json({ message: "Movie not found" })
    return
  }

  const secondMovie = await getMovieFromDatabase(second)

  if (!secondMovie) {
    res.status(404).json({ message: "Movie not found" })
    return
  }

  res.status(200).json([firstMovie, secondMovie])
  return
})

app.get("/ranking", async (_req, res) => {
  const rankingFromCache = await redis.get("ranking")

  if (rankingFromCache) {
    res.status(200).json(JSON.parse(rankingFromCache))
    return
  }

  const [votesCount] = await pool.query<Count[]>(queries.getVotesCount)

  const [votes] = votesCount

  if (!votes) {
    res.status(500).json({ message: "Internal server error" })
    return
  }

  const [rankingResult] = await pool.query<Movie[]>(queries.getTop100Filmes)

  const ranking = rankingResult.map((movie) => ({
    id: movie.id,
    titulo: movie.titulo,
    imagemUrl: `${env.R2_PUBLIC_URL}/${movie.imagemUrl}`,
    votos: movie.votos,
  }))

  const data = {
    ranking,
    votes: votes.count,
  }

  await redis.set("ranking", JSON.stringify(data), { EX: 120 })

  res.status(200).json(data)
  return
})

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
