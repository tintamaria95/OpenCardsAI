
import { Lobby, LobbyFrontType } from './Lobby'
import { User } from './User'
import { randomUUID } from 'crypto'

export class InMemoryLobbiesStore {
  private lobbies

  constructor() {
    this.lobbies = new Map<Lobby['id'], Lobby>()
  }

  getLobby(id: string) {
    if (id !== undefined) {
      return this.lobbies.get(id)
    }
  }

  getAllLobbies(isPublic?: boolean) {
    const lobbies = [...this.lobbies.values()]
    if (isPublic !== undefined) {
      return lobbies.filter((lobby) => lobby.isPublic == isPublic)
    }
    return lobbies
  }

  getAllLobbiesForFront(isPublic?: boolean): LobbyFrontType[] {
    const lobbies = this.getAllLobbies(isPublic)
    return [...lobbies.values()].map((lobby): LobbyFrontType => lobby.getFront())
  }

  saveLobby(
    session: User,
    lobbyName: Lobby['name'],
    isPublic: Lobby['isPublic']
  ) {
    const users = new Map<User['sessionId'], User>()
    users.set(session.sessionId, session)

    const newLobby: Lobby = new Lobby(
      randomUUID(),
      lobbyName,
      isPublic,
      users
    )
    this.lobbies.set(newLobby['id'], newLobby)
    return newLobby['id']
  }

  deleteLobby(lobbyId: Lobby['id']) {
    this.lobbies.delete(lobbyId)
  }

}
