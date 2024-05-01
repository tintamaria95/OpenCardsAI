import { LobbyFrontType } from '../../types'
import { useSocketContext } from '../global/contexts/SocketContext'

export default function LobbyToJoin({ id, name, users, isGameStarted }: LobbyFrontType) {
  const { socket } = useSocketContext()

  function handleReqNavigateToLobby() {
    socket.emit('req-join-lobby', id)
  }

  return (
    <>
      <div>Lobby name: {name}</div>
      <div>nb of players: {users.length}</div>
      {!isGameStarted ? (
        <div>status : Waiting for players...</div>
      ) : (
        <div>status : Ongoing game</div>
      )}
      <button onClick={handleReqNavigateToLobby}>Rejoindre</button>
    </>
  )
}
