import { useState, useEffect } from 'react'
import LobbyToJoin from './LobbyToJoin'
import { LobbyFrontType } from '../types'
import LobbyToCreate from './LobbyToCreate'
import { useSocketContext } from './SocketContext'


export default function LobbyList() {
    const [lobbyList, setLobbyList] = useState<LobbyFrontType[]>([])
    const { socket } = useSocketContext()


    useEffect(() => {

        function updateCreateLobby(lobby: LobbyFrontType){
            setLobbyList((prev) => [...prev, lobby])
        }

        function updateSetLobbyList(lobbyList: LobbyFrontType[]){
            setLobbyList(lobbyList)
        }

        socket.on('update-lobbylist-setall', updateSetLobbyList)
        socket.on('update-lobbylist-addlobby', updateCreateLobby)


        return () => {
            socket.off('update-lobbylist-setall', updateSetLobbyList)
            socket.off('update-lobbylist-addlobby', updateCreateLobby)
        }
    }, [socket])


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

