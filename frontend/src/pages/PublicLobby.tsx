import LobbyList from "../components/LobbyList"
import { Link } from "react-router-dom"
import { useSocketContext } from "../components/SocketContext"


export default function PublicLobby() {
  const { socket } = useSocketContext()

  function handleLeftPublicLobby(){
    socket.emit('left-publiclobby')
  }

  return (
    <>
      <h1>PublicLobby</h1>
      <div></div>
      <LobbyList />
      <Link to={'/'} onClick={handleLeftPublicLobby}>retour</Link>
    </>)
}
