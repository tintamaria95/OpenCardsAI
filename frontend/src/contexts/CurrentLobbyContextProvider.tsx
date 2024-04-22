import { ReactElement, useState, useEffect } from 'react'
import { CurrentLobbyContext } from './CurrentLobbyContext'
import socket from '../socket'
import { useNavigate } from 'react-router-dom'
import { LobbyFrontType, ResJoinLobbyFailArgs, ResJoinLobbySuccessArgs } from '../types'

export function CurrentLobbyContextProvider({
  children
}: {
  children: ReactElement
}) {
  const [currentLobby, setCurrentLobby] = useState<LobbyFrontType | undefined>(
    undefined
  )
  const navigate = useNavigate()

  useEffect(() => {
    function updateLobby(lobby: LobbyFrontType) {
      setCurrentLobby(lobby)
    }
    function resNavigateToLobby(args: ResJoinLobbySuccessArgs | ResJoinLobbyFailArgs) {
      if (args['status'] === 'success') {
        setCurrentLobby(args['lobby'])
        navigate('/play')
      }
    }

    socket.on('res-join-lobby', resNavigateToLobby)
    socket.on('update-lobby', updateLobby)
    return () => {
      socket.off('update-lobby', updateLobby)
      socket.off('res-join-lobby', resNavigateToLobby)
    }
  }, [navigate])
  return (
    <CurrentLobbyContext.Provider value={{ currentLobby, setCurrentLobby }}>
      {children}
    </CurrentLobbyContext.Provider>
  )
}
