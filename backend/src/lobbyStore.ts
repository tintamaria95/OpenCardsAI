import {
  LobbyBackType,
  LobbyFrontType,
  UserBackType,
  UserFrontType
} from './types'
import {lobbyLogger} from './logger'
import { randomUUID } from 'crypto'

export class InMemoryLobbiesStore {
  private lobbies

  constructor() {
    this.lobbies = new Map<LobbyBackType['id'], LobbyBackType>()
  }

  getLobby(id: string | undefined) {
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

  getLobbyForFront(id: string | undefined) {
    const lobby = this.getLobby(id)
    if (lobby !== undefined) {
      const usersForFront: UserFrontType[] = []
      lobby.users.forEach((user) => {
        usersForFront.push({
          userId: user.userId,
          lobbyId: user.lobbyId,
          imageName: user.imageName,
          username: user.username
        })
      })
      const lobbyForFront: LobbyFrontType = {
        id: lobby.id,
        name: lobby.name,
        isPublic: lobby.isPublic,
        users: usersForFront
      }
      return lobbyForFront
    }
  }

  getAllLobbiesForFront(isPublic?: boolean) {
    const lobbies = this.getAllLobbies(isPublic)
    const lobbiesForFront: LobbyFrontType[] = []
    lobbies.forEach((lobby) => {
      const lobbyForFront = this.getLobbyForFront(lobby.id)
      if (lobbyForFront !== undefined){
        lobbiesForFront.push(lobbyForFront)
      }
    })
    return lobbiesForFront
  }

  saveLobby(
    session: UserBackType,
    lobbyName: LobbyFrontType['name'],
    isPublic: LobbyFrontType['isPublic']
  ) {
    const users = new Map<UserBackType['sessionId'], UserBackType>()
    users.set(session.sessionId, session)
    const newBackLobby: LobbyBackType = {
      id: randomUUID(),
      name: lobbyName,
      isPublic: isPublic,
      createdAt: Date.now(),
      users: users
    }
    this.lobbies.set(newBackLobby.id, newBackLobby)
    return newBackLobby.id
  }

  deleteLobby(lobbyId: LobbyBackType['id']) {
    this.lobbies.delete(lobbyId)
  }

  isUserInLobby(sessionId: UserBackType['sessionId'], lobby: LobbyBackType) {
    if (lobby.users.get(sessionId)) {
      return true
    }
    return false
  }

  addUserToLobby(user: UserBackType, lobbyId: LobbyBackType['id']) {
    const lobby = this.getLobby(lobbyId)
    if (lobby === undefined) {
      lobbyLogger.undefinedLobby(lobbyId)
    } else {
      lobby.users.set(user.sessionId, user)
      user.lobbyId = lobbyId
    }
    return lobby
  }

  removeUserfromLobby(user: UserBackType, lobbyId: LobbyBackType['id']) {
    const lobby = this.getLobby(lobbyId)
    if (lobby === undefined) {
      return
    } else if (!this.isUserInLobby(user.sessionId, lobby)) {
      lobbyLogger.userNotInLobby(user.sessionId, lobbyId)
      return
    } else {
      lobby.users.delete(user.sessionId)
      lobbyLogger.removedUserFromLobby(user.sessionId, lobbyId)
      user.lobbyId = undefined
    }
    return lobby
  }
}
