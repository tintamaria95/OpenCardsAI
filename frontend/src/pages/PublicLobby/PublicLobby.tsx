import LobbyList from "../../components/LobbyList/LobbyList"
import { Link } from "react-router-dom"


export default function PublicLobby ()  {
 return (
      <>
        <h1>PublicLobby</h1>
        <LobbyList/>
        <Link to={'/'}>retour</Link>
      </>)
}


