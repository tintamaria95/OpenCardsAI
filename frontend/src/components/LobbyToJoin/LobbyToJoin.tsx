import {LobbyInfosType } from "../../types";
import { useNavigate } from "react-router-dom";
import { useCurrentLobbyContext } from "../CurrentLobbyContext";
import { useSocketContext } from "../SocketContext";

export default function LobbyToJoin({id, name, players, isPublic}: LobbyInfosType) {
    const { socket } = useSocketContext()
    const navigate = useNavigate()
    const { setCurrentLobbyInfos } = useCurrentLobbyContext()

    function navigateToCurrentLobby() {
        if (socket.id !== undefined) {
            const newPlayersList = [...players, { id: socket.id, name: socket.id }]
            setCurrentLobbyInfos({ id: id, name: name, players: newPlayersList, isPublic: isPublic})
            navigate('/play')
        }
    }


    return (
        <>
            <div>Lobby name: {name}</div>
            <div>nb of players: {players?.length}</div>
            <button onClick={navigateToCurrentLobby}>Rejoindre</button>
        </>
    )
}