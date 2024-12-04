import "./Votes.css"
import { Link } from "react-router"

export default function Votes() {
  return (
    <div>
      <h1>Página de votação</h1>
      <Link to="/ranking">Ir para o ranking</Link>
    </div>
  )
}
