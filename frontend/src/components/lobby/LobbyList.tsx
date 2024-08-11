import { useState, useEffect } from 'react'
import LobbyToJoin from './LobbyToJoin'
import { LobbyFrontType } from '../../types'
import LobbyToCreate from './LobbyToCreate'
import { useSocketContext } from '../global/contexts/SocketContext'

export default function LobbyList() {
  const [lobbyList, setLobbyList] = useState<LobbyFrontType[]>([])
  const { socket } = useSocketContext()

  useEffect(() => {
    function eventSetLobbyList(lobbyList: LobbyFrontType[]) {
      setLobbyList(lobbyList)
    }

    function eventCreateLobby(lobby: LobbyFrontType) {
      setLobbyList(prev => [...prev, lobby])
    }

    function eventUpdateLobby(updatedLobby: LobbyFrontType) {
      setLobbyList((prev) => {
        if (prev.findIndex(lobby => lobby.id === updatedLobby.id) === -1) {
          return [...prev, updatedLobby]
        }
        return prev.map(lobby => {
          if (lobby.id === updatedLobby.id) {
            return updatedLobby
          } return lobby
        })
      })
    }

    function eventRemoveLobby(lobbyId: string){
      setLobbyList(prev => prev.filter(lobby => lobby.id !== lobbyId))
    }

    

    socket.on('update-lobbylist-setall', eventSetLobbyList)
    socket.on('update-lobbylist-addlobby', eventCreateLobby)
    socket.on('update-lobbylist-updatelobby', eventUpdateLobby)
    socket.on('update-lobbylist-removelobby', eventRemoveLobby)

    socket.emit('req-lobbylist')

    return () => {
      socket.off('update-lobbylist-setall', eventSetLobbyList)
      socket.off('update-lobbylist-addlobby', eventCreateLobby)
      socket.off('update-lobbylist-updatelobby', eventUpdateLobby)
      socket.off('update-lobbylist-removelobby', eventRemoveLobby)
    }
  }, [socket])

  return (
    <ul>
      {' '}
      {lobbyList === undefined ? (
        <div>LOADING...</div>
      ) : (
        <>
          <LobbyToCreate isPublic={true} />
          <div>--- Existing lobbies ---</div>
          {lobbyList.map((lobby, index) => (
            <li key={index}>
              <LobbyToJoin
                id={lobby.id}
                name={lobby.name}
                users={lobby.users}
                isPublic={lobby.isPublic}
                isGameStarted={lobby.isGameStarted}
              />
            </li>
          ))}
        </>
      )}
    </ul>
  )
}
