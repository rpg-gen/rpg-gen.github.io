import { useEffect, useRef } from "react"
import { textareaStyle } from "../../pages/ttrpg/campaign_detail_styles"

interface AutoResizeTextareaProps {
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    placeholder?: string
    style?: React.CSSProperties
    textareaRef?: React.RefObject<HTMLTextAreaElement>
}

export default function AutoResizeTextarea({ value, onChange, placeholder, style, textareaRef }: AutoResizeTextareaProps) {
    const internalRef = useRef<HTMLTextAreaElement>(null)
    const ref = textareaRef || internalRef

    useEffect(() => {
        const el = ref.current
        if (!el) return
        el.style.height = "auto"
        el.style.height = el.scrollHeight + "px"
    }, [value, ref])

    return (
        <textarea
            ref={ref}
            className="ttrpg-textarea"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{ ...textareaStyle, ...style }}
        />
    )
}
