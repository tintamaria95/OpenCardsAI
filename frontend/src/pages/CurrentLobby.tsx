import { useCurrentLobbyContext } from "../components/CurrentLobbyContext"
import { Link } from "react-router-dom"
import { useSocketContext } from "../components/SocketContext"


export default function CurrentLobby() {
    const { currentLobby, setCurrentLobby } = useCurrentLobbyContext()
    const { socket } = useSocketContext()
    
    function handleLeaveLobby(){
        socket.emit('left-lobby')
        setCurrentLobby(undefined)
    }

    return (
        <>
        <h1>In Lobby</h1>
        {(currentLobby == undefined) ? (
            <div>Error: currentLobby var is undefined.</div>
        ) : (<> 
        <div></div>
        {(currentLobby.users.length > 0) ? (
            currentLobby.users.map((user, index) => (
                <li key={index}>{user.username}</li>
            ))
        ) : (
            <div>No player found... There might be an error somewhere</div>)}
        </>)}
        <Link to={'/'} onClick={handleLeaveLobby}>retour</Link>
    </>
    )
}