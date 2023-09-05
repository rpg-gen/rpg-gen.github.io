import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "../App"
import NavigationError from "../pages/navigation_error"
import MainMenu from "../pages/main_menu"
import Map from "../pages/map"

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <NavigationError />,
        children: [
            {
                path: "/",
                element: <MainMenu />
            },
            {
                path: "/map",
                element: <Map />
            }
        ]
    }
])

export default function Routes() {
    return <RouterProvider router={router} />
}