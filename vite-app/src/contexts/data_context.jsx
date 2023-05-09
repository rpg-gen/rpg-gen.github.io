import { createContext } from 'react';
import configs from "../utility/configs.jsx";

const context_obj = {
    is_loading: false,
    // [configs.item_collection_name]: {},
    // [configs.character_collection_name]: {},
    // [configs.ping_collection_name]: {},
}

const DataContext = createContext(context_obj);

export default DataContext;