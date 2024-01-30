import { useState } from "react";
import { socket } from "../../App/App";
import { LobbyInfosType } from "../../types";
import { Socket } from "socket.io-client";

type LobbyToCreatePropType = {
    isPublic: boolean
}

export default function LobbyToCreate({isPublic}: LobbyToCreatePropType) {
    const [lobbyName, setLobbyName] = useState("reallyOriginalLobbyName")
    const [isLoading, setIsLoading] = useState(false)  

    function emitCreateLobby(socket: Socket, lobbyInfos: LobbyInfosType){
        socket.emit('req-create-lobby', lobbyInfos)
    }

    function handleCreateNewLobby() {
        if (socket.id !== undefined) {
            setIsLoading(true)
            const newLobbyInfos: LobbyInfosType = {
                id: 'temp',
                name: lobbyName,
                isPublic: isPublic,
                players: [{id: socket.id, name: socket.id}]
            }
            emitCreateLobby(
                socket, newLobbyInfos
            )
        }
    }

    
    return ((isLoading) ? (
        <div>LOADING...</div>) : (
        <>
            <input placeholder={"reallyOriginalLobbyName"} onChange={e => setLobbyName(e.target.value)} />
            <button onClick={handleCreateNewLobby}>Create new lobby</button>
        </>)

    )
}