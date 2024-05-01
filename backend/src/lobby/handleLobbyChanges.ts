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
  lobbyId: string,
  lobbyStore: InMemoryLobbiesStore,
  session: User
) {

      const lobby = lobbyStore.getLobby(lobbyId)
      if (lobby !== undefined) {
        await socket.leave(lobbyId)
        const isGameStarted = lobby.game !== undefined
        if (isGameStarted) {
          handleUserReplacedByBot(io, lobbyStore, lobby, session)
        }
        else {
          handleRemoveUserFromLobby(io, lobbyStore, lobby, session)
        }
  }
  session.socketId2LobbyId.set(socket.id, undefined)
}


export async function handleAddUserToLobby(lobby: Lobby, user: User, io: Server, socket: Socket){
  lobby.addUserToLobby(socket.id, user)
  await socket.leave(ROOMPUBLICLOBBY)
  await socket.join(lobby.id)
  emitResJoinLobby(io, lobby.id, {status: 'success', lobby: lobby.getFront()})
  if (lobby.isPublic) {
    io.to(ROOMPUBLICLOBBY).emit('update-lobbylist-updatelobby', lobby.getFront())
  }
}