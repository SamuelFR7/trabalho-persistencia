import { Router } from "express"
import { rankingHandler } from "../controllers/ranking-controller"

const rankingRouter = Router()

rankingRouter.get("/ranking", rankingHandler)

export default rankingRouter
