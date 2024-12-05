import { useLoaderData } from "react-router"

type GetRankingResponse = {
  ranking: {
    id: number
    titulo: string
    imagemUrl: string
    votos: number
  }[]
  votes: number
}

export async function loader() {
  const response = await fetch("http://localhost:3000/ranking", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Error on retrieving ranking")
  }

  const data = (await response.json()) as GetRankingResponse

  return data
}

export default function Ranking() {
  const data = useLoaderData<typeof loader>()

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl p-4">Ranking</h2>
      <div className="flex flex-col w-full max-w-2xl border">
        {data.ranking.map((movie, index) => {
          return (
            <MovieListing
              movie={movie}
              key={index}
              rank={index + 1}
              total={data.votes}
            />
          )
        })}
      </div>
    </div>
  )
}

type MovieListingProps = {
  movie: {
    id: number
    titulo: string
    imagemUrl: string
    votos: number
  }
  total: number
  rank: number
}

const generateCountPercent = (movieVotes: number, totalVotes: number) => {
  return (movieVotes / totalVotes) * 100
}

function MovieListing({ movie, total, rank }: MovieListingProps) {
  return (
    <div className="relative flex border-b p-2 items-center justify-between">
      <div className="flex items-center">
        <div className="flex items-center pl-4">
          <img src={movie.imagemUrl} width={64} height={64} />
          <div className="pl-2 capitalize">{movie.titulo}</div>
        </div>
      </div>
      <div className="pr-4">
        {generateCountPercent(movie.votos, total).toFixed(2) + "%"}
      </div>
      <div className="absolute top-0 left-0 z-20 flex items-center justify-center px-2 font-semibold text-white bg-gray-600 border border-gray-500 shadow-lg rounded-br-md">
        {rank}
      </div>
    </div>
  )
}
