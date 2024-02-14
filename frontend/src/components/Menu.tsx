import { useEffect } from "react"
import { useSocketContext } from "./SocketContext"
import { useCurrentLobbyContext } from "./CurrentLobbyContext"
import { Socket } from "socket.io-client"
import { PlayerType } from "../types"
import { Routes, Route } from "react-router-dom"
import Home from "../pages/Home"
import PrivateLobby from "../pages/PrivateLobby"
import PublicLobby from "../pages/PublicLobby"
import { ProtectedRouteUsername } from "./ProtectedRoutes"


export function GlobalMenu () {
    const { socket } = useSocketContext()
    const { currentLobbyInfos } = useCurrentLobbyContext()

    useEffect(() =>{
        function emitPlayerBackToMenu(socket: Socket, lobbyId: string | undefined, playerId: PlayerType['userId'], isPublic: boolean | undefined) {
            socket.emit('left-currentlobby', lobbyId, playerId, isPublic)
        }
        
        if (currentLobbyInfos !== undefined) {
            if (socket.id !== undefined) {
                emitPlayerBackToMenu(socket, currentLobbyInfos?.id, socket.id, currentLobbyInfos?.isPublic)
            }
        }

    }, [socket])

    return(
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/publiclobby' element={<ProtectedRouteUsername><PublicLobby /></ProtectedRouteUsername>} />
            <Route path='/privatelobby' element={<ProtectedRouteUsername><PrivateLobby /></ProtectedRouteUsername>} />
        </Routes>
    )
}