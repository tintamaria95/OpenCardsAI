import { useEffect, useState } from "react";
import { useSocketContext } from "./SocketContext";
import { useUserContext } from "./UserContext";
import { useNavigate } from "react-router-dom";
import { useCurrentLobbyContext } from "./CurrentLobbyContext";
import { LobbyFrontType } from "../types";

type LobbyToCreatePropType = {
    isPublic: boolean
}

export default function LobbyToCreate({isPublic}: LobbyToCreatePropType) {
    const { socket } = useSocketContext()
    const {username } = useUserContext()
    const [lobbyName, setLobbyName] = useState(username + "'s lobby")
    const navigate = useNavigate()
    const { setCurrentLobby } = useCurrentLobbyContext()

    useEffect(() =>{
        function navToCurrentLobby(lobby: LobbyFrontType){
            setCurrentLobby(lobby)
            navigate('/play')
        }
        
        socket.on('res-create-lobby', navToCurrentLobby)
        return () => {

            socket.off('res-create-lobby', navToCurrentLobby)
        }
    })

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