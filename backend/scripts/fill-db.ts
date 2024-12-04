import "dotenv/config"

const PAGES_LIMIT = 5
const API_KEY = process.env.TMDB_API_KEY!

if (!API_KEY) {
  console.log("Api key is missing")
  process.exit(1)
}

const options = {
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

async function getMovies(page: number, current: MovieData[]) {
  if (page > PAGES_LIMIT) {
    return current
  }

  const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=pt-BR&page=${page}&sort_by=vote_average.desc&vote_count.gte=1000`

  const response = await fetch(url, options)

  if (!response.ok) {
    console.log("Something went wrong when fetching the TMDB Api")
    process.exit(1)
  }

  const data = (await response.json()) as { results: MovieData[] }

  current.push(
    ...data.results.map((movie) => {
      return {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
      }
    })
  )

  return getMovies(page + 1, current)
}

const movies = await getMovies(1, [])

console.log(movies)
