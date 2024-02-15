import { LobbyBackType, LobbyStore, UserBackType } from "./types";
import { Socket } from 'socket.io'
import { Server } from "socket.io";
import { InMemoryLobbiesStore } from "./lobbyStore";
import logger from "./logger";

export const ROOMPUBLICLOBBY = 'publiclobby'

export function handleUserJoinsLobby(io: Server, lobbyStore: InMemoryLobbiesStore, lobbyId: LobbyBackType['id'], user: UserBackType) {
    const updatedLobby = lobbyStore.addUserToLobby(user, lobbyId)
    if (updatedLobby === undefined) {
        logger.undefinedLobby(lobbyId)
    } else {
        io.to(lobbyId).emit('update-currentlobby', updatedLobby)
        if (updatedLobby.isPublic) {
            io.to(ROOMPUBLICLOBBY).emit('res-set-lobbylist', lobbyStore.getAllLobbies())
        }
    }
}

export function handleUserLeftLobby(io: Server, lobbyStore: InMemoryLobbiesStore, lobbyId: LobbyBackType['id'], user: UserBackType) {
    const updatedLobby = lobbyStore.removeUserfromLobby(user, lobbyId)
    if (updatedLobby === undefined) {
        logger.undefinedLobby(lobbyId)
    } 
    else {
        if (updatedLobby.users.size === 0) {
            lobbyStore.deleteLobby(lobbyId)
        } else {
            io.to(lobbyId).emit('update-currentlobby', lobbyStore.getLobbyForFront(lobbyId))
        }
        if (updatedLobby.isPublic) {
            io.to(ROOMPUBLICLOBBY).emit('update-lobbylist-setall', lobbyStore.getAllLobbiesForFront())
        }
    }
}
