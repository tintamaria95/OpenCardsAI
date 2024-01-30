import { Link } from 'react-router-dom'
import LobbyToCreate from '../../components/LobbyToCreate/LobbyToCreate'
import { useEffect } from 'react'
import { useCurrentLobbyContext } from '../../components/CurrentLobbyContext'
import { useNavigate } from 'react-router-dom'
import { LobbyInfosType } from '../../types'
import { socket } from '../../App/App'

function PrivateLobby() {

  const { setCurrentLobbyInfos } = useCurrentLobbyContext()
  const navigate = useNavigate()

  useEffect(() => {

    if (!socket.connected) {
      socket.connect()
  }

    function navToCurrentLobby(lobbyInfos: LobbyInfosType) {
      setCurrentLobbyInfos(lobbyInfos)
      navigate('/play')
    }

    socket.on('ack-lobby-created', navToCurrentLobby)

    return () => {
      socket.off('ack-lobby-created', navToCurrentLobby)
    }
  })

  return (
    <>
      <h1>PrivateLobby</h1>
      <span>
        <div>As-tu un code d'invitation ?</div>
        <input type="text" placeholder={"Code d'invitation"} />
        <button>Rejoindre lobby privé</button>
      </span>
      <div></div>
      <span>
        <LobbyToCreate isPublic={false}/>
      </span>
      <div>
        <Link to={'/'}>retour</Link>
      </div>
    </>
  )
}

export default PrivateLobby
