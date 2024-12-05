import { createRoot } from "react-dom/client"
import "./index.css"
import { createBrowserRouter, RouterProvider } from "react-router"
import Votes, {
  loader as votesLoader,
  action as votesAction,
} from "./pages/Votes"
import Ranking, { loader as rankingLoader } from "./pages/Ranking"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Votes />,
    loader: votesLoader,
    action: votesAction,
  },
  {
    path: "/ranking",
    element: <Ranking />,
    loader: rankingLoader,
  },
])

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
)
