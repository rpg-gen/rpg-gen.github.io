const nav_paths = {
  map: "/map",
  delve_card_list: "/delve-cards",
  delve_card_edit: "/delve-cards/edit",
  delve_card_tags: "/delve-cards/tags",
  delve_card_decks: "/delve-cards/decks",
  delve_card_random: "/delve-cards/random",
  utilities_menu: "/utilities",
  utility_delve_card_migration: "/utilities/delve-card-migration"
}

const mobile = {
  break_point: 500
}

const page_layout = {
  // Standard page container style for consistent widths across pages
  container: {
    padding: "1rem",
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
    boxSizing: "border-box" as const,
    minHeight: "100vh"
  }
}

export { nav_paths, mobile, page_layout }