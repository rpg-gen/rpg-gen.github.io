import ham_menu_black from "../assets/ham_menu_black.svg";
import { Link } from "react-router-dom"

export default function HamMenu() {
    
    const ham_menu_height = 1
    const ham_menu_margin = .25

    return (
        <>
        
        <Link to="/">

        <img 
        
        style={{
            position: "fixed", 
            top: 0, 
            left: 0, 
            height: ham_menu_height.toString() + "rem", 
            width: ham_menu_height.toString() + "rem", 
            border: "1px solid black", 
            padding: ".1rem",
            marginLeft: ham_menu_margin.toString() + "rem",
            marginTop: ham_menu_margin.toString() + "rem",
            boxSizing: "border-box",
            borderRadius: "20%",
            backgroundColor: "white"
        }} 
        
        src={ham_menu_black} 

        />

        </Link>


        <div style={{height: (ham_menu_height + ham_menu_margin).toString() + "rem" }}></div>
        
        </>
    )
}