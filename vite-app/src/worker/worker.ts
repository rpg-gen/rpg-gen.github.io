
import { DocumentData } from "firebase/firestore"
import Matrix from "../classes/Matrix"

onmessage = (message: MessageEvent) => {

    const firebase_map_doc: DocumentData = message.data.firebase_map_doc
    const matrix = new Matrix()
    matrix.populate_matrix(firebase_map_doc)

    const canvas_height_pixels = message.data.canvas_height_pixels
    const canvas_width_pixels = message.data.canvas_width_pixels
    const hexagon_edge_pixels = message.data.hexagon_edge_pixels

    const offscreen_canvas = new OffscreenCanvas(canvas_width_pixels, canvas_height_pixels) as OffscreenCanvas
    const offscreen_context = offscreen_canvas.getContext("2d") as OffscreenCanvasRenderingContext2D

    matrix.paint_hexagons(offscreen_context, hexagon_edge_pixels)

    postMessage({
        bitmap: offscreen_canvas.transferToImageBitmap(),
    })
}
