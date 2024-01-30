import { LobbyInfosType, PlayerType } from "./types";
import { Socket } from 'socket.io'
import logger from "./logger";
import { Server } from "socket.io";
import { randomUUID } from "crypto";

export const ROOMPUBLICLOBBY = 'publiclobby'


export function handleUserJoinsLobby(io: Server, socket: Socket, lobbyList: LobbyInfosType[], lobbyId: LobbyInfosType['id'], playerInfos: PlayerType){
    const updatedLobby = addUserToLobby(lobbyList, lobbyId, playerInfos)
    if (updatedLobby == undefined) {
      // emits error
    } else {
      socket.leave(ROOMPUBLICLOBBY)
      socket.join(lobbyId)

      io.to(lobbyId).emit('update-currentlobby', updatedLobby)
        if (updatedLobby.isPublic) {
            emitSetLobbyList(io, lobbyList)
        }
    }
}

export function userLobby(lobbyList: LobbyInfosType[], playerId: PlayerType['id']){
    const lobby =  lobbyList.find(lobby => lobby.players.some(player => player.id === playerId))
    if (lobby !== undefined) {
        return lobby.id
    }
}

export function addNewLobbyToList(lobbyList: LobbyInfosType[], lobbyInfos: LobbyInfosType) {
    lobbyInfos.id = randomUUID()
    lobbyInfos.createdAt = Date.now()
    lobbyList.push(lobbyInfos)
}

export function removeLobbyFromList(lobbyList: LobbyInfosType[], lobbyId: LobbyInfosType['id']) {
    return lobbyList.filter(lobby => lobby.id !== lobbyId)
}

export function emitAckLobbyCreated(io: Server, lobbyInfos: LobbyInfosType){
    io.to(lobbyInfos.id).emit('ack-lobby-created', lobbyInfos)
}

export function emitCreateLobby(io: Server, lobbyInfos: LobbyInfosType) {
    io.to(ROOMPUBLICLOBBY).emit('res-create-lobby', lobbyInfos)
}

export function emitSetLobbyList(io: Server, lobbyList: LobbyInfosType[]){
    io.to(ROOMPUBLICLOBBY).emit('res-set-lobbylist', lobbyList)
}

export function addUserToLobby(lobbyList: LobbyInfosType[], lobbyId: LobbyInfosType['id'], playerInfos: PlayerType) {
    const lobbyToUpdate = lobbyList.find(lobby => lobby.id == lobbyId)
    if (lobbyToUpdate !== undefined) {
        if (lobbyToUpdate.players.find(player => player.id == playerInfos.id) == undefined) {
            lobbyToUpdate.players.push({ id: playerInfos.id, name: playerInfos.name })
        } else { logger.warn(`User with id "${playerInfos.id}" already in lobby with id "${lobbyId}"`) }
    } else { logger.error(`Impossible to add user to lobby: Lobby with id "${lobbyId}" is undefined in lobbyList`) }
    return lobbyToUpdate
}

export function removeUserFromLobby(lobbyList: LobbyInfosType[], lobbyId: LobbyInfosType['id'], playerId: PlayerType['id']) {
    const lobbyToUpdate = lobbyList.find(lobby => lobby.id == lobbyId)
    if (lobbyToUpdate !== undefined) {
        if (lobbyToUpdate.players.find(player => player.id == playerId) !== undefined) {
            lobbyToUpdate.players = lobbyToUpdate.players.filter(player => player.id !== playerId)
        } else { logger.warn(`User with id "${playerId}" not in lobby with id "${lobbyId}"`) }
    } else { logger.error(`Impossible to add user to lobby: Lobby with id "${lobbyId}" is undefined in lobbyList`) }
    return lobbyToUpdate
}

export function handleUserLeftLobby(io: Server, socket: Socket, lobbyList: LobbyInfosType[], lobbyId: LobbyInfosType['id'], playerId: PlayerType['id']){
    const updatedLobby = removeUserFromLobby(lobbyList, lobbyId, playerId)
    socket.to(lobbyId).emit('update-currentlobby', updatedLobby)
    if (updatedLobby !== undefined) {
        if (updatedLobby.isPublic) {
            emitSetLobbyList(io, lobbyList)
        }
}
}
