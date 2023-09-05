import HamMenu from "../components/ham_menu"
import Hexagon from "../components/hexagon"
import colors from "../configs/colors"

export default function Map () {

    return (
        <>
        
        <HamMenu />
        <Hexagon edge_length={60} color_hexidecimal={colors.blank_hex} />        
        <Hexagon edge_length={60} color_hexidecimal={colors.blank_hex} />        
        
        </>
    )
}