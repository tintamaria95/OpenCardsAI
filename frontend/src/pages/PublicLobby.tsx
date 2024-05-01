import { useEffect } from 'react'
import LobbyList from '../components/lobby/LobbyList'
import { Link } from 'react-router-dom'
import { useSocketContext } from '../components/global/contexts/SocketContext'
import { useLobbyContext } from '../components/lobby/contexts/LobbyContext'

export default function PublicLobby() {
  const { socket } = useSocketContext()
  const {errorMessage} = useLobbyContext()

  useEffect(() => {
    socket.emit('join-publiclobby')
    return () => {
      socket.emit('left-publiclobby')
    }
  })

  return (
    <>
      <h1>PublicLobby</h1>
      <div></div>
      <LobbyList />
      <div>{errorMessage}</div>
      <Link to={'/'}>retour</Link>
    </>
  )
}
