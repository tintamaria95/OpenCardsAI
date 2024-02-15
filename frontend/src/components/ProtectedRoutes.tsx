import { ReactElement} from "react"
import { Navigate } from "react-router-dom"
import { useCurrentLobbyContext } from "./CurrentLobbyContext"

export function ProtectedRouteCurrentLobby({ children }: {children: ReactElement}) {
    const { currentLobby } = useCurrentLobbyContext()
    if (currentLobby === undefined) {
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

export function ForceHomePath({children, isActivated} : {children: ReactElement, isActivated: boolean}){
    return(
      (isActivated) ? (<Navigate to={'/'}/>) : (children)
    )
  }