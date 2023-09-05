import { Link } from "react-router-dom"

export default function MainMenu() {

    return (
        <>
        
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", flex: 1, justifyContent: "center"}}>

            <Link to="/map">Map</Link>

        </div>
        
        </>
    
    )
}