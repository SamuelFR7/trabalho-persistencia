import { Router } from "express"
import { votosHandler } from "../controllers/votos-controller"

const votosRouter = Router()

votosRouter.post("/votar", votosHandler)

export default votosRouter
