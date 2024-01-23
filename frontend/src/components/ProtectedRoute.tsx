import { ReactElement } from "react"
import { Navigate } from "react-router-dom"
import { LobbyInfosType } from "../types/lobbyInfo"

type ProtectedRouteProp = {
    lobbyInfos: LobbyInfosType,
    children: ReactElement
}
export default function ProtectedRoute ({lobbyInfos, children}: ProtectedRouteProp ){
    if(lobbyInfos.id === undefined){
        return <Navigate to="/" replace/>
    }
    return children
}