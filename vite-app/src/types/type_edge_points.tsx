import enum_neighbor_type from "./enum_neighbor_type"
import type_coordinates from "./type_coordinates"

type type_edge_points = {[value in enum_neighbor_type]: type_coordinates}

export default type_edge_points