import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "../App"
import NavigationError from "../pages/navigation_error"
import MainMenu from "../pages/main_menu"
import Map from "../pages/map"
import Account from "../pages/account"
import { nav_paths } from "../configs/constants"
import Tagger from "../pages/Tagger"
import CardList from "../pages/delve_cards/card_list"
import CardEdit from "../pages/delve_cards/card_edit"
import TagManagement from "../pages/delve_cards/tag_management"
import RandomCard from "../pages/delve_cards/random_card"
import ProtectedRoute from "../components/protected_route"

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
                element: <ProtectedRoute><Tagger /></ProtectedRoute>
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
            },
            {
                path: nav_paths.delve_card_list,
                element: <CardList />
            },
            {
                path: nav_paths.delve_card_edit + "/:cardId",
                element: <ProtectedRoute><CardEdit /></ProtectedRoute>
            },
            {
                path: nav_paths.delve_card_tags,
                element: <ProtectedRoute><TagManagement /></ProtectedRoute>
            },
            {
                path: nav_paths.delve_card_random,
                element: <RandomCard />
            }
        ]
    }
])

export default function Routes() {
    return <RouterProvider router={router} />
}