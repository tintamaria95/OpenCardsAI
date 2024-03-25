import { Server, Socket } from 'socket.io'
import { MainLogger } from '../logger'
import { InMemorySessionsStore } from '../sessionStore'
import { LobbyBackType, UserBackType } from '../types'
import { InMemoryLobbiesStore } from '../lobbyStore'
import { handleUserLeftLobby } from '../handleLobbyChanges'

export function updateUsername(
  username: string,
  sessionStore: InMemorySessionsStore,
  session: UserBackType,
  logger: MainLogger
) {
  session.username = username
  sessionStore.saveSession(session.sessionId, {
    ...session,
    username: username
  })
  logger.userUpdatedUsername(session.sessionId, username)
}

export async function joinMenu(
  io: Server,
  socket: Socket,
  lobbyStore: InMemoryLobbiesStore,
  sessionStore: InMemorySessionsStore,
  session: UserBackType
) {
  if (session.lobbyId !== undefined) {
    await handleUserLeftLobby(io, socket, lobbyStore, session, sessionStore)
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
  session: UserBackType
) {
  const lobbyId = lobbyStore.saveLobby(session, lobbyName, isPublic)
  session.lobbyId = lobbyId
  const lobbyForFront = lobbyStore.getLobbyForFront(lobbyId)
  await socket.leave(ROOMPUBLICLOBBY)
  await socket.join(lobbyId)

  io.to(lobbyId).emit('res-join-lobby', 'success', lobbyForFront)
  if (isPublic) {
    io.to(ROOMPUBLICLOBBY).emit('update-lobbylist-addlobby', lobbyForFront)
  }
}

export async function reqJoinLobby(
  lobbyId: LobbyBackType['id'],
  io: Server,
  socket: Socket,
  ROOMPUBLICLOBBY: string,
  lobbyStore: InMemoryLobbiesStore,
  session: UserBackType,
  logger: MainLogger
) {
  const lobby = lobbyStore.getLobby(lobbyId)
  if (lobby !== undefined) {
    if (lobbyStore.isUserInLobby(session.sessionId, lobby)) {
      logger.userAlreadyInLobby(session.sessionId, lobbyId)
      io.to(lobbyId).emit(
        'res-join-lobby',
        'userAlreadyInLobby',
        lobbyStore.getLobbyForFront(lobbyId)
      )
    } else {
      lobbyStore.addUserToLobby(session, lobbyId)
      await socket.leave(ROOMPUBLICLOBBY)
      await socket.join(lobbyId)
      session.lobbyId = lobbyId
      io.to(lobbyId).emit(
        'res-join-lobby',
        'success',
        lobbyStore.getLobbyForFront(lobbyId)
      )
    }
  } else {
    logger.undefinedLobby(lobbyId)
    io.to(socket.id).emit('res-join-lobby', 'undefinedLobby', undefined)
  }
}

export function reqUpdateLobby(
  io: Server,
  socket: Socket,
  session: UserBackType,
  lobbyStore: InMemoryLobbiesStore,
  logger: MainLogger
) {
  if (session.lobbyId !== undefined) {
    if (lobbyStore.getLobby(session.lobbyId) !== undefined) {
      io.to(session.lobbyId).emit(
        'update-lobby',
        lobbyStore.getLobbyForFront(session.lobbyId)
      )
    } else {
      logger.logger.error(
        'sessionId !== undefined but unknown in both public and private stores.'
      )
    }
  } else {
    io.to(socket.id).emit('update-lobby', undefined)
  }
}

export async function disconnect(
  io: Server,
  socket: Socket,
  lobbyStore: InMemoryLobbiesStore,
  session: UserBackType,
  sessionStore: InMemorySessionsStore,
  logger: MainLogger
) {
  logger.userDisconnected(session.sessionId)
  await handleUserLeftLobby(io, socket, lobbyStore, session, sessionStore)
}
