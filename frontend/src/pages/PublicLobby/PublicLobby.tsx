import { Link } from 'react-router-dom'
import LobbyInfo from '../../types/lobbyInfo'
import Lobby from '../../components/Lobby/Lobby'

const PublicLobby = () => {

  const lobbiesInfo : LobbyInfo[] = [
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
      {lobbiesInfo.map((lobbyInfo) => (
        <Lobby
          lobbyName={lobbyInfo.lobbyName}
          numberOfPlayers={lobbyInfo.numberOfPlayers}
          lobbyStatus={lobbyInfo.lobbyStatus}/>
      ))}
      </ul>
      <div>
        <Link to={'/'}>retour</Link>
      </div>
    </>
  )
  }

export default PublicLobby
