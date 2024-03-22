import { ReactElement, useState, useEffect } from 'react'
import { CurrentLobbyContext } from './CurrentLobbyContext'
import socket from '../socket'
import { useNavigate } from 'react-router-dom'
import { LobbyFrontType } from '../types'

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
    function resNavigateToLobby(status: string, lobby: LobbyFrontType) {
      if (status === 'success') {
        setCurrentLobby(lobby)
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
