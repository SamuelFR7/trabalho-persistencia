import { env } from "./utils/env"
import express from "express"
import cors from "cors"
import filmesRouter from "./routes/filmes-routes"
import rankingRouter from "./routes/ranking-routes"
import votosRouter from "./routes/votos-router"
import { votesJob } from "./config/cron-job"

const app = express()
const PORT = env.PORT

app.use(cors())
app.use(express.json())

app.use(votosRouter)
app.use(filmesRouter)
app.use(rankingRouter)

votesJob.start()

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
