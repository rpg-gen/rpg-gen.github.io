import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import { useContext, ReactNode } from "react"
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
import CampaignLayout from "../pages/ttrpg/campaign_layout"
import CampaignDetail from "../pages/ttrpg/campaign_detail"
import SessionDetail from "../pages/ttrpg/session_detail"
import QuestDetail from "../pages/ttrpg/quest_detail"
import ProjectDetail from "../pages/ttrpg/project_detail"
import MemberDetail from "../pages/ttrpg/member_detail"
import LoreDetail from "../pages/ttrpg/lore_detail"
import FeedbackManagement from "../pages/feedback_management"
import UserContext from "../contexts/user_context"
import { is_ttrpg_user } from "../configs/auth"

function TtrpgRoute({ children }: { children: ReactNode }) {
    const user = useContext(UserContext)
    if (!user.is_auth_checked) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "20px" }}>Loading...</div>
    if (!user.is_logged_in) return <>{children}</>
    if (!is_ttrpg_user(user.username)) return <Navigate to="/" replace />
    return <>{children}</>
}

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
                element: <TtrpgRoute><CampaignList /></TtrpgRoute>
            },
            {
                path: nav_paths.rpg_notes + "/:campaignId",
                element: <TtrpgRoute><CampaignLayout /></TtrpgRoute>,
                children: [
                    { index: true, element: <Navigate to="sessions" replace /> },
                    { path: ":tab", element: <CampaignDetail /> },
                    { path: "session/:sessionId", element: <SessionDetail /> },
                    { path: "party/:memberId", element: <MemberDetail /> },
                    { path: "lore/:loreId", element: <LoreDetail /> },
                    { path: "quest/:questId", element: <QuestDetail /> },
                    { path: "project/:projectId", element: <ProjectDetail /> },
                ]
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