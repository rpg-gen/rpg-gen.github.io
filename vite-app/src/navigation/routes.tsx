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
import DeckManagement from "../pages/delve_cards/deck_management"
import RandomCard from "../pages/delve_cards/random_card"
import UtilitiesMenu from "../pages/utilities/utilities_menu"
import MigrateToDecks from "../pages/delve_cards/migrate_to_decks"
import MigrateRarities from "../pages/delve_cards/migrate_rarities"
import MigrateFlipRarities from "../pages/delve_cards/migrate_flip_rarities"
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
                path: nav_paths.delve_card_decks,
                element: <ProtectedRoute><DeckManagement /></ProtectedRoute>
            },
            {
                path: nav_paths.delve_card_random,
                element: <RandomCard />
            },
            {
                path: nav_paths.utilities_menu,
                element: <ProtectedRoute><UtilitiesMenu /></ProtectedRoute>
            },
            {
                path: nav_paths.utility_delve_card_migration,
                element: <ProtectedRoute><MigrateToDecks /></ProtectedRoute>
            },
            {
                path: nav_paths.utility_delve_card_rarity_migration,
                element: <ProtectedRoute><MigrateRarities /></ProtectedRoute>
            },
            {
                path: nav_paths.utility_delve_card_rarity_flip,
                element: <ProtectedRoute><MigrateFlipRarities /></ProtectedRoute>
            }
        ]
    }
])

export default function Routes() {
    return <RouterProvider router={router} />
}