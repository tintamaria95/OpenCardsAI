import { ReactElement, useState, useEffect } from 'react'
import { LobbyContext } from './LobbyContext'
import { useNavigate } from 'react-router-dom'
import { LobbyFrontType, ResJoinLobbyFailArgs, ResJoinLobbySuccessArgs, ResStartGameFailArgs, ResStartGameSuccessArgs } from '../../../types'
import { useSocketContext } from '../../global/contexts/SocketContext'

export function LobbyContextProvider({ children }: { children: ReactElement }) {

  const [currentLobby, setCurrentLobby] = useState<LobbyFrontType | undefined>(
    undefined
  )
  const [errorMessage, setErrorMessage] = useState('')
  const [isWaitingForPlayersToJoin, setIsWaitingForPlayersToJoin] = useState(!currentLobby?.isGameStarted)
  const navigate = useNavigate()
  const { socket } = useSocketContext()

  useEffect(() => {
    function updateLobby(lobby?: LobbyFrontType) {
      if (lobby !== undefined) {
        setCurrentLobby(lobby)
      }
      else {
        setCurrentLobby(undefined)
        setIsWaitingForPlayersToJoin(true)
      }
      setErrorMessage('')
    }

    socket.on('update-lobby', updateLobby)
    return () => {
      socket.off('update-lobby', updateLobby)
    }
  }, [])

  useEffect(() => {
    function resNavigateToLobby(args: ResJoinLobbySuccessArgs | ResJoinLobbyFailArgs) {
      if (args['status'] === 'success') {
        setCurrentLobby(args['lobby'])
        if(args['lobby'].isGameStarted){
          setIsWaitingForPlayersToJoin(false)
        }
        setErrorMessage('')
        navigate('/play')
      } else{
        setErrorMessage(args['errorMessage'])
      }
    }
    socket.on('res-join-lobby', resNavigateToLobby)
    return () => {
      socket.off('res-join-lobby', resNavigateToLobby)
    }
  })

  useEffect(() => {
    function stopWaitingAndStartGame(args: ResStartGameSuccessArgs | ResStartGameFailArgs) {
      if (args['status'] === 'success') {
        setIsWaitingForPlayersToJoin(false)
      }
      else {
        setErrorMessage(args['errorMessage'])
      }
    }
    socket.on('res-start-game', stopWaitingAndStartGame)
    return () => {
      socket.off('res-start-game', stopWaitingAndStartGame)
    }
  }, [])



  return (
    <LobbyContext.Provider value={{ currentLobby, errorMessage, isWaitingForPlayersToJoin }}>
      {children}
    </LobbyContext.Provider>
  )
}
