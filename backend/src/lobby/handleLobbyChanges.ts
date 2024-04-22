import { Lobby } from './Lobby'
import { User } from './User'
import { Socket } from 'socket.io'
import { Server } from 'socket.io'
import { InMemoryLobbiesStore } from './lobbyStore'
import { emitResJoinLobby } from '../websocket/emit'
import { ROOMPUBLICLOBBY } from '../websocket/emit'

export function handleRemoveUserFromLobby(
  io: Server,
  lobbyStore: InMemoryLobbiesStore,
  lobby: Lobby,
  user: User
) {
  lobby.removeUserfromLobby(user)
  if (lobby.isEmpty()) {
    lobbyStore.deleteLobby(lobby['id'])
  } else {
    io.to(lobby['id']).emit('update-lobby', lobby.getFront())
  }
  if (lobby.isPublic) {
    io.to(ROOMPUBLICLOBBY).emit(
      'update-lobbylist-setall',
      lobbyStore.getAllLobbiesForFront()
    )
  }

}

export function handleUserReplacedByBot(
  io: Server,
  lobbyStore: InMemoryLobbiesStore,
  lobby: Lobby,
  user: User
) {
  lobby.replaceUserByBot(user)
  if (lobby.isEmpty()) {
    lobby.game?.clearTimer()
    lobbyStore.deleteLobby(lobby['id'])
  } else {
    io.to(lobby['id']).emit('update-lobby', lobby.getFront())
  }

  if (lobby.isPublic) {
    io.to(ROOMPUBLICLOBBY).emit(
      'update-lobbylist-setall',
      lobbyStore.getAllLobbiesForFront()
    )
  }
  
}

export async function handleUserLeftLobby(
  io: Server,
  socket: Socket,
  lobbyStore: InMemoryLobbiesStore,
  session: User
) {
  if (session.lobbyId !== undefined) {
    const lobby = lobbyStore.getLobby(session.lobbyId)
    if (lobby !== undefined) {
      await socket.leave(session.lobbyId)
      const isGameStarted = lobby.game !== undefined
      if (isGameStarted){
        handleUserReplacedByBot(io, lobbyStore, lobby, session)
      }
      else {
        handleRemoveUserFromLobby(io, lobbyStore, lobby, session)
      }
    }
  }
  session.lobbyId = undefined
}


export async function handleAddUserToLobby(lobby: Lobby, session: User, io: Server, socket: Socket){
  lobby.addUserToLobby(session)
  await socket.leave(ROOMPUBLICLOBBY)
  await socket.join(lobby.id)
  emitResJoinLobby(io, session.sessionId, {status: 'success', lobby: lobby.getFront()})
  if (lobby.isPublic) {
    io.to(ROOMPUBLICLOBBY).emit('update-lobbylist-updatelobby', lobby.getFront())
  }
}