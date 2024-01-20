import LobbyList from "../../components/LobbyList/LobbyList"
import { Link } from "react-router-dom"


const PublicLobby = () => {
 return (
      <>
        <h1>PublicLobby</h1>
        <LobbyList/>
        <Link to={'/'}>retour</Link>
      </>)
}

export default PublicLobby
