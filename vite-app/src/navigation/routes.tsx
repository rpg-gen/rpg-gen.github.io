import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "../App"
import NavigationError from "../pages/navigation_error"
import MainMenu from "../pages/main_menu"
import Map from "../pages/map"
import Account from "../pages/account"
import { nav_paths } from "../configs/constants"
import Tagger from "../pages/Tagger"

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
                path: "/tagger",
                element: <Tagger />
            },
            {
                path: "/account",
                element: <Account />
            },
            {
                path: nav_paths.map,
                element: <Map />
            },
            {
                path: nav_paths.map + "/:subpage",
                element: <Map />
            }
        ]
    }
])

export default function Routes() {
    return <RouterProvider router={router} />
}