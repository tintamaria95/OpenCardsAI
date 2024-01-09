import LobbyInfo from "../../types/lobbyInfo"

const Lobby = ({ lobbyName, numberOfPlayers, lobbyStatus }: LobbyInfo) => {

    return <li>
        <div id='lobbyname'>{lobbyName}</div>
        <div>{numberOfPlayers}</div>
        <div>{lobbyStatus}</div>
        <div>Rejoindre</div>
    </li>
}

export default Lobby