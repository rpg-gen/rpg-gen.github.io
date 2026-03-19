import { ReactNode, CSSProperties } from "react"
import { useNavigate } from "react-router-dom"
import loading_gif from "../../assets/loading.gif"


export function Button(props: {
    on_click_action: () => void,
    children: ReactNode,
    background_color?: string,
    font_color?: string,
    height?: number,
    disabled?: boolean
}) {

    function handle_click() {
        if (!props.disabled) {
            props.on_click_action()
        }
    }

    const button_style = {
        marginRight: ".25rem",
        borderRadius: ".25rem",
        borderWidth: "1px",
        backgroundColor: props.background_color || 'buttonface',
        color: props.font_color || 'black',
        padding: "1rem",
        minWidth: "8rem",
        opacity: props.disabled ? 0.5 : 1,
        cursor: props.disabled ? 'not-allowed' : 'pointer'
    }

    return <button style={button_style} onClick={handle_click} disabled={props.disabled}>{props.children}</button>
}


export function TagButton(props: {
    tag: string,
    isSelected: boolean,
    onClick: () => void,
    disabled?: boolean
}) {
    const button_style: CSSProperties = {
        padding: "0.5rem",
        borderRadius: "0.25rem",
        border: "1px solid #ccc",
        backgroundColor: props.isSelected ? "#007bff" : "#f8f9fa",
        color: props.isSelected ? "white" : "#333",
        cursor: props.disabled ? "not-allowed" : "pointer",
        fontSize: "0.875rem",
        fontWeight: props.isSelected ? "bold" : "normal",
        transition: "all 0.2s ease",
        textAlign: "center" as const,
        minHeight: "2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: props.disabled ? 0.5 : 1
    }

    return (
        <button style={button_style} onClick={props.onClick} disabled={props.disabled}>
            {props.tag}
        </button>
    )
}


export function LoadingDiv() {
    return <div style={{marginTop: "1rem"}}>
    <img height="20px" width="auto" src={loading_gif} />
    </div>
}


export function Menu() {
    const navigate = useNavigate()

    function handle_click() {
        navigate("/")
    }

    return (
        <div style={{marginTop: ".25rem"}}>
            <Button on_click_action={handle_click}>Main Menu</Button>
        </div>
    )
}
