import { LobbyBackType, UserBackType } from "./types";
import { Socket } from 'socket.io'
import { Server } from "socket.io";
import { InMemoryLobbiesStore } from "./lobbyStore";
import logger from "./logger";
import { InMemorySessionsStore } from "./sessionStore";

export const ROOMPUBLICLOBBY = 'publiclobby'

export function handleUserJoinsLobby(io: Server, lobbyStore: InMemoryLobbiesStore, lobbyId: LobbyBackType['id'], user: UserBackType) {
    const updatedLobby = lobbyStore.addUserToLobby(user, lobbyId)
    if (updatedLobby === undefined) {
        logger.undefinedLobby(lobbyId)
    } else {
        io.to(lobbyId).emit('update-lobby', updatedLobby)
        if (updatedLobby.isPublic) {
            io.to(ROOMPUBLICLOBBY).emit('res-set-lobbylist', lobbyStore.getAllLobbies())
        }
    }
}

export function handleRemoveUserFromLobby(io: Server, lobbyStore: InMemoryLobbiesStore, lobbyId: LobbyBackType['id'], user: UserBackType) {
    const updatedLobby = lobbyStore.removeUserfromLobby(user, lobbyId)
    if (updatedLobby === undefined) {
        logger.undefinedLobby(lobbyId)
    } 
    else {
        if (updatedLobby.users.size === 0) {
            lobbyStore.deleteLobby(lobbyId)
        } else {
            io.to(lobbyId).emit('update-lobby', lobbyStore.getLobbyForFront(lobbyId))
        }
        if (updatedLobby.isPublic) {
            io.to(ROOMPUBLICLOBBY).emit('update-lobbylist-setall', lobbyStore.getAllLobbiesForFront())
        }
    }
}


export async function handleUserLeftLobby(io: Server, socket: Socket, lobbyStore: InMemoryLobbiesStore, session: UserBackType, sessionStore: InMemorySessionsStore) {
    if (session.lobbyId !== undefined) {
        if (lobbyStore.getLobby(session.lobbyId) !== undefined) {
            await socket.leave(session.lobbyId)
            handleRemoveUserFromLobby(io, lobbyStore, session.lobbyId, session)
        }
    }
    session.lobbyId = undefined
    sessionStore.saveSession(session.sessionId, { ...session, lobbyId: undefined })
    }