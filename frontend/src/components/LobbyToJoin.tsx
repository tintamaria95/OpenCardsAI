import {LobbyInfosType, PlayerType } from "../types";
import { useNavigate } from "react-router-dom";
import { useCurrentLobbyContext } from "./CurrentLobbyContext";
import { useSocketContext } from "./SocketContext";
import { useUserContext } from "./UserContext";
import { useEffect } from "react";

export default function LobbyToJoin({id, name, players, isPublic}: LobbyInfosType) {
    const { socket } = useSocketContext()
    const navigate = useNavigate()
    const { setCurrentLobbyInfos } = useCurrentLobbyContext()
    const {userId, username, imageName} = useUserContext()
    
    useEffect(() => {

    }, [])

    function navigateToCurrentLobby() {
            // socket.emit('req-join-lobby', sessionId)
            const newPlayersList : PlayerType[]= [...players, {userId: userId, username: username, imageName: imageName}]
            setCurrentLobbyInfos({ id: id, name: name, players: newPlayersList, isPublic: isPublic})
            // navigate('/play')
    }


    return (
        <>
            <div>Lobby name: {name}</div>
            <div>nb of players: {players?.length}</div>
            <button onClick={navigateToCurrentLobby}>Rejoindre</button>
        </>
    )
}