import { WaitingRoom } from '../components/lobby/WaitingRoom'
import { SkullKing } from '../components/games/skullKing/SkullKing'
import { useSocketContext } from '../components/global/contexts/SocketContext'
import { GameContextProvider } from '../components/games/contexts/GameContextProvider'
import { Navigate } from 'react-router-dom'
import { useLobbyContext } from '../components/lobby/contexts/LobbyContext'

export default function CurrentLobby() {
  const { socket } = useSocketContext()
  const { currentLobby, errorMessage, isWaitingForPlayersToJoin } = useLobbyContext()


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
            <GameContextProvider>
              <SkullKing />
            </GameContextProvider>
          )
        }
      </>

    )
}
