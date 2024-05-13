
import { Server, Socket } from 'socket.io'
import { Lobby, LobbyFrontType } from './Lobby'
import { User } from './User'
import { randomUUID } from 'crypto'
import { ROOMPUBLICLOBBY } from '../websocket/emit'

export class InMemoryLobbiesStore {
  private lobbies

  constructor() {
    this.lobbies = new Map<Lobby['id'], Lobby>()
  }

  /**
   * Get the Lobby object corresponding to the "id" in argument; If "id" is undefined, return either the first lobby of public lobby list or create a new one if the list is empty.
   * @param id 
   * @returns 
   */
  getLobby(id: string) {
    return this.lobbies.get(id)
  }

  getAllLobbies(isPublic?: boolean, isGameStarted?: boolean) {
    let lobbies = [...this.lobbies.values()]
    if (isPublic !== undefined) {
      lobbies =  lobbies.filter((lobby) => lobby.isPublic == isPublic)
    }
    if (!isGameStarted && isGameStarted !== undefined) {
      lobbies =  lobbies.filter((lobby) => lobby.game === undefined)
    }
    return lobbies
  }

  getAllLobbiesForFront(isPublic?: boolean): LobbyFrontType[] {
    const lobbies = this.getAllLobbies(isPublic)
    return [...lobbies.values()].map((lobby): LobbyFrontType => lobby.getFront())
  }

  saveLobby(
    
    lobbyName: Lobby['name'],
    isPublic: Lobby['isPublic'],
    user?: User,
  ) {
    const users = new Map<User['sessionId'], User>()
    if (user !== undefined){
    users.set(user.sessionId, user)}

    const newLobby: Lobby = new Lobby(
      lobbyName,
      isPublic,
      users
    )
    this.lobbies.set(newLobby['id'], newLobby)
    return newLobby
  }

  deleteLobby(io: Server, lobbyId: Lobby['id'], isPublic: boolean) {
    this.lobbies.delete(lobbyId)
    if (isPublic){
      io.to(ROOMPUBLICLOBBY).emit('update-lobbylist-removelobby', lobbyId)
    }
  }

}
