import {LobbyFrontType } from "../types";
import { useSocketContext } from "./SocketContext";
import { useUserContext } from "./UserContext";

export default function LobbyToJoin({id, name, users }: LobbyFrontType) {
    const { socket } = useSocketContext()
    const {sessionId} = useUserContext()


    function reqNavigateToLobby() {
        socket.emit('req-join-lobby', id, sessionId)
    }


    return (
        <>
            <div>Lobby name: {name}</div>
            <div>nb of players: {users.length}</div>
            <button onClick={reqNavigateToLobby}>Rejoindre</button>
        </>
    )
}