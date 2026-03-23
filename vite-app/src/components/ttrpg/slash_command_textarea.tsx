import { useState, useRef } from "react"
import TtrpgLoreEntry, { LoreEntryType } from "../../types/ttrpg/TtrpgLoreEntry"
import TtrpgMember from "../../types/ttrpg/TtrpgMember"
import TtrpgQuest from "../../types/ttrpg/TtrpgQuest"
import TtrpgProject from "../../types/ttrpg/TtrpgProject"
import { ModalTriggerState, TriggerKind } from "./slash_command_types"
import SlashCommandModal from "./slash_command_modal"
import AutoResizeTextarea from "./auto_resize_textarea"

interface SlashCommandTextareaProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    loreEntries: TtrpgLoreEntry[]
    members: TtrpgMember[]
    quests?: TtrpgQuest[]
    projects?: TtrpgProject[]
    onCreateLore: (name: string, type: LoreEntryType) => void
    style?: React.CSSProperties
}

export default function SlashCommandTextarea({ value, onChange, placeholder, loreEntries, members, quests, projects, onCreateLore, style }: SlashCommandTextareaProps) {
    const [trigger, setTrigger] = useState<ModalTriggerState | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    function openModal(kind: TriggerKind, index: number, textWithoutTrigger: string) {
        setTrigger({ kind, triggerIndex: index })
        onChange(textWithoutTrigger)
    }

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        const newValue = e.target.value
        const cursorPos = e.target.selectionStart

        // Skip trigger detection on deletion (e.g. backspacing into a [[mention]])
        const isDeleting = newValue.length < value.length

        // Detect `[[` trigger
        if (!isDeleting && cursorPos >= 2 && newValue[cursorPos - 1] === "[" && newValue[cursorPos - 2] === "[") {
            const stripped = newValue.slice(0, cursorPos - 2) + newValue.slice(cursorPos)
            openModal("bracket", cursorPos - 2, stripped)
            return
        }

        // Detect `/` trigger — only at start or after whitespace
        if (!isDeleting && cursorPos >= 1 && newValue[cursorPos - 1] === "/") {
            const charBefore = cursorPos >= 2 ? newValue[cursorPos - 2] : undefined
            if (charBefore === undefined || charBefore === " " || charBefore === "\n" || charBefore === "\t") {
                const stripped = newValue.slice(0, cursorPos - 1) + newValue.slice(cursorPos)
                openModal("slash", cursorPos - 1, stripped)
                return
            }
        }

        onChange(newValue)
    }

    function handleSelect(name: string) {
        if (!trigger) return
        const before = value.slice(0, trigger.triggerIndex)
        const after = value.slice(trigger.triggerIndex)
        const insertion = "[[" + name + "]]"
        const newValue = before + insertion + after
        const cursorTarget = before.length + insertion.length
        onChange(newValue)
        setTrigger(null)
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.focus()
                textareaRef.current.setSelectionRange(cursorTarget, cursorTarget)
            }
        })
    }

    function handleDismiss() {
        if (!trigger) return
        const triggerChars = trigger.kind === "bracket" ? "[[" : "/"
        const before = value.slice(0, trigger.triggerIndex)
        const after = value.slice(trigger.triggerIndex)
        onChange(before + triggerChars + after)
        setTrigger(null)
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.focus()
                const pos = trigger.triggerIndex + triggerChars.length
                textareaRef.current.setSelectionRange(pos, pos)
            }
        })
    }

    function handleCreateLore(name: string, type: LoreEntryType) {
        onCreateLore(name, type)
    }

    return (
        <div style={{ position: "relative" }}>
            <AutoResizeTextarea
                textareaRef={textareaRef}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                style={style}
            />
            {trigger && (
                <SlashCommandModal
                    loreEntries={loreEntries}
                    members={members}
                    quests={quests}
                    projects={projects}
                    onSelect={handleSelect}
                    onCreateLore={handleCreateLore}
                    onDismiss={handleDismiss}
                />
            )}
        </div>
    )
}
