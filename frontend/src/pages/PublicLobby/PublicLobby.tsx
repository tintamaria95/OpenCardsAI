import { useEffect } from "react"
import LobbyList from "../../components/LobbyList/LobbyList"
import { Link } from "react-router-dom"
import { socket } from "../../App/App"


export default function PublicLobby() {

  useEffect(() => {
    socket.emit('join-publiclobby')
  }, [])

  return (
    <>
      <h1>PublicLobby</h1>
      <div></div>
      <LobbyList />
      <Link to={'/'}>retour</Link>
    </>)
}
