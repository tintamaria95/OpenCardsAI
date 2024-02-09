import { useEffect } from "react"
import { useSocketContext } from "../components/SocketContext"
import { LobbyInfosType } from "../types"
import { useCurrentLobbyContext } from "../components/CurrentLobbyContext"
import { PlayerType } from "../types"
import { Socket } from "socket.io-client"
import { Link } from "react-router-dom"

export default function CurrentLobby() {
    const { socket } = useSocketContext()
    const { currentLobbyInfos, setCurrentLobbyInfos } = useCurrentLobbyContext()
    

    useEffect(() => {

        function emitPlayerJoinLobby(socket: Socket, lobbyId: string | undefined, player: PlayerType, isPublic: boolean | undefined) {
            socket.emit('join-currentlobby', lobbyId, player, isPublic)
        }
        function emitPlayerLeftLobby(socket: Socket, lobbyId: string | undefined, playerId: PlayerType['id'], isPublic: boolean | undefined) {
            socket.emit('left-currentlobby', lobbyId, playerId, isPublic)
        }

        if (socket.id !== undefined){
            emitPlayerJoinLobby(socket, currentLobbyInfos?.id, {id: socket.id, name: socket.id}, currentLobbyInfos?.isPublic)
        }
        
        return () => {
            if (socket.id !== undefined){
                emitPlayerLeftLobby(socket, currentLobbyInfos?.id, socket.id, currentLobbyInfos?.isPublic)
            }
        }
    }, [socket, currentLobbyInfos?.id, currentLobbyInfos?.isPublic])

    useEffect(() => {

        function updateLobbyInfos(lobbyInfos: LobbyInfosType) {
            setCurrentLobbyInfos(lobbyInfos)
        }
        socket.on('update-currentlobby', updateLobbyInfos)


        return () => {
            socket.off('update-currentlobby', updateLobbyInfos)
        }

    }, [socket, setCurrentLobbyInfos])


    return (
        <>
        <h1>In Lobby</h1>
        {(currentLobbyInfos == undefined) ? (
            <div>Error: currentLobbyInfos var is undefined.</div>
        ) : (<> {(currentLobbyInfos.players.length > 0) ? (
            currentLobbyInfos.players.map((player, index) => (
                <li key={index}>{player.name}</li>
            ))
        ) : (
            <div>No player found... There might be an error somewhere</div>)}
        </>)}
        <Link to={'/'}>retour</Link>
    </>
    )
}