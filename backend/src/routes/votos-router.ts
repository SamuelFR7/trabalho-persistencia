import { Router } from "express"
import { votosHandler } from "../controllers/votos-controller"

const votosRouter = Router()

votosRouter.get("/votar", votosHandler)

export default votosRouter
