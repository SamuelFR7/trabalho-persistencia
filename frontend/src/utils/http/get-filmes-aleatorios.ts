import { api } from "../api"
import { MovieData } from "../types"

export type GetFilmesAleatoriosResponse = MovieData[]

export async function getFilmesAleatorios() {
  const { data } =
    await api.get<GetFilmesAleatoriosResponse>("/filmes-aleatorios")

  return data
}
