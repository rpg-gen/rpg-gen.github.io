/*
  For logic related to using the HTML canvas element to draw
*/

import { get_hexagon_corner_points } from "./geometry"
import defaults from "../configs/defaults"
import colors from "../configs/colors"

function paint_hexagon(
  context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  edge_pixels: number,
  center_x: number,
  center_y: number,
  fill_color: string,
) {
  const path_2d = get_2d_path(get_hexagon_corner_points(center_x, center_y, edge_pixels))
  context.fillStyle = fill_color
  context.lineWidth = defaults.hexagon_stroke_width
  context.strokeStyle = colors.disabled
  context.fill(path_2d)
  context.stroke(path_2d)
}

function get_2d_path(points: {x: number, y: number}[]) {

  const path = new Path2D()
  path.moveTo(points[0].x, points[0].y)

  for (let index = 1; index < points.length; index++) {
      path.lineTo(points[index].x, points[index].y)
  }

  path.closePath()

  return path
}

function paint_line(
  context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  start_x: number,
  start_y: number,
  end_x: number,
  end_y: number,
  color: string,
  is_dashed: boolean,
  line_dash_array: number[] // edge_lenth / 4 works well
) {
  // context.setLineDash([]) // Not sure if this is needed

  if (is_dashed) {
    context.setLineDash(line_dash_array)
  }
  context.strokeStyle = color
  context.lineCap = "butt"
  context.lineWidth = 10
  context.fillStyle = color

  // Give the line a rounded end
  context.beginPath()
  context.arc(start_x, start_y, 5, 0, 2*Math.PI)
  context.fill()

  context.beginPath()
  context.moveTo(start_x, start_y)
  context.lineTo(end_x, end_y)
  context.stroke()
}

function paint_circle(
  context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  radius_pixels: number,
  center_x: number,
  center_y: number,
  color: string
) {
  context.fillStyle = color
  context.beginPath()
  context.arc(center_x, center_y, radius_pixels, 0, 2*Math.PI)
  context.fill()
}

export {
  paint_hexagon,
  paint_line,
  get_2d_path,
  paint_circle
}