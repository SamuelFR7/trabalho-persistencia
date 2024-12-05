import { Router } from "express"
import { filmesAleatoriosHandler } from "../controllers/filmes-controller"

const filmesRouter = Router()

filmesRouter.get("/filmes-aleatorios", filmesAleatoriosHandler)

export default filmesRouter
