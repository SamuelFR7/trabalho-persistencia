import type { Request, Response } from "express"
import { z } from "zod"
import { redis } from "../db/redis/redis"

const bodySchema = z.object({
  id: z.coerce.number(),
})

export async function votosHandler(req: Request, res: Response) {
  const { error, data } = bodySchema.safeParse(req.body)

  if (error) {
    res.status(422).json({ error: error.format() })
    return
  }

  const { id } = data

  try {
    const newCount = await redis.incr(String(id))

    res.status(200).json({ movieId: id, count: newCount })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Internal server error" })
  }
}
