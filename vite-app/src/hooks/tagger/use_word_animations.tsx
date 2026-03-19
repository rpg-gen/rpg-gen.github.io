import { useState, useEffect } from "react"
import defaults from "../../configs/defaults"


interface UseWordAnimationsProps {
    loaded_word: string | undefined
    get_previous_word: () => string
    get_next_word: () => string
    update_loaded_word: (word: string) => void
    update_bookmark: (word: string | undefined) => void
    discard_word: () => Promise<void>
}


export default function useWordAnimations(props: UseWordAnimationsProps) {

    // Animation State
    const [loaded_definition, set_loaded_definition] = useState<string>("")
    const [is_flame_visible, set_is_flame_visible] = useState(false)
    const [flame_opacity, set_flame_opacity] = useState(0)
    const [flame_scale, set_flame_scale] = useState(0.1)
    const [word_opacity, set_word_opacity] = useState(1)
    const [word_y_offset, set_word_y_offset] = useState(0)
    const [word_x_offset, set_word_x_offset] = useState(0)
    const [is_animating, set_is_animating] = useState(false)
    const [old_word, set_old_word] = useState<string>("")
    const [new_word, set_new_word] = useState<string>("")
    const [old_word_x, set_old_word_x] = useState(0)
    const [old_word_opacity, set_old_word_opacity] = useState(1)
    const [new_word_x, set_new_word_x] = useState(0)
    const [new_word_opacity, set_new_word_opacity] = useState(0)
    const [showing_both_words, set_showing_both_words] = useState(false)
    const [is_torch_animation, set_is_torch_animation] = useState(false)

    // Reset animation state when word changes
    useEffect(() => {
        set_is_flame_visible(false)
        set_flame_opacity(0)
        set_flame_scale(0.1)
        set_word_opacity(1)
        set_word_y_offset(0)
        set_word_x_offset(0)
        set_is_animating(false)
        set_showing_both_words(false)
        set_old_word("")
        set_new_word("")
        set_old_word_x(0)
        set_old_word_opacity(1)
        set_new_word_x(0)
        set_new_word_opacity(0)
    }, [props.loaded_word])

    // Handlers

    async function handle_prev_click() {
        if (is_animating) return

        set_is_animating(true)

        // Store current word and get new word
        const currentWord = props.loaded_word || ""
        const previousWord = props.get_previous_word()

        set_old_word(currentWord)
        set_new_word(previousWord)
        set_showing_both_words(true)

        // Position old word at center, new word off-screen to the left
        set_old_word_x(0)
        set_old_word_opacity(1)
        set_new_word_x(-300)
        set_new_word_opacity(0)

        // Animate both words simultaneously
        for (let i = 0; i <= 15; i++) {
            // Old word slides out to the right
            set_old_word_x(i * 20)
            set_old_word_opacity(1 - (i * 0.07))

            // New word slides in from the left
            set_new_word_x(-300 + (i * 20))
            set_new_word_opacity(i * 0.07)

            await new Promise(resolve => setTimeout(resolve, 15))
        }

        // Update state with new word
        props.update_loaded_word(previousWord)
        props.update_bookmark(previousWord)

        // Reset animation state
        set_showing_both_words(false)
        set_is_animating(false)
    }

    async function handle_next_click() {
        if (is_animating) return

        set_is_animating(true)

        // Store current word and get new word
        const currentWord = props.loaded_word || ""
        const nextWord = props.get_next_word()

        set_old_word(currentWord)
        set_new_word(nextWord)
        set_showing_both_words(true)

        // Position old word at center, new word off-screen to the right
        set_old_word_x(0)
        set_old_word_opacity(1)
        set_new_word_x(300)
        set_new_word_opacity(0)

        // Animate both words simultaneously
        for (let i = 0; i <= 15; i++) {
            // Old word slides out to the left
            set_old_word_x(-i * 20)
            set_old_word_opacity(1 - (i * 0.07))

            // New word slides in from the right
            set_new_word_x(300 - (i * 20))
            set_new_word_opacity(i * 0.07)

            await new Promise(resolve => setTimeout(resolve, 15))
        }

        // Update state with new word
        props.update_loaded_word(nextWord)
        props.update_bookmark(nextWord)

        // Reset animation state
        set_showing_both_words(false)
        set_is_animating(false)
    }

    async function handle_click_discard() {
        if (is_animating) return // Prevent multiple clicks during animation

        set_is_animating(true)
        set_is_torch_animation(true)

        // Start flame animation
        set_is_flame_visible(true)

        // Animate flame growing and fading in
        const flameAnimation = async () => {
            // Calculate timing values from base timing
            const base_timing = defaults.torch_animation_base_timing
            const fast_timing = base_timing
            const medium_timing = base_timing * 2

            // Phase 1: Grow flame and fade in, word starts disappearing earlier
            for (let i = 0; i <= 20; i++) {
                set_flame_scale(0.1 + (i * 0.045)) // 0.1 to 1.0
                set_flame_opacity(i * 0.05) // 0 to 1
                // Start fading word earlier - at 1/4 through flame growth
                if (i >= 5) {
                    const fadeProgress = (i - 5) / 15 // 0 to 1 over 15 steps
                    set_word_opacity(Math.max(0, 1 - fadeProgress)) // 1 to 0 over 15 steps
                }
                await new Promise(resolve => setTimeout(resolve, fast_timing))
            }

            // Phase 2: Continue growing flame while word continues fading, then start fading flame
            for (let i = 0; i <= 10; i++) {
                set_flame_scale(1.0 + (i * 0.1)) // 1.0 to 2.0 (keep growing)
                // Word should be fully faded by now, but ensure it stays at 0
                set_word_opacity(0)
                // Start fading flame halfway through this phase
                if (i >= 5) {
                    set_flame_opacity(1 - ((i - 5) * 0.2)) // 1 to 0 over last 5 steps
                }
                await new Promise(resolve => setTimeout(resolve, medium_timing))
            }

            // Phase 3: Complete flame fade out and start sliding animation
            for (let i = 0; i <= 10; i++) {
                set_flame_opacity(0 - (i * 0.1)) // 0 to -1 (ensure it's fully gone)

                // Start sliding animation halfway through flame fade
                if (i === 5) {
                    // Actually discard the word to Firebase
                    await props.discard_word()

                    // Store current word and get new word
                    const currentWord = props.loaded_word || ""
                    const nextWord = props.get_next_word()

                    set_old_word(currentWord)
                    set_new_word(nextWord)
                    set_showing_both_words(true)

                    // Position old word at center (but keep it faded out), new word off-screen to the right
                    set_old_word_x(0)
                    set_old_word_opacity(0) // Keep old word faded out
                    set_new_word_x(300)
                    set_new_word_opacity(0)

                    // Animate new word sliding in from the right (old word already faded out with flame)
                    for (let j = 0; j <= 15; j++) {
                        // Old word stays in place and already faded out (opacity stays at 0)
                        set_old_word_x(0)
                        set_old_word_opacity(0)

                        // New word slides in from the right
                        set_new_word_x(300 - (j * 20))
                        set_new_word_opacity(j * 0.07)

                        await new Promise(resolve => setTimeout(resolve, 15))
                    }

                    // Update state with new word
                    props.update_loaded_word(nextWord)
                    props.update_bookmark(nextWord)

                    // Reset animation state
                    set_showing_both_words(false)
                }

                await new Promise(resolve => setTimeout(resolve, fast_timing))
            }

            // Hide flame
            set_is_flame_visible(false)
            set_is_animating(false)
            set_is_torch_animation(false)
        }

        flameAnimation()
    }

    return {
        loaded_definition,
        set_loaded_definition,
        is_flame_visible,
        flame_opacity,
        flame_scale,
        word_opacity,
        word_y_offset,
        word_x_offset,
        is_animating,
        old_word,
        new_word,
        old_word_x,
        old_word_opacity,
        new_word_x,
        new_word_opacity,
        showing_both_words,
        is_torch_animation,
        handle_prev_click,
        handle_next_click,
        handle_click_discard
    }
}
