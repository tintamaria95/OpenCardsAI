import { useState } from "react";
import { useSocketContext } from "./SocketContext";
import { LobbyInfosType } from "../types";
import { Socket } from "socket.io-client";
import { useUserContext } from "./UserContext";

type LobbyToCreatePropType = {
    isPublic: boolean
}

export default function LobbyToCreate({isPublic}: LobbyToCreatePropType) {
    const { socket } = useSocketContext()
    const { username } = useUserContext()
    const [lobbyName, setLobbyName] = useState(username + "'s lobby")

    function emitCreateLobby(socket: Socket, lobbyInfos: LobbyInfosType){
        socket.emit('req-create-lobby', lobbyInfos)
    }

    function handleCreateNewLobby() {
        if (socket.id !== undefined) {
            const newLobbyInfos: LobbyInfosType = {
                id: 'temp',
                name: lobbyName,
                isPublic: isPublic,
                players: []
            }
            emitCreateLobby(
                socket, newLobbyInfos
            )
        }
    }

    
    return (
        <>
            <input placeholder={"reallyOriginalLobbyName"} onChange={e => setLobbyName(e.target.value)} />
            <button onClick={handleCreateNewLobby}>Create new lobby</button>
        </>

    )
}