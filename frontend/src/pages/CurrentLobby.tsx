import { useCurrentLobbyContext } from "../components/CurrentLobbyContext"
import { Link } from "react-router-dom"
import { useSocketContext } from "../components/SocketContext"
import { Navigate } from "react-router-dom"
import { useEffect } from "react"

export default function CurrentLobby() {
    const { currentLobby } = useCurrentLobbyContext()
    const { socket } = useSocketContext()

    useEffect(()=>{
        // In case of navigation using 
        socket.emit('req-update-lobby')
    }, [socket])

    return (
        (currentLobby == undefined) ?
            (
                <Navigate to={'/'} replace />
            ) : (
                <>
                    <h1>{currentLobby.name}</h1>
                    {(currentLobby.isPublic) ? (<div>- lobby public -</div>) : (<div>- lobby privé -</div>)}
                    <section>
                        <h3>Joueurs dans le lobby:</h3>
                        <ul>
                            {(currentLobby.users.length > 0) ? (
                                currentLobby.users.map((user, index) => (
                                    <li key={index}>{user.username}</li>
                                ))
                            ) : (
                                <div>No player found... There might be an error somewhere</div>)}
                        </ul>
                    </section>
                    <section>
                        <h3>Messages</h3>
                        <ul>
                            {/* {(currentLobby.users.length > 0) ? (
                                currentLobby.users.map((user, index) => (
                                    <li key={index}>{user.username}</li>
                                ))
                            ) : (
                                <div>No player found... There might be an error somewhere</div>)} */}
                        </ul>
                    </section>


                    <Link to={'/'} >retour</Link>
                </>)

    )
}