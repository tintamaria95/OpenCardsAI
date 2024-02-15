import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LobbyToJoin from './LobbyToJoin'
import { LobbyFrontType } from '../types'
import LobbyToCreate from './LobbyToCreate'
import { useCurrentLobbyContext } from './CurrentLobbyContext'
import { useSocketContext } from './SocketContext'


export default function LobbyList() {
    const [lobbyList, setLobbyList] = useState<LobbyFrontType[]>([])
    const { socket } = useSocketContext()
    const navigate = useNavigate()
    const { setCurrentLobby } = useCurrentLobbyContext()

    useEffect(() => {

        function updateCreateLobby(lobby: LobbyFrontType){
            setLobbyList((prev) => [...prev, lobby])
        }

        function updateSetLobbyList(lobbyList: LobbyFrontType[]){
            setLobbyList(lobbyList)
        }

        function navToCurrentLobby(lobby: LobbyFrontType){
            setCurrentLobby(lobby)
            navigate('/play')
        }

        socket.on('res-set-lobbylist', updateSetLobbyList)
        socket.on('res-create-lobby', updateCreateLobby)
        socket.on('ack-lobby-created', navToCurrentLobby)

        return () => {
            socket.off('res-set-lobbylist', updateSetLobbyList)
            socket.off('res-create-lobby', updateCreateLobby)
            socket.off('ack-lobby-created', navToCurrentLobby)
        }
    }, [socket, navigate, setCurrentLobby])


    return (
        <ul> {(lobbyList === undefined) ?
            (
                <div>LOADING...</div>
            ) : (<>
                <LobbyToCreate isPublic={true} />
                <div>--- Existing lobbies ---</div>
                {lobbyList.map((lobby, index) => (
                    <li key={index}>
                        <LobbyToJoin
                            id={lobby.id}
                            name={lobby.name}
                            users={lobby.users}
                            isPublic={lobby.isPublic} />
                    </li>
                ))}
            </>)}

        </ul>)
}

