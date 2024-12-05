import { api } from "../api"
import { MovieData } from "../types"

type GetRankingResponse = {
  ranking: MovieData[]
  votes: number
}

export async function getRanking() {
  const { data } = await api.get<GetRankingResponse>("/ranking")

  return data
}
