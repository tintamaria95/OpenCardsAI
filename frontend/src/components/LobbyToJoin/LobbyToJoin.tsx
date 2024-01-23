import LobbyInfo from "../../types/lobbyInfo";
import { useState } from "react";
import { backEndUrl } from "../../App/App";

export default function LobbyToJoin({socketId, name, numberOfPlayers, status}: LobbyInfo) {
    const [isJoining, setIsJoining] = useState(false)

    async function joinLobby(){
        // setIsJoining(true)
        // const requestOptions = {
        //     method: 'POST',
        //     headers: {'Content-Type': 'application/json'},
        //     body: JSON.stringify({'leadSocketId': 1234})
        // }
        // fetch(backEndUrl + '/publiclobby', requestOptions)
        // .then(res => res.json())
        // setIsJoining(false)
    }

    return (
        <>
            <div id='lobbyname'>{name}</div>
            <div>{numberOfPlayers}</div>
            <div>{status}</div>
            {(isJoining)? (
                <div>Joining...</div>
            ): (
                <button onClick={joinLobby}>Rejoindre</button>
            )}
            
        </>
    )
}