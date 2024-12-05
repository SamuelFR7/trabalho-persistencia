import { api } from "../api"

type PostVotarRequest = {
  id: number
}

export async function postVotar(data: PostVotarRequest) {
  await api.post("/votar", data)
}
