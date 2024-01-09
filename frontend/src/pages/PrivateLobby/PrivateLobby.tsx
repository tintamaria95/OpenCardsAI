import { Link } from 'react-router-dom'

function PrivateLobby() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <h1>PrivateLobby</h1>
      <div>As-tu un code d'invitation ? Rejoindre lobby privé</div>
      <div>...</div>
      <div>Créer un lobby privé</div>
      <div>
        <Link to={'/'}>retour</Link>
      </div>
    </>
  )
}

export default PrivateLobby
