import "dotenv/config"
import { S3 } from "@aws-sdk/client-s3"

const PAGES_LIMIT = 5
const API_KEY = process.env.TMDB_API_KEY!
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!
const R2_ENDPOINT = process.env.R2_ENDPOINT!

if (
  !API_KEY ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME ||
  !R2_ENDPOINT
) {
  console.log("Environment variables for TMDB or R2 are missing")
  process.exit(1)
}

const s3 = new S3({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

const tmdbOptions = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
}

type MovieData = {
  id: number
  title: string
  poster_path: string
}

async function fetchMovies(page: number, current: MovieData[] = []) {
  if (page > PAGES_LIMIT) {
    return current
  }

  const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=pt-BR&page=${page}&sort_by=vote_average.desc&vote_count.gte=1000`

  const response = await fetch(url, tmdbOptions)

  if (!response.ok) {
    console.log("Something went wrong when fetching the TMDB Api")
    process.exit(1)
  }

  const data = (await response.json()) as { results: MovieData[] }

  current.push(
    ...data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
    }))
  )

  return fetchMovies(page + 1, current)
}

async function uploadToR2(key: string, body: Uint8Array) {
  try {
    await s3.putObject({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: "image/jpeg",
    })
    console.log(`Upload ${key} to R2`)
  } catch (error) {
    console.error(`Failed to upload ${key}`, error)
  }
}

async function fetchAndUploadImage(movie: MovieData) {
  if (!movie.poster_path) return

  const imageUrl = `https://image.tmdb.org/t/p/original${movie.poster_path}`
  const response = await fetch(imageUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  })

  if (!response.ok) {
    console.error(`Failed to fetch image for movie ${movie.title}`)
    return
  }

  const blob = await response.blob()
  const arrayBuffer = await blob.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)
  const fileName = `${movie.id}-${movie.title.replace(/[^a-z0-9]/gi, "_")}.jpg`

  await uploadToR2(fileName, buffer)
}

async function processMovies() {
  const movies = await fetchMovies(1)

  for (const movie of movies) {
    await fetchAndUploadImage(movie)
  }

  console.log("All movies processed")
}

processMovies().catch((err) => console.error(`Unexpected error: ${err}`))
