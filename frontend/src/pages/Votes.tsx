import { ActionFunctionArgs, Form, useLoaderData } from "react-router"

type MovieData = {
  id: number
  titulo: string
  imagemUrl: string
}

export async function loader() {
  const response = await fetch("http://localhost:3000/filmes-aleatorios", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Algo deu errado")
  }

  const data = (await response.json()) as MovieData[]

  return data
}

export default function Votes() {
  const data = useLoaderData<typeof loader>()

  return (
    <div className="h-screen w-screen flex flex-col justify-center gap-20 items-center relative">
      <div className="text-2xl text-center pt-8">
        Qual filme você gosta mais?
      </div>
      <div className="p-8 flex justify-between items-center max-w-2xl flex-col md:flex-row animate-fade-in">
        <MovieListing movie={data[0]} vote={() => console.log(`voto 1`)} />
        <div className="p-8 italic text-xl">{"or"}</div>
        <MovieListing movie={data[1]} vote={() => console.log(`voto 2`)} />
        <div className="p-2" />
      </div>
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()

  const id = formData.get("id")

  const response = await fetch("http://localhost:3000/votar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  })

  if (!response.ok) {
    throw new Error(`Erro ao votar`)
  }

  return null
}

type MovieListingProps = {
  movie: MovieData
  vote: () => void
}

function MovieListing({ movie, vote }: MovieListingProps) {
  return (
    <div
      className="flex flex-col items-center transition-opacity space-y-4"
      key={movie.id}
    >
      <div className="text-xl text-center capitalize mt-[-0.5rem]">
        {movie.titulo}
      </div>
      <img
        src={movie.imagemUrl}
        width={256}
        height={256}
        className="animate-fade-in"
      />
      <Form method="POST">
        <input name="id" type="hidden" value={movie.id} />
        <button
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={vote}
        >
          Votar
        </button>
      </Form>
    </div>
  )
}
