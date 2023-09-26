import { useState, MouseEvent, memo } from "react"

export default memo(function MapSize(props: {
    default_edge_length: number,
    default_num_rows: number,
    set_edge_length: Function,
    set_num_rows: Function,
    is_show_loading: boolean
}) {
    const [edge_length, set_edge_length] = useState(props.default_edge_length)
    const [num_rows, set_num_rows] = useState(props.default_num_rows)

    function handle_num_rows_change(event: React.FormEvent<HTMLInputElement>) {
        set_num_rows(parseInt((event.target as HTMLInputElement).value || "0"))
    }

    const input_style: React.CSSProperties = {
        width: "50px",
        textAlign: "center"
    }

    function handle_submit(event: React.FormEvent) {
        event.preventDefault()
        props.set_edge_length(edge_length)
        props.set_num_rows(num_rows)
    }

    return (
        <>

        <form onSubmit={handle_submit}>
            <input style={input_style} type="number" name="num_rows" value={num_rows} size={1} onChange={handle_num_rows_change} />
            &nbsp;x&nbsp;
            <input style={input_style} type="number" disabled value={num_rows} />
            &nbsp;
            <label htmlFor="edge_length">Edge</label>
            <input name="edge_length" style={input_style} type="number" value={edge_length} onChange={(e) => {set_edge_length(parseInt(e.target.value))}} />
            &nbsp;
            <button disabled={props.is_show_loading ? true : false} type="submit">Draw</button>
        </form>

        </>
    )
})