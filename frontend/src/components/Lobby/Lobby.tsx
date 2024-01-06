import LobbyType from "../../types/lobbyType"

type LobbyProps = {
    lobby: LobbyType
}
const Lobby: React.FC<LobbyProps> = ({ lobby }) => {

    return <div>
        <div id='lobbyname'>{lobby.lobbyName}</div>
        <div>{lobby.numberOfPlayers}</div>
        <div>{lobby.lobbyStatus}</div>
        <div>Rejoindre</div>
    </div>
}

export default Lobby