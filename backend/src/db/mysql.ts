import { env } from "../utils/env"
import mysql from "mysql2/promise"

const pool = mysql.createPool({
  uri: env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export default pool

