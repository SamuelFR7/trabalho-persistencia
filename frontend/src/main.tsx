import { createRoot } from "react-dom/client"
import "./index.css"
import { createBrowserRouter, RouterProvider } from "react-router"
import Votes from "./pages/Votes"
import Ranking from "./pages/Ranking"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Votes />,
  },
  {
    path: "/ranking",
    element: <Ranking />,
  },
])

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
)
