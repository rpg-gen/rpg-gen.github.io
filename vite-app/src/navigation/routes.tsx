import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "../App"
import NavigationError from "../pages/navigation_error"
import MainMenu from "../pages/main_menu"
import Map from "../pages/map"
import Account from "../pages/account"
import { nav_paths } from "../configs/constants"
import Tagger from "../pages/tagger/tagger"
import CardList from "../pages/delve_cards/card_list"
import CardEdit from "../pages/delve_cards/card_edit"
import TagManagement from "../pages/delve_cards/tag_management"
import DeckManagement from "../pages/delve_cards/deck_management"
import RandomCard from "../pages/delve_cards/random_card"
import UtilitiesMenu from "../pages/utilities/utilities_menu"
import MigrateDataToCampaigns from "../pages/ttrpg/migrate_data_to_campaigns"
import ProtectedRoute from "../components/protected_route"
import CampaignList from "../pages/ttrpg/campaign_list"
import CampaignDetail from "../pages/ttrpg/campaign_detail"
import SessionDetail from "../pages/ttrpg/session_detail"
import FeedbackManagement from "../pages/feedback_management"

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
                element: <ProtectedRoute require="admin"><Tagger /></ProtectedRoute>
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
                element: <ProtectedRoute require="admin"><CardEdit /></ProtectedRoute>
            },
            {
                path: nav_paths.delve_card_tags,
                element: <ProtectedRoute require="admin"><TagManagement /></ProtectedRoute>
            },
            {
                path: nav_paths.delve_card_decks,
                element: <ProtectedRoute require="admin"><DeckManagement /></ProtectedRoute>
            },
            {
                path: nav_paths.delve_card_random,
                element: <RandomCard />
            },
            {
                path: nav_paths.utilities_menu,
                element: <ProtectedRoute require="admin"><UtilitiesMenu /></ProtectedRoute>
            },
            {
                path: nav_paths.utility_ttrpg_data_migration,
                element: <ProtectedRoute require="admin"><MigrateDataToCampaigns /></ProtectedRoute>
            },
            {
                path: nav_paths.rpg_notes,
                element: <ProtectedRoute require="ttrpg"><CampaignList /></ProtectedRoute>
            },
            {
                path: nav_paths.rpg_notes + "/:campaignId",
                element: <ProtectedRoute require="ttrpg"><CampaignDetail /></ProtectedRoute>
            },
            {
                path: nav_paths.rpg_notes + "/:campaignId/session/:sessionId",
                element: <ProtectedRoute require="ttrpg"><SessionDetail /></ProtectedRoute>
            },
            {
                path: nav_paths.feedback_management,
                element: <ProtectedRoute require="admin"><FeedbackManagement /></ProtectedRoute>
            }
        ]
    }
])

export default function Routes() {
    return <RouterProvider router={router} />
}