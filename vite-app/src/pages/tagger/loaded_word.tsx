import { useEffect, CSSProperties } from "react"
import { Button, TagButton } from "../../components/tagger/tagger_buttons"
import { NOUN_CATEGORIES, DESCRIPTOR_TAGS } from "../../configs/tagger_constants"
import { get_definition_for_word } from "../../utility/tagger_word_utils"
import useWordAnimations from "../../hooks/tagger/use_word_animations"
import flame_icon from "../../assets/flame.svg"


interface LoadedWordProps {
    loaded_word: string | undefined
    keep_word: () => void
    discard_word: () => Promise<void>
    restore_word: () => Promise<void>
    load_previous_word: () => void
    load_next_word: () => void
    get_previous_word: () => string
    get_next_word: () => string
    update_loaded_word: (word: string) => void
    update_bookmark: (word: string | undefined) => void
    is_mobile: boolean
    animation_state: 'normal' | 'falling'
    selected_tags: string[]
    toggle_tag: (tag: string) => void
    is_word_torched: boolean
}


export default function LoadedWord(props: LoadedWordProps) {

    const anim = useWordAnimations({
        loaded_word: props.loaded_word,
        get_previous_word: props.get_previous_word,
        get_next_word: props.get_next_word,
        update_loaded_word: props.update_loaded_word,
        update_bookmark: props.update_bookmark,
        discard_word: props.discard_word
    })

    function load_definition() {
        if (props.loaded_word) {
            const definition = get_definition_for_word(props.loaded_word)
            if (definition) {
                anim.set_loaded_definition(definition)
            } else {
                anim.set_loaded_definition("No definition found in file")
            }
        }
    }

    // Load definition whenever the word changes
    useEffect(() => {
        load_definition()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.loaded_word])

    // Styles

    const button_row_style: CSSProperties = {}

    if (props.is_mobile) {
        button_row_style.display = "flex"
        button_row_style.justifyContent = "space-between"
    }

    const word_container_style: CSSProperties = {
        position: 'relative',
        height: '4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden'
    }

    const word_style: CSSProperties = {
        fontSize: "2rem",
        opacity: anim.word_opacity,
        transform: `translateY(${anim.word_y_offset}px) translateX(${anim.word_x_offset}px)`,
        transition: anim.is_animating ? 'none' : 'opacity 0.2s ease, transform 0.5s ease',
        animation: props.animation_state === 'falling' ? 'fallIn 0.5s ease-out' : 'none'
    }

    const flame_style: CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '0%',
        transform: `translateY(-50%) scale(${anim.flame_scale})`,
        opacity: anim.flame_opacity,
        zIndex: 9999,
        pointerEvents: 'none'
    }

    const left_flame_style: CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '0%',
        transform: `translateY(-50%) scale(${anim.flame_scale}) translateX(-40px)`,
        opacity: anim.flame_opacity,
        zIndex: 9999,
        pointerEvents: 'none'
    }

    const right_flame_style: CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '0%',
        transform: `translateY(-50%) scale(${anim.flame_scale}) translateX(40px)`,
        opacity: anim.flame_opacity,
        zIndex: 9999,
        pointerEvents: 'none'
    }

    return (
        <div>
            <style>
                {`
                    @keyframes fallIn {
                        0% {
                            transform: translateY(-50px);
                            opacity: 0;
                        }
                        100% {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }
                `}
            </style>
            <div style={word_container_style}>
                {anim.showing_both_words ? (
                    <>
                        <p style={{
                            fontSize: "2rem",
                            transform: `translateY(${anim.word_y_offset}px) translateX(${anim.old_word_x}px)`,
                            opacity: anim.is_torch_animation ? 0 : anim.old_word_opacity, // Always fade out in torch animation
                            transition: 'none',
                            position: 'absolute',
                            left: 0
                        }}>{anim.old_word}</p>
                        <p style={{
                            fontSize: "2rem",
                            transform: `translateY(${anim.word_y_offset}px) translateX(${anim.new_word_x}px)`,
                            opacity: anim.new_word_opacity,
                            transition: 'none',
                            position: 'absolute',
                            left: 0
                        }}>{anim.new_word}</p>
                    </>
                ) : (
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <p style={{
                            ...word_style,
                            opacity: anim.is_torch_animation ? anim.word_opacity : (props.is_word_torched ? 0.5 : 1),
                            color: props.is_word_torched ? '#666' : 'inherit'
                        }}>{props.loaded_word}</p>
                        {props.is_word_torched && (
                            <img
                                src={flame_icon}
                                alt="Torched"
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    opacity: 0.7
                                }}
                            />
                        )}
                    </div>
                )}
                {anim.is_flame_visible && (
                    <>
                        <img
                            src={flame_icon}
                            alt="Flame"
                            style={left_flame_style}
                            width="100"
                            height="100"
                        />
                        <img
                            src={flame_icon}
                            alt="Flame"
                            style={flame_style}
                            width="100"
                            height="100"
                        />
                        <img
                            src={flame_icon}
                            alt="Flame"
                            style={right_flame_style}
                            width="100"
                            height="100"
                        />
                    </>
                )}
            </div>
            <div style={button_row_style}>
                <Button on_click_action={anim.handle_prev_click} background_color="blue" font_color="white" disabled={anim.is_animating}>Prev</Button>
                <Button on_click_action={anim.handle_next_click} background_color="green" font_color="white" disabled={anim.is_animating}>Next</Button>
                {props.is_word_torched ? (
                    <Button on_click_action={props.restore_word} background_color="orange" font_color="white" disabled={anim.is_animating}>Restore</Button>
                ) : (
                    <Button on_click_action={anim.handle_click_discard} background_color="red" font_color="white" disabled={anim.is_animating}>Torch</Button>
                )}
            </div>

            {/* Tag Buttons Grid */}
            <div style={{marginTop: "1rem"}}>
                <h4 style={{margin: "0 0 0.5rem 0"}}>Noun Categories</h4>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                    gap: "0.5rem",
                    maxWidth: "100%",
                    marginBottom: "1rem"
                }}>
                    {NOUN_CATEGORIES.map((tag) => (
                        <TagButton
                            key={tag}
                            tag={tag}
                            isSelected={props.selected_tags.includes(tag)}
                            onClick={() => props.toggle_tag(tag)}
                            disabled={anim.is_animating || props.is_word_torched}
                        />
                    ))}
                </div>

                <h4 style={{margin: "0 0 0.5rem 0"}}>Descriptors:</h4>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                    gap: "0.5rem",
                    maxWidth: "100%"
                }}>
                    {DESCRIPTOR_TAGS.map((tag) => (
                        <TagButton
                            key={tag}
                            tag={tag}
                            isSelected={props.selected_tags.includes(tag)}
                            onClick={() => props.toggle_tag(tag)}
                            disabled={anim.is_animating || props.is_word_torched}
                        />
                    ))}
                </div>
            </div>

            <div style={{minHeight: "4rem", marginTop: "16px"}}>
                {anim.loaded_definition && <p>{anim.loaded_definition}</p>}
            </div>
        </div>
    )
}
