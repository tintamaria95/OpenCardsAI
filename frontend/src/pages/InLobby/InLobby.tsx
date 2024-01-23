import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { socket } from "../../App/App"
import { lobbyInfos } from "../../App/App"
import { LobbyInfosType } from "../../types/lobbyInfo"

export default function InLobby() {
    const [infos, setInfos] = useState(lobbyInfos)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {

        function updateLobbyInfos(serverInfos: LobbyInfosType){
            // setInfos(serverInfos)
        }
        socket.on('update-lobby', updateLobbyInfos)

        socket.emit('join-lobby', {lobbyId: infos.id, playerInfo: {id: socket.id, name: "WARNINGTempNameToStore"}})

        return() => {
            socket.emit('leave-lobby', {lobbyId: infos.id, playerId: socket.id})
            socket.off('update-lobby', updateLobbyInfos)
        
        }
    })


    return (
        <>
            <h1>In Lobby</h1>
            {(isLoading) ? (
                <div>LOADING PLAYER IDS IN LOBBY...</div>
            ) : (<> {(infos.players !== undefined) ? (
                infos.players.map((player, index) => (
                    <li key={index}>{player.name}</li>
                ))
            ) : (
                <div>No player found... There might be an error somewhere</div>)}
            </>)}
            <Link to={'/publiclobby'}>retour</Link>
        </>
    )
}