import { Server, Socket } from 'socket.io'
import { lobbyLogger } from '../logger'
import { InMemorySessionsStore } from '../lobby/sessionStore'
import { Lobby } from '../lobby/Lobby'
import { User } from '../lobby/User'
import { InMemoryLobbiesStore } from '../lobby/lobbyStore'
import { handleUserLeftLobby } from '../lobby/handleLobbyChanges'
import { AsyncGameSK } from '../games/skullKing/AsyncGameSK'
import { Action } from '../games/commonClasses/Action'

export function updateUsername(
  username: string,
  sessionStore: InMemorySessionsStore,
  session: User
) {
  session.username = username
  sessionStore.saveSession(session.sessionId, {
    ...session,
    username: username
  })
  lobbyLogger.userUpdatedUsername(session.sessionId, username)
}

export async function joinMenu(
  io: Server,
  socket: Socket,
  lobbyStore: InMemoryLobbiesStore,
  session: User
) {
  if (session.lobbyId !== undefined) {
    await handleUserLeftLobby(io, socket, lobbyStore, session)
  }
}

export function reqLobbyList(
  io: Server,
  socket: Socket,
  lobbyStore: InMemoryLobbiesStore
) {
  io.to(socket.id).emit(
    'update-lobbylist-setall',
    lobbyStore.getAllLobbiesForFront(true)
  )
}

export async function reqCreateLobby(
  lobbyName: string,
  isPublic: boolean,
  io: Server,
  socket: Socket,
  ROOMPUBLICLOBBY: string,
  lobbyStore: InMemoryLobbiesStore,
  session: User
) {
  const lobbyId = lobbyStore.saveLobby(session, lobbyName, isPublic)
  session.lobbyId = lobbyId
  const lobby = lobbyStore.getLobby(lobbyId)
  if (lobby === undefined) {
    lobbyLogger.undefinedLobby(lobbyId)
    return
  }

  await socket.leave(ROOMPUBLICLOBBY)
  await socket.join(lobbyId)

  io.to(lobbyId).emit('res-join-lobby', 'success', lobby.getFront())
  if (isPublic) {
    io.to(ROOMPUBLICLOBBY).emit('update-lobbylist-addlobby', lobby.getFront())
  }
}

export async function reqJoinLobby(
  lobbyId: Lobby['id'],
  io: Server,
  socket: Socket,
  ROOMPUBLICLOBBY: string,
  lobbyStore: InMemoryLobbiesStore,
  session: User
) {
  const lobby = lobbyStore.getLobby(lobbyId)
  if (lobby !== undefined) {
    if (lobby.isUserInLobby(session.sessionId)) {
      lobbyLogger.userAlreadyInLobby(session.sessionId, lobbyId)
      io.to(lobbyId).emit(
        'res-join-lobby',
        'userAlreadyInLobby',
        lobby.getFront()
      )
    } else {
      lobby.addUserToLobby(session)
      await socket.leave(ROOMPUBLICLOBBY)
      await socket.join(lobbyId)
      session.lobbyId = lobbyId
      io.to(lobbyId).emit(
        'res-join-lobby',
        'success',
        lobby.getFront()
      )
    }
  } else {
    lobbyLogger.undefinedLobby(lobbyId)
    io.to(socket.id).emit('res-join-lobby', 'undefinedLobby', undefined)
  }
}

export async function disconnect(
  io: Server,
  socket: Socket,
  lobbyStore: InMemoryLobbiesStore,
  session: User
) {
  lobbyLogger.userDisconnected(session.sessionId)
  await handleUserLeftLobby(io, socket, lobbyStore, session)
}

/////////////////////////

export function getSessionLobby(lobbyStore: InMemoryLobbiesStore, session: User){
  const lobbyId = session.lobbyId
    if (lobbyId == undefined) {
      lobbyLogger.undefinedLobby(lobbyId)
      return
    }
    const lobby = lobbyStore.getLobby(lobbyId)
    if (lobby === undefined) {
      lobbyLogger.undefinedLobby(lobbyId)
      return
    }
    return lobby
}
export function getSessionGame(lobby: Lobby){
    const game = lobby.game
    if (game === undefined) {
      lobbyLogger.undefinedGame(lobby.id)
      return
    }
    return game
}

export function reqUpdateGameState(
  io: Server,
  lobby: Lobby,
  game: AsyncGameSK,
  sessionId: string,
  action: Action
) {
  game.updateState(action, sessionId)
  lobby.users.forEach(user => io.to(user.sessionId).emit('gameState', game.getPlayerState(user.sessionId)))
}
