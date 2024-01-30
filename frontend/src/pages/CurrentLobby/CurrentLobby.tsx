import { useEffect } from "react"
import { socket } from "../../App/App"
import CurrentLobbyComponent from "./CurrentLobbyComponent"
import { useCurrentLobbyContext } from "../../components/CurrentLobbyContext"
import { PlayerType } from "../../types"
import { Socket } from "socket.io-client"

export default function CurrentLobby() {
    const { currentLobbyInfos } = useCurrentLobbyContext()

    useEffect(() => {

        function emitPlayerJoinLobby(socket: Socket, lobbyId: string | undefined, player: PlayerType) {
            socket.emit('join-currentlobby', lobbyId, player)
        }
        function emitPlayerLeftLobby(socket: Socket, lobbyId: string | undefined, playerId: PlayerType['id']) {
            socket.emit('left-currentlobby', lobbyId, playerId)
        }

        if (socket.id !== undefined){
            emitPlayerJoinLobby(socket, currentLobbyInfos?.id, {id: socket.id, name: socket.id})
        }
        
        return () => {
            if (socket.id !== undefined){
                emitPlayerLeftLobby(socket, currentLobbyInfos?.id, socket.id)
            }
        }
    }, [])


    return (
        <CurrentLobbyComponent/>
    )
}