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

  emitResJoinLobby(io, session.sessionId, {status: 'success', lobby: lobby.getFront()})
  if (isPublic) {
    io.to(ROOMPUBLICLOBBY).emit('update-lobbylist-addlobby', lobby.getFront())
  }
}

export async function reqJoinLobby(
  lobbyId: Lobby['id'],
  io: Server,
  socket: Socket,
  lobbyStore: InMemoryLobbiesStore,
  session: User
) {
  const lobby = lobbyStore.getLobby(lobbyId)
  if (lobby !== undefined) {
    const isGameStarted = lobby.game !== undefined
    if (isGameStarted) {
      if (lobby.isBotInLobby(session.sessionId)){
        handleAddUserToLobby(lobby, session, io, socket)
      } else {
        emitResJoinLobby(io, session.sessionId, {status: 'fail', errorMessage: getFrontErrorMessage({type: 'gameAlreadyStartedError'})})
      }
    } else {
      if (lobby.isUserInLobby(session.sessionId)) {
        lobbyLogger.userAlreadyInLobby(session.sessionId, lobbyId)
        emitResJoinLobby(io, session.sessionId, {status: 'fail', errorMessage: getFrontErrorMessage({type: 'userAlreadyInLobby'})})
      } else {
        handleAddUserToLobby(lobby, session, io, socket)
      }
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
  game: AsyncGameSK,
  sessionId: string,
  action: Action
) {
  game.updateState(action, sessionId)
  const isNextStateContractPhase = game.getPossibleActions().includes('setContract') && game.getPossiblePlayers().length !== game.getNbPlayers()
  if (isNextStateContractPhase) {
    game.emitUpdateToPlayer(sessionId)
  } else {
    game.emitUpdateToPlayers()
  }
}
