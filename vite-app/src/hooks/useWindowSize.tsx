import { useLayoutEffect, useState } from "react";

function useWindowSize() {
    const [size, set_size] = useState([0, 0])

    useLayoutEffect(() => {
        function update_size() {
            set_size([window.innerWidth, window.innerHeight])
        }
        window.addEventListener('resize', update_size)
        update_size()
        return () => window.removeEventListener('resize', update_size)
    }, [])

    return size
}

export default useWindowSize