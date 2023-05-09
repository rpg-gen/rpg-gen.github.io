import GlobalContext from "../contexts/global_context.jsx";
import { LoginForm } from "../routes/account_info.jsx";
import { useContext } from "react"

export default function LoginProtected({ children }) {

    const global_context = useContext(GlobalContext);

    return (
        <>
            {global_context.user == null
                ? <><p>Log in to view this content</p><LoginForm /></>
                : <>
                    {children}
                </>
            }

        </>
    )
}