import { mobile } from "../../configs/constants"
import useWindowSize from "../../hooks/useWindowSize"
import defaults from "../../configs/defaults"
import useTaggerData from "../../hooks/tagger/use_tagger_data"
import { LoadingDiv, Menu } from "../../components/tagger/tagger_buttons"
import LoadedWord from "./loaded_word"


export default function Tagger() {

    // Hooks
    const window_size = useWindowSize()
    const tagger = useTaggerData()

    // Constants
    const is_mobile = window_size[0] < mobile.break_point;

    return (
        <div style={{padding: "1rem"}}>
            {
                tagger.is_waiting_on_firebase
                ? <LoadingDiv />
                : (<>
                    <LoadedWord
                        loaded_word={tagger.loaded_word}
                        keep_word={tagger.keep_word}
                        discard_word={tagger.discard_word}
                        restore_word={tagger.restore_word}
                        load_previous_word={tagger.load_previous_word}
                        load_next_word={tagger.load_next_word}
                        get_previous_word={tagger.get_previous_word}
                        get_next_word={tagger.get_next_word}
                        update_loaded_word={tagger.update_loaded_word}
                        update_bookmark={tagger.update_bookmark}
                        is_mobile={is_mobile}
                        animation_state={'normal'}
                        selected_tags={tagger.selected_tags}
                        toggle_tag={tagger.toggle_tag}
                        is_word_torched={tagger.is_word_torched}
                    />
                    <p style={{padding: "1rem", color: "white", backgroundColor: (tagger.words_done_today >= defaults.daily_word_goal ? "green" : "red")}}>
                        {"Goal: " + tagger.words_done_today + " / " + defaults.daily_word_goal}
                    </p>
                    <div style={{padding: "1rem", backgroundColor: "#f0f0f0", borderRadius: "0.25rem", marginTop: "1rem"}}>
                        <h3 style={{margin: "0 0 0.5rem 0"}}>Progress Summary</h3>
                        <p style={{margin: "0.25rem 0"}}>Total Words Saved: {tagger.saved_word_count || 0}</p>
                        <p style={{margin: "0.25rem 0"}}>Total Words Processed: {tagger.total_words_done} ({(tagger.total_words_done / tagger.total_words_in_file * 100).toFixed(1)}%)</p>
                        <p style={{margin: "0.25rem 0"}}>Total Words in File: {tagger.total_words_in_file}</p>
                        <p style={{margin: "0.25rem 0"}}>Total Words Remaining: {tagger.total_words_remaining}</p>
                    </div>
                    <div style={{marginTop: "1rem"}}>
                    {/* <button onClick={download_saved_words}>Download Saved Words</button> */}
                    </div>
                    <Menu />
                    </>
                )
            }
        </div>
    )
}
