import { useEffect, useState } from 'react'
import { WaitingRoom } from '../components/WaitingRoom'
import { SkullKing } from '../components/skullKing/SkullKing'
import { useSocketContext } from '../contexts/SocketContext'
import { Navigate } from 'react-router-dom'
import { useCurrentLobbyContext } from '../contexts/CurrentLobbyContext'

export default function CurrentLobby() {
  const { socket } = useSocketContext()
  const { currentLobby } = useCurrentLobbyContext()
  const [isWaitingForPlayersToJoin, setIsWaitingForPlayersToJoin] = useState(!currentLobby?.isGameStarted)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    socket.on('res-start-game', stopWaitingAndStartGame)
    return () => {
      socket.off('res-start-game', stopWaitingAndStartGame)
    }
  })

  function stopWaitingAndStartGame(status: string, errorMessage?: string) {
    if (status === 'success'){
    setIsWaitingForPlayersToJoin(false)}
    else if (status === "fail") {
      if (errorMessage !== undefined){
        setErrorMessage(errorMessage)
      }
    }
  }

  function handleClickStartGame() {
    socket.emit('req-start-game')
  }


  return currentLobby == undefined
    ? (
      <Navigate to={'/'} replace />
    ) : (
      <>
        {
          isWaitingForPlayersToJoin ? (
            <>
              <WaitingRoom />
              <button onClick={handleClickStartGame}>Start game</button>
              <div>{errorMessage}</div>
            </>
          ) : (
            <SkullKing />
          )
        }
      </>

    )
}
