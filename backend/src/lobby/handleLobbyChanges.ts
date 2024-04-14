import { Lobby } from './Lobby'
import { User } from './User'
import { Socket } from 'socket.io'
import { Server } from 'socket.io'
import { InMemoryLobbiesStore } from './lobbyStore'

export const ROOMPUBLICLOBBY = 'publiclobby'


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
      // handleRemoveUserFromLobby(io, lobbyStore, session.lobbyId, session)
      handleUserReplacedByBot(io, lobbyStore, lobby, session)
    }
  }
  session.lobbyId = undefined
}
