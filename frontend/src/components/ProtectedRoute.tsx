import { ReactElement, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCurrentLobbyContext } from "./CurrentLobbyContext"

type ProtectedRouteProp = {
    children: ReactElement
}

export default function ProtectedRoute({ children }: ProtectedRouteProp) {
    const navigate = useNavigate()
    const { currentLobbyInfos } = useCurrentLobbyContext()
    
    useEffect(() => {
        if (currentLobbyInfos === undefined) {
            navigate('/')
        }
    }, [currentLobbyInfos])

    return children
}