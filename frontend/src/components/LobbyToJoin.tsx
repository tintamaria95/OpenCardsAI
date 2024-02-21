import {LobbyFrontType } from "../types";
import { useSocketContext } from "./SocketContext";

export default function LobbyToJoin({id, name, users }: LobbyFrontType) {
    const { socket } = useSocketContext()

    function handleReqNavigateToLobby() {
        socket.emit('req-join-lobby', id)
    }

    return (
        <>
            <div>Lobby name: {name}</div>
            <div>nb of players: {users.length}</div>
            <button onClick={handleReqNavigateToLobby}>Rejoindre</button>
        </>
    )
}