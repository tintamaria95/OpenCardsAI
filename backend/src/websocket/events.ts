import { Server, Socket } from 'socket.io'
import { lobbyLogger } from '../logger'
import { InMemorySessionsStore } from '../lobby/sessionStore'
import { Lobby } from '../lobby/Lobby'
import { User } from '../lobby/User'
import { InMemoryLobbiesStore } from '../lobby/lobbyStore'
import { handleAddUserToLobby, handleUserLeftLobby } from '../lobby/handleLobbyChanges'
import { AsyncGameSK } from '../games/skullKing/AsyncGameSK'
import { Action } from '../games/commonClasses/Action'
import { getFrontErrorMessage } from '../utils'
import { emitResJoinLobby } from './emit'
import { ROOMPUBLICLOBBY } from './emit'

export function updateUsername(
  username: string,
  session: User
) {
  session.username = username
  lobbyLogger.userUpdatedUsername(session.sessionId, username)
}

export async function joinMenu(
  io: Server,
  socket: Socket,
  lobbyStore: InMemoryLobbiesStore,
  session: User
) {
  const lobbyId = session.socketId2LobbyId.get(socket.id)
  if (lobbyId !== undefined) {
    await handleUserLeftLobby(io, socket, lobbyId, lobbyStore, session)
  }
  io.to(socket.id).emit('update-lobby')
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
  lobbyStore: InMemoryLobbiesStore,
  user: User
) {
  const lobby = lobbyStore.saveLobby(lobbyName, isPublic, user)
  user.socketId2LobbyId.set(socket.id, lobby.id)
  user.lobbyId2SocketId.set(lobby.id, socket.id)

  await socket.leave(ROOMPUBLICLOBBY)
  await socket.join(lobby.id)

  emitResJoinLobby(io, lobby.id, { status: 'success', lobby: lobby.getFront() })
  if (isPublic) {
    io.to(ROOMPUBLICLOBBY).emit('update-lobbylist-addlobby', lobby.getFront())
  }
}

export async function reqJoinLobby(
  io: Server,
  socket: Socket,
  lobbyStore: InMemoryLobbiesStore,
  user: User,
  lobbyId?: Lobby['id']
) {
  if (lobbyId !== undefined) {
    const lobby = lobbyStore.getLobby(lobbyId)
    if (lobby !== undefined) {
      const isGameStarted = lobby.game !== undefined
      if (isGameStarted) {
        if (lobby.isBotInLobby(user.sessionId)) {
          handleAddUserToLobby(lobby, user, io, socket)
        } else {
          emitResJoinLobby(io, socket.id, { status: 'fail', errorMessage: getFrontErrorMessage({ type: 'gameAlreadyStartedError' }) })
        }
      } else {
        if (lobby.isUserInLobby(user.sessionId)) {
          lobbyLogger.userAlreadyInLobby(user.sessionId, lobby.id)
          emitResJoinLobby(io, socket.id, { status: 'fail', errorMessage: getFrontErrorMessage({ type: 'userAlreadyInLobby' }) })
        } else {
          handleAddUserToLobby(lobby, user, io, socket)
        }
      }
    }
  } else {
    const publicWaitingLobbies = lobbyStore.getAllLobbies(true, false)
    const availablePublicWaitingLobbies = publicWaitingLobbies.filter(lobby => lobby.getNonBotPlayers().findIndex(currUser => currUser.sessionId === user.sessionId) === -1)
    if (availablePublicWaitingLobbies.length > 0) {
      const lobby = availablePublicWaitingLobbies[0]
      handleAddUserToLobby(lobby, user, io, socket)
    } else {
      const lobby = lobbyStore.saveLobby(`${user.username}'s lobby`, true, user)
      user.socketId2LobbyId.set(socket.id, lobby.id)
      user.lobbyId2SocketId.set(lobby.id, socket.id)
      await socket.join(lobby.id)
      emitResJoinLobby(io, lobby.id, { status: 'success', lobby: lobby.getFront() })
      io.to(ROOMPUBLICLOBBY).emit('update-lobbylist-addlobby', lobby.getFront())
    }
  }
}

export async function disconnect(
  io: Server,
  socket: Socket,
  lobbyStore: InMemoryLobbiesStore,
  user: User
) {
  lobbyLogger.userDisconnected(user.sessionId)
  const lobbyId = user.socketId2LobbyId.get(socket.id)
  if (lobbyId !== undefined) {
    await handleUserLeftLobby(io, socket, lobbyId, lobbyStore, user)
  }
}

/////////////////////////

export function getSessionLobby(socket: Socket, lobbyStore: InMemoryLobbiesStore, session: User) {
  const lobbyId = session.socketId2LobbyId.get(socket.id)
  if (lobbyId == undefined) {
    lobbyLogger.undefinedLobby(lobbyId)
    return
  }
  return lobbyStore.getLobby(lobbyId)
}
export function getSessionGame(lobby: Lobby) {
  const game = lobby.game
  if (game === undefined) {
    lobbyLogger.undefinedGame(lobby.id)
    return
  }
  return game
}

export function reqUpdateGameState(
  game: AsyncGameSK,
  action: Action,
  sessionId: string,
  socketId: string
) {
  game.emitGameStateUpdate(action, sessionId, socketId)
}
