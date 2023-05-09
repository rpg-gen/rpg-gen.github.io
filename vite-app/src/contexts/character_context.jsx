import { createContext } from 'react';

function noop() {
    return
}

const context_obj = {
    is_loading: false,
    characters: {},
    adjust_character_hp: noop
}

const CharacterContext = createContext(context_obj);

export default CharacterContext;