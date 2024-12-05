import type { RowDataPacket } from "mysql2"
import pool from "../db/mysql"
import { redis } from "../db/redis/redis"
import type { Request, Response } from "express"
import queries from "../db/queries"
import { env } from "../utils/env"

interface Count extends RowDataPacket {
  count: number
}

interface Movie extends RowDataPacket {
  id: number
  titulo: string
  imagemUrl: string
  votos: number
}

export async function rankingHandler(_req: Request, res: Response) {
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
}
