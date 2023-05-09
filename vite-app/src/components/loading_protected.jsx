import Loading from "./loading.jsx";

export default function LoadingProtected({is_loading, children}) {
    return (is_loading ? <Loading /> : children)
}