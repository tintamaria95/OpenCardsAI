import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { backEndUrl } from "../../App/App";
import { socket } from "../../App/App";
import { lobbyInfos } from "../../App/App";
import { LobbyInfosType } from "../../types/lobbyInfo";

export default function LobbyToCreate() {
    const [lobbyName, setLobbyName] = useState("reallyOriginalLobbyName")
    const [isJoining, setIsJoining] = useState(false)
    const [isRedirecting, setIsRedirecting] = useState(false)

    useEffect(() => { return () => { socket.off('connect', () => { POSTcreateLobby() }) } })

    function POSTcreateLobby() {
        const body: LobbyInfosType = {
            id: socket.id,
            name: lobbyName,
            players: [{ id: socket.id, name: "Host" }]
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }
        fetch(backEndUrl + '/createlobby', requestOptions)
            .then(res => res.json())
            .then((res) => {
                if (res['status'] === 'success') {
                    lobbyInfos.id = body.id
                    lobbyInfos.name = body.name
                    lobbyInfos.players = body.players
                    setIsRedirecting(true)
                }
            })
    }

    async function handleCreateNewLobby() {
        setIsJoining(true)
        socket.on('connect', () => { POSTcreateLobby() }) // problems because only trigger function for first connection
        socket.connect()
        await new Promise(r => setTimeout(r, 3000))
        setIsJoining(false)
    }

    if (isRedirecting) { return <Navigate to='/inlobby' /> }
    return (
        <>

            {(isJoining) ? (
                <div>Joining...</div>
            ) : (
                <>
                    <input placeholder={"reallyOriginalLobbyName"} onChange={e => setLobbyName(e.target.value)} />
                    <button onClick={handleCreateNewLobby}>Create new lobby</button>
                </>
            )}

        </>
    )
}