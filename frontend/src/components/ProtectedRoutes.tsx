import { ReactElement} from "react"
import { Navigate } from "react-router-dom"
import { useCurrentLobbyContext } from "./CurrentLobbyContext"

export function ProtectedRouteCurrentLobby({ children }: {children: ReactElement}) {
    const { currentLobbyInfos } = useCurrentLobbyContext()
    if (currentLobbyInfos === undefined) {
                return <Navigate to='/' replace/>
            }
    return children
}

export function ProtectedRouteUsername({ children }: {children: ReactElement}) {
    const username = localStorage.getItem('username')
    if (!username){
        return <Navigate to='/' replace/>
    }
    return children
}