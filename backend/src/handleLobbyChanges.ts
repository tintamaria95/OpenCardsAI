import { LobbyInfosType, PlayerType } from "./types";
import { Socket } from 'socket.io'
import logger from "./logger";
import { Server } from "socket.io";
import { randomUUID } from "crypto";

export const ROOMPUBLICLOBBY = 'publiclobby'

export function handleUserJoinsLobby(io: Server, socket: Socket, lobbyList: LobbyInfosType[], lobbyId: LobbyInfosType['id'], playerInfos: PlayerType) {
    const updatedLobby = addUserToLobby(lobbyList, lobbyId, playerInfos)
    if (updatedLobby == undefined) {
        // TODO handle error lobby not found
    } else {
        io.to(lobbyId).emit('update-currentlobby', updatedLobby)
        if (updatedLobby.isPublic) {
            emitSetLobbyList(io, lobbyList)
        }
    }
}

export function userLobby(lobbyList: LobbyInfosType[], playerId: PlayerType['userId']){
    const lobby =  lobbyList.find(lobby => lobby.players.some(player => player.userId === playerId))
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
    const index = lobbyList.findIndex(lobby => lobby.id === lobbyId)
    if (index > -1){
    lobbyList.splice(index, 1)}
}

export function emitAckLobbyCreated(io: Server, lobbyInfos: LobbyInfosType){
    io.to(lobbyInfos.id).emit('ack-lobby-created', lobbyInfos)
}

export function emitCreateLobby(io: Server, lobbyInfos: LobbyInfosType) {
    io.to(ROOMPUBLICLOBBY).emit('res-create-lobby', lobbyInfos)
}

export function emitSetLobbyListToUser(io: Server, lobbyList: LobbyInfosType[], socketId: string){
    io.to(socketId).emit('res-set-lobbylist', lobbyList)
}

export function emitSetLobbyList(io: Server, lobbyList: LobbyInfosType[]){
    io.to(ROOMPUBLICLOBBY).emit('res-set-lobbylist', lobbyList)
}

export function addUserToLobby(lobbyList: LobbyInfosType[], lobbyId: LobbyInfosType['id'], playerInfos: PlayerType) {
    // logger.addUserToLobby(playerInfos.userId, lobbyId)
    const lobbyToUpdate = lobbyList.find(lobby => lobby.id == lobbyId)
    if (lobbyToUpdate !== undefined) {
        if (lobbyToUpdate.players.find(player => player.userId == playerInfos.userId) == undefined) {
            lobbyToUpdate.players.push(playerInfos)
        } else { logger.userAlreadyInLobby(playerInfos.userId, lobbyId)}
    } else { logger.undefinedLobby(lobbyId) }
    return lobbyToUpdate
}

export function removeUserFromLobby(lobbyList: LobbyInfosType[], lobbyId: LobbyInfosType['id'], playerId: PlayerType['userId']) {
    // logger.removeUserFromLobby(playerId, lobbyId)
    const lobbyToUpdate = lobbyList.find(lobby => lobby.id == lobbyId)
    if (lobbyToUpdate !== undefined) {
        if (lobbyToUpdate.players.find(player => player.userId == playerId) !== undefined) {
            lobbyToUpdate.players = lobbyToUpdate.players.filter(player => player.userId !== playerId)
        } else { logger.userNotInLobby(playerId, lobbyId) }
    } else { logger.undefinedLobby(lobbyId) }
    return lobbyToUpdate
}

export function handleUserLeftLobby(io: Server, socket: Socket, lobbyList: LobbyInfosType[], lobbyId: LobbyInfosType['id'], playerId: PlayerType['userId']) {
    const updatedLobby = removeUserFromLobby(lobbyList, lobbyId, playerId)
    if (updatedLobby !== undefined) {
        if (updatedLobby.players.length === 0) {
            removeLobbyFromList(lobbyList, updatedLobby.id)
        } else {
            socket.to(lobbyId).emit('update-currentlobby', updatedLobby)
        }
        if (updatedLobby.isPublic) {
            emitSetLobbyList(io, lobbyList)
        }
    }
}
