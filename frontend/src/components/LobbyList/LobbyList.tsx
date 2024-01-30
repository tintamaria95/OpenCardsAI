import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LobbyToJoin from '../LobbyToJoin/LobbyToJoin'
import { socket } from '../../App/App'
import { LobbyInfosType } from '../../types'
import LobbyToCreate from '../LobbyToCreate/LobbyToCreate'
import { useCurrentLobbyContext } from '../CurrentLobbyContext'


export default function LobbyList() {
    const navigate = useNavigate()
    const [lobbyList, setLobbyList] = useState<LobbyInfosType[]>([])
    const { setCurrentLobbyInfos } = useCurrentLobbyContext()

    useEffect(() => {

        if (!socket.connected) {
            socket.connect()
        }


        function updateCreateLobby(lobbyInfos: LobbyInfosType){
            setLobbyList((prev) => [...prev, lobbyInfos])
        }

        function updateSetLobbyList(lobbyList: LobbyInfosType[]){
            setLobbyList(lobbyList)
        }

        function navToCurrentLobby(lobbyInfos: LobbyInfosType){
            setCurrentLobbyInfos(lobbyInfos)
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
    }, [])

    return (
        <ul> {(lobbyList === undefined) ?
            (
                <div>LOADING...</div>
            ) : (<>
                <LobbyToCreate isPublic={true}/>
                <div>--- Existing lobbies ---</div>
                {lobbyList.map((lobby, index) => (
                    <li key={index}>
                        <LobbyToJoin id={lobby.id} name={lobby.name} players={lobby.players} isPublic={lobby.isPublic}/>
                    </li>
                ))}
            </>)}

        </ul>)
}

