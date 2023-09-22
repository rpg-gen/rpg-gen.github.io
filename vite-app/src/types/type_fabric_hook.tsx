import {MutableRefObject} from "react"
import { fabric } from "fabric"

type type_fabric_hook = {
    init_canvas: Function,
    get_html_stub: Function,
    ref_canvas: MutableRefObject<fabric.Canvas | undefined>,
    ref_clicked_row_number: MutableRefObject<number>,
    ref_clicked_column_number: MutableRefObject<number>,
    add_civ_info: Function,
}

export default type_fabric_hook