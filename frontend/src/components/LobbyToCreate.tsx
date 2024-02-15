import { useState } from "react";
import { useSocketContext } from "./SocketContext";
import { useUserContext } from "./UserContext";

type LobbyToCreatePropType = {
    isPublic: boolean
}

export default function LobbyToCreate({isPublic}: LobbyToCreatePropType) {
    const { socket } = useSocketContext()
    const {username } = useUserContext()
    const [lobbyName, setLobbyName] = useState(username + "'s lobby")

    function handleCreateNewLobby() {
            socket.emit('req-create-lobby', lobbyName, isPublic)
    }

    
    return (
        <>
            <input placeholder={"reallyOriginalLobbyName"} onChange={e => setLobbyName(e.target.value)} />
            <button onClick={handleCreateNewLobby}>Create new lobby</button>
        </>

    )
}