import pool from "../db/mysql"
import queries from "../db/queries"
import { generateTwoRandomNumbers } from "../utils/random-numbers"
import { env } from "../utils/env"
import type { Request, Response } from "express"
import type { RowDataPacket } from "mysql2"

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

export async function filmesAleatoriosHandler(_req: Request, res: Response) {
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
}
