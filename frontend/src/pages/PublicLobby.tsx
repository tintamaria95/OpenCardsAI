import { useEffect } from "react"
import LobbyList from "../components/LobbyList/LobbyList"
import { Link } from "react-router-dom"
import { useSocketContext } from "../components/SocketContext"


export default function PublicLobby() {
  const { socket } = useSocketContext()

  useEffect(() => {
    socket.emit('join-publiclobby')

    return () => {
      socket.emit('left-publiclobby')
    }
  }, [])

  return (
    <>
      <h1>PublicLobby</h1>
      <div></div>
      <LobbyList />
      <Link to={'/'}>retour</Link>
    </>)
}
