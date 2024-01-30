import { Link } from "react-router-dom"
import { useEffect } from "react"
import { socket } from "../../App/App"
import { LobbyInfosType } from "../../types"
import { useCurrentLobbyContext } from "../../components/CurrentLobbyContext"

export default function CurrentLobbyComponent() {
    const { currentLobbyInfos, setCurrentLobbyInfos } = useCurrentLobbyContext()

    useEffect(() => {

        function updateLobbyInfos(lobbyInfos: LobbyInfosType) {
            setCurrentLobbyInfos(lobbyInfos)
        }
        socket.on('update-currentlobby', updateLobbyInfos)


        return () => {
            socket.off('update-currentlobby', updateLobbyInfos)
        }

    }, [])


    return (
        <>
            <h1>In Lobby</h1>
            {(currentLobbyInfos == undefined) ? (
                <div>Error: currentLobbyInfos var is undefined.</div>
            ) : (<> {(currentLobbyInfos.players !== undefined) ? (
                currentLobbyInfos.players.map((player, index) => (
                    <li key={index}>{player.name}</li>
                ))
            ) : (
                <div>No player found... There might be an error somewhere</div>)}
            </>)}
            <Link to={'/'}>retour</Link>
        </>
    )
}