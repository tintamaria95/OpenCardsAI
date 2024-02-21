import { Link } from 'react-router-dom'
import LobbyToCreate from '../components/LobbyToCreate'

function PrivateLobby() {
  return (
    <>
      <h1>PrivateLobby</h1>
      <span>
        <div>As-tu un code d&apos;invitation ?</div>
        <input type="text" placeholder={"Code d'invitation"} />
        <button>Rejoindre lobby privé</button>
      </span>
      <div></div>
      <span>
        <LobbyToCreate isPublic={false} />
      </span>
      <div>
        <Link to={'/'}>retour</Link>
      </div>
    </>
  )
}

export default PrivateLobby
