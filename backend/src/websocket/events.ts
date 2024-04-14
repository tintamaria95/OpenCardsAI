import { Server, Socket } from 'socket.io'
import { lobbyLogger } from '../logger'
import { InMemorySessionsStore } from '../lobby/sessionStore'
import { Lobby } from '../lobby/Lobby'
import { User } from '../lobby/User'
import { InMemoryLobbiesStore } from '../lobby/lobbyStore'
import { handleUserLeftLobby } from '../lobby/handleLobbyChanges'

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

export function joinMenu(
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
  if (lobby === undefined){
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
