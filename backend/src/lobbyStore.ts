import { LobbyBackType, LobbyFrontType, UserBackType } from "./types"
import logger from "./logger"
import { randomUUID } from "crypto"



export class InMemoryLobbiesStore {

    private lobbies

    constructor() {
        this.lobbies = new Map<LobbyBackType['id'], LobbyBackType>()
    }

    getLobby(id: string | undefined) {
        if (id === undefined){
            logger.undefinedLobbyId()
            return undefined
        }
        return this.lobbies.get(id)
    }

    getLobbyForFront(id: string | undefined){
        const lobby = this.getLobby(id)
        if (lobby !== undefined){
            const lobbyForFront: LobbyFrontType={
                id: lobby.id,
                name: lobby.name,
                isPublic: lobby.isPublic,
                users: [...lobby.users.values()]
            } 
            return lobbyForFront
        }
    }

    saveLobby(session: UserBackType, lobbyName: LobbyFrontType['name'], isPublic: LobbyFrontType['isPublic']) {
        const newBackLobby: LobbyBackType = {
            id: randomUUID(),
            name: lobbyName,
            isPublic: isPublic,
            createdAt: Date.now(),
            users: new Map<UserBackType['sessionId'], UserBackType>().set(session.sessionId, session)}
        this.lobbies.set(newBackLobby.id, newBackLobby)
        return newBackLobby.id
    }

    saveLobbyFromObj(lobby: LobbyBackType) {
        this.lobbies.set(lobby.id, lobby)
        return lobby.id
    }

    deleteLobby(lobbyId: LobbyBackType['id']){
        this.lobbies.delete(lobbyId)
    }

    findAllLobbies() {
        return [...this.lobbies.values()]
    }

    isUserInLobby(sessionId: UserBackType['sessionId'],lobby: LobbyBackType){
        if (lobby.users.get(sessionId)){
            return true
        }
        return false
    }

    addUserToLobby(user: UserBackType, lobbyId: LobbyBackType['id']) {
        const lobby = this.getLobby(lobbyId)
        if (lobby === undefined) {
            logger.undefinedLobby(lobbyId)
        } 
        else if (this.isUserInLobby(user.sessionId, lobby)){
            logger.userAlreadyInLobby(user.sessionId, lobbyId)
            return
        }
        else {
            lobby.users.set(user.sessionId, user)
            user.lobbyId = lobbyId
        }
        return lobby
    }

    removeUserfromLobby(user: UserBackType, lobbyId: LobbyBackType['id']){
        const lobby = this.getLobby(lobbyId)
        if (lobby === undefined) {
            logger.undefinedLobby(lobbyId)
            return
        } 
        else if (!this.isUserInLobby(user.sessionId, lobby)){
            logger.userNotInLobby(user.sessionId, lobbyId)
            return
        }
        else {
            lobby.users.delete(user.sessionId)
            user.lobbyId = undefined
        }
        return lobby
    }

}