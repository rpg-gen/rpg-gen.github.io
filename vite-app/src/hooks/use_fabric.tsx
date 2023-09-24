import type_hexagon_definitions from "../types/type_hexagon_definitions"
import { useRef, MutableRefObject } from "react"
import hexagon_math from "../utility/hexagon_math"
import spacing from "../configs/spacing"
import colors from "../configs/colors"
import { fabric } from "fabric"
import paint_brushes from "../configs/paint_brushes"
import { paint_category } from "../types/type_paint_brush"
import type_fabric_hook from '../types/type_fabric_hook'

type custom_attributes = {
    row_number: number, 
    column_number: number, 
    custom_type: string,
    paint_brush_id: string,
}

enum enum_custom_types {
    background="background",
    icon="icon",
    text="text",
}

export default function useFabric(
    edge_length: number,
    hexagon_definitions: type_hexagon_definitions,
    ref_paint_brush_id: MutableRefObject<string>,
    set_is_show_civ_picker: Function,
) {
    const HTML_ID = "canvas"

    const ref_canvas = useRef<fabric.Canvas>()
    const ref_clicked_row_number = useRef<number>(1)
    const ref_clicked_column_number = useRef<number>(1)

    function init_canvas() {

        if (ref_canvas.current != undefined) {
            ref_canvas.current.dispose()
        }

        const num_rows = Object.keys(hexagon_definitions).length
        const num_columns = num_rows
        const short_diagonal_length = hexagon_math.get_short_diagonal_length(edge_length)
        const peak_height = hexagon_math.get_peak_height(edge_length)
        const container_width = (num_columns * short_diagonal_length) + (short_diagonal_length/2) + (spacing.hex_grid_side_border * 2)
        const container_height = (num_rows * (peak_height + edge_length)) + spacing.hex_grid_top_border + peak_height


        const the_canvas = new fabric.Canvas(HTML_ID, {
            height: container_height,
            width: container_width,
            backgroundColor: colors.white,
            hoverCursor: "pointer"
        })

        for (let row_number = 1; row_number<= num_rows; row_number++) {
            for (let column_number = 1; column_number <= num_columns; column_number++) {
                const points = hexagon_math.get_fabric_points(edge_length, row_number, column_number)
                const fabric_hexagon = Object.assign(new fabric.Polygon(
                    [points.top_left, points.top_mid, points.top_right, points.bottom_right, points.bottom_mid, points.bottom_left],
                    {fill: colors.white, stroke: colors.black, strokeWidth: .2, "selectable": false, "perPixelTargetFind": true}
                ), {row_number: row_number.toString(), column_number: column_number.toString(), custom_type: enum_custom_types.background, paint_brush_id: "unset"})

                the_canvas.add(fabric_hexagon)
            }
        }

        the_canvas.on("mouse:down", function(options) {
            const target = options.target as fabric.Polygon & custom_attributes

            if (target != undefined) {
                const paint_brush = paint_brushes[ref_paint_brush_id.current]
                ref_clicked_row_number.current = target.row_number
                ref_clicked_column_number.current = target.column_number

                if (paint_brush.paint_category == paint_category.background) {
                    const object = find_object(target.row_number, target.column_number, enum_custom_types.background)

                    if (object) {
                        object.set("fill", paint_brushes[ref_paint_brush_id.current].hexidecimal_color)
                        object.set("paint_brush_id", paint_brushes[ref_paint_brush_id.current].id)
                    }
                }
                else if (paint_brush.paint_category == paint_category.icon) {
                    set_icon(target.row_number, target.column_number, paint_brushes[ref_paint_brush_id.current].id)
                }
            }
        })

        ref_canvas.current = the_canvas
    }

    function find_object(row_number: number, column_number: number, custom_type?: string) {
        if (ref_canvas.current == undefined) {
            return
        }

        const all_objects = ref_canvas.current.getObjects()

        for (const object_key in all_objects) {
            const object = all_objects[object_key] as fabric.Object & custom_attributes
            if ((!custom_type || object.custom_type == custom_type) && object.row_number == row_number && object.column_number == column_number) {
                return object
            }
        }
    }

    function find_objects(row_number: number, column_number: number) {
        if (ref_canvas.current == undefined) {
            return
        }

        const objects: [{[index: string]: fabric.Object & custom_attributes}] = [{}]

        const all_objects = ref_canvas.current.getObjects()

        for (const object_key in all_objects) {
            const object = all_objects[object_key] as fabric.Object & custom_attributes
            if (object.row_number == row_number && object.column_number == column_number) {
                objects.push({[object.custom_type]: object})
            }
        }

        return objects
    }

    function get_town_icon_points() {

        const points = hexagon_math.get_fabric_points(edge_length, ref_clicked_row_number.current, ref_clicked_column_number.current)

        const roof_bottom_y = points.top_left.y + (edge_length / 3)
        const roof_edge_shrink_x = (edge_length / 4)
        const wall_edge_shrink_x = edge_length / 2.5

        // const house_icon = Object.assign(new fabric.Polygon(
        //     ,
        //     {fill: colors.black, "selectable": false, strokeLineJoin: "round", stroke: colors.black, strokeWidth: 5}
        // ), {row_number: row_number, column_number: column_number, custom_type: enum_custom_types.icon, paint_brush_id: })
        
        const house_icon_points = [
            {x: points.top_left.x + roof_edge_shrink_x, y: roof_bottom_y},
            {x: points.top_mid.x, y: points.top_mid.y + (edge_length/3)},
            {x: points.top_right.x - roof_edge_shrink_x, y: roof_bottom_y},
            {x: points.top_right.x - wall_edge_shrink_x, y: roof_bottom_y},
            {x: points.bottom_right.x - wall_edge_shrink_x, y: points.bottom_right.y },
            {x: points.bottom_left.x + wall_edge_shrink_x, y: points.bottom_left.y },
            {x: points.top_left.x + wall_edge_shrink_x, y: roof_bottom_y },
        ]

        return house_icon_points
    }

    function set_icon(row_number: number, column_number: number, paint_brush_id: string) {
        if (!ref_canvas.current) {
            return
        }

        // console.log(find_objects(ref_clicked_row_number.current, ref_clicked_column_number.current))

        const existing_icon = find_object(ref_clicked_row_number.current, ref_clicked_column_number.current, enum_custom_types.icon) as fabric.Polygon & custom_attributes
        
        if (existing_icon) {
            if (existing_icon.paint_brush_id == paint_brush_id) {
                set_is_show_civ_picker(true)
                return
            }
            if (existing_icon.paint_brush_id != paint_brush_id) {
                console.log("remove")
                ref_canvas.current.remove(existing_icon)
            }
        }
        
        const common_icon_attributes = {fill: colors.black, "selectable": false, strokeLineJoin: "round", stroke: colors.black, strokeWidth: 5}
        const custom_attributes = {row_number: row_number, column_number: column_number, custom_type: enum_custom_types.icon, paint_brush_id: paint_brush_id}
        
        const icon_to_add = Object.assign(new fabric.Polygon(get_town_icon_points(),common_icon_attributes),custom_attributes)

        ref_canvas.current.add(icon_to_add)

        set_is_show_civ_picker(true)

    }

    function get_civ_info() {

        const existing_text = find_object(ref_clicked_row_number.current, ref_clicked_column_number.current, enum_custom_types.text) as fabric.Text & custom_attributes

        let previous_size = "0"
        let previous_race = "0"
        let previous_affinity = "0"

        if (existing_text && existing_text.text) {
            const split_text = existing_text.text.split("") 
            previous_size = split_text[0]
            previous_race = split_text[1]
            previous_affinity = split_text[2]
        }

        return [previous_size, previous_race, previous_affinity]

    }

    function add_civ_info(size: number, race: number, affinity: number) {
        if (!ref_canvas.current) {
            return
        }

        const new_text_string = size.toString() + race.toString() + affinity.toString()

        const existing_text = find_object(ref_clicked_row_number.current, ref_clicked_column_number.current, enum_custom_types.text) as fabric.Text & custom_attributes

        if (!existing_text) {
            const points = hexagon_math.get_fabric_points(edge_length, ref_clicked_row_number.current, ref_clicked_column_number.current)
            const text = Object.assign(
                new fabric.Text(
                    new_text_string,
                    {"selectable": false, fill: colors.white, fontSize: edge_length/2}
                ),
                {row_number: ref_clicked_row_number.current, column_number: ref_clicked_column_number.current, custom_type: enum_custom_types.text}
            )
            text.setPositionByOrigin(new fabric.Point(points.center.x, points.center.y), "center", "center")
            ref_canvas.current.add(text)
        }
        else {
            console.log("setting new text to " + new_text_string)
            existing_text.set("text", new_text_string)
            ref_canvas.current.renderAll()
        }

    }

    function get_html_stub() {
        return <canvas id={HTML_ID}></canvas>
    }

    const type_fabric_hook: type_fabric_hook = {
        init_canvas,
        get_html_stub,
        ref_canvas,
        ref_clicked_row_number,
        ref_clicked_column_number,
        add_civ_info,
        get_civ_info,
    }

    return type_fabric_hook
}