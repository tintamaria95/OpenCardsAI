import { Lobby } from './Lobby'
import { User } from './User'
import { Socket } from 'socket.io'
import { Server } from 'socket.io'
import { InMemoryLobbiesStore } from './lobbyStore'
import { emitResJoinLobby } from '../websocket/emit'
import { ROOMPUBLICLOBBY } from '../websocket/emit'
import { lobbyLogger } from '../logger'

export function handleRemoveUserFromLobby(
  io: Server,
  lobbyStore: InMemoryLobbiesStore,
  lobby: Lobby,
  user: User
) {
  lobby.removeUserfromLobby(user)
  if (lobby.isEmpty()) {
    lobbyStore.deleteLobby(io, lobby['id'], lobby.isPublic)
  } else {
    io.to(lobby['id']).emit('update-lobby', lobby.getFront())
  }

}

export function handleUserReplacedByBot(
  io: Server,
  lobbyStore: InMemoryLobbiesStore,
  lobby: Lobby,
  user: User
) {
  lobby.replaceUserByBot(user)
  io.to(lobby['id']).emit('update-lobby', lobby.getFront())
  if (lobby.isPublic) {
    io.to(ROOMPUBLICLOBBY).emit('update-lobbylist-updatelobby', lobby.getFront())
  }


}

export async function handleUserLeftLobby(
  io: Server,
  socket: Socket,
  lobbyId: string,
  lobbyStore: InMemoryLobbiesStore,
  user: User
) {
  const lobby = lobbyStore.getLobby(lobbyId)
  if (lobby === undefined) {
    lobbyLogger.undefinedLobby(lobbyId)
    return
  }
  await socket.leave(lobbyId)
  const isGameStarted = lobby.game !== undefined
  if (isGameStarted) {
    const nonBotPlayers = lobby.getNonBotPlayers()
    if (nonBotPlayers.length === 1) {
      if (nonBotPlayers[0].sessionId === user.sessionId) {
        lobby.game?.clearTimer()
        lobbyStore.deleteLobby(io, lobby['id'], lobby.isPublic)
      }
    } else {
      handleUserReplacedByBot(io, lobbyStore, lobby, user)
    }
  } else {
    handleRemoveUserFromLobby(io, lobbyStore, lobby, user)
  }
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