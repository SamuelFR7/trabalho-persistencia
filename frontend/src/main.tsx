import { createRoot } from "react-dom/client"
import "./index.css"
import { createBrowserRouter, RouterProvider } from "react-router"
import Votes, {
  loader as votesLoader,
  action as votesAction,
} from "./pages/Votes"
import Ranking from "./pages/Ranking"

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
  },
])

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
)
