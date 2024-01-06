import { Link } from 'react-router-dom'
import LobbyType from '../../types/lobbyType'
import Lobby from '../../components/Lobby/Lobby'

const PublicLobby = () => {

  const lobbies : LobbyType[] = [
    {
      lobbyName : 'lesnazes',
      numberOfPlayers : 2,
      lobbyStatus : 'dans le lobby'
    },
    {
      lobbyName : 'lesforts',
      numberOfPlayers : 3,
      lobbyStatus : 'jeu en cours'
    },
    {
      lobbyName : 'martinandco',
      numberOfPlayers : 5,
      lobbyStatus : 'jeu en cours'
    }
  ]
  return (
    <>
      <h1>PublicLobby</h1>
      <ul>

      </ul>
      {lobbies.map((lobby) =>{
        <Lobby lobby={lobby}/>
      })}
      <div>
        <Link to={'/'}>retour</Link>
      </div>
    </>
  )
  }

export default PublicLobby
