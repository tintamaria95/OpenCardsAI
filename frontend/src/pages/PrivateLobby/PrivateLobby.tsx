import { Link } from 'react-router-dom'

function PrivateLobby() {

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
        <input type="text" placeholder={"NomDeLobbyOriginalRandom"} />
        <button>Créer un lobby privé</button>
      </span>
      <div>
        <Link to={'/'}>retour</Link>
      </div>
    </>
  )
}

export default PrivateLobby
