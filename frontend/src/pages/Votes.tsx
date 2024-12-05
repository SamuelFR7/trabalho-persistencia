import { ActionFunctionArgs, Form, Link, useLoaderData } from "react-router"
import { getFilmesAleatorios } from "../utils/http/get-filmes-aleatorios"
import { MovieData } from "../utils/types"
import { postVotar } from "../utils/http/post-votar"

export async function loader() {
  const data = await getFilmesAleatorios()

  return data
}

export default function Votes() {
  const data = useLoaderData<typeof loader>()

  return (
    <div className="h-screen w-screen flex flex-col justify-between items-center relative">
      <div className="text-2xl text-center pt-8">
        Qual filme você gosta mais?
      </div>
      <div className="p-8 flex justify-between items-center max-w-2xl flex-col md:flex-row animate-fade-in">
        <MovieListing movie={data[0]} />
        <div className="p-8 italic text-xl">{"ou"}</div>
        <MovieListing movie={data[1]} />
        <div className="p-2" />
      </div>
      <div className="w-full text-xl text-center pb-2">
        <Link to="/ranking">Ranking</Link>
      </div>
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()

  const id = formData.get("id")?.toString()

  if (!id) {
    throw new Error("Id is required")
  }

  await postVotar({ id: parseInt(id) })

  return null
}

type MovieListingProps = {
  movie: MovieData
}

function MovieListing({ movie }: MovieListingProps) {
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
        className="animate-fade-in h-[384px] max-w-full aspect-[2/3]"
      />
      <Form method="POST">
        <input name="id" type="hidden" value={movie.id} />
        <button
          type="submit"
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Votar
        </button>
      </Form>
    </div>
  )
}
