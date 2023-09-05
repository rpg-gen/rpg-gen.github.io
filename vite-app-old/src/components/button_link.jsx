import { Link } from "react-router-dom";

export default function ButtonLink ({to, children}) {

    const button_style = {
        // display: "inline-block",
    }

    return (
        <Link to={to}>
            <button style={button_style}>{children}</button>
        </Link>
    )
}