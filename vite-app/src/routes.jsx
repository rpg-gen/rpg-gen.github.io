import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./routes/root";
import DetailsLayout from "./components/details_layout.jsx";
import Characters from "./routes/characters.jsx";
import AccountInfo from "./routes/account_info.jsx";
import Generator from "./routes/generator.jsx";
import CharacterList from "./routes/character_list.jsx";
import LoginProtected from "./components/login_protected.jsx";
import Items from "./routes/items.jsx";
import DataManager from "./routes/data_manager.jsx";
import Abilities from "./routes/abilities.jsx";
import MapGen from "./routes/map_gen.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />,
        errorElement: <Root is_error={true} />,
        children: [
            {
                path: "/",
                element: <DetailsLayout page_title="Generator" children={<Generator />} />
            },
            {
                path: "characters",
                element: <DetailsLayout page_title="Characters" children={<LoginProtected><Characters /></LoginProtected>} />,
                children: [
                    {
                        path: "",
                        element: <CharacterList is_show={true} />
                    },
                    // {
                    //     path: "create",
                    //     // element: <CharacterList is_show={false}><CharacterCreate /></CharacterList>,
                    //     element: <CharacterCreate />,
                    // },
                    // {
                    //     path: "edit/:id",
                    //     // element: <CharacterList is_show={false}><CharacterEdit /></CharacterList>,
                    //     element: <CharacterEdit />,
                    // }
                ]
            },
            {
                path: "items",
                element: <DetailsLayout page_title="Items"><LoginProtected><Items /></LoginProtected></DetailsLayout>
            },
            {
                path: "abilities",
                element: <DetailsLayout page_title="Abilities"><LoginProtected><Abilities /></LoginProtected></DetailsLayout>
            },
            {
                path: "map_gen",
                element: <DetailsLayout page_title="Map Generator"><LoginProtected><MapGen /></LoginProtected></DetailsLayout>
            },
            {
                path: "data_manager",
                element: <DetailsLayout page_title="Data Manager" children={<LoginProtected><DataManager /></LoginProtected>} />
            },
            {
                path: "account_info",
                element: <DetailsLayout page_title="Account Info" children={<AccountInfo />} />
            },
        ],
    },

]);

export default function Routes () {
    return <RouterProvider router={router} />
}