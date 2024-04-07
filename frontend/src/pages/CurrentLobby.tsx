import { useEffect, useState } from 'react'
import { WaitingRoom } from '../components/WaitingRoom'
import { SkullKing } from '../components/skullKing/SkullKing'
import { useSocketContext } from '../contexts/SocketContext'

export default function CurrentLobby() {
  const [isWaitingForPlayersToJoin, setIsWaitingForPlayersToJoin] = useState(true)
  const { socket } = useSocketContext()

  useEffect(() => {
    socket.on('res-start-game', stopWaitingAndStartGame)
    return () => {
      socket.off('res-start-game', stopWaitingAndStartGame)
    }
  })

  function stopWaitingAndStartGame(){
    setIsWaitingForPlayersToJoin(false)
  }

  function handleClickStartGame() {
    socket.emit('req-start-game')
  }


  return (<>
    {
      isWaitingForPlayersToJoin ? (
        <>
          <WaitingRoom />
          <button onClick={handleClickStartGame}>Start game</button>
        </>
      ) : (
        <SkullKing />
      )
    }
  </>

  )
}
