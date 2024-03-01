import { LobbyBackType, LobbyFrontType, UserBackType, UserFrontType } from "./types"
import logger from "./logger"
import { randomUUID } from "crypto"



export class InMemoryLobbiesStore {

    private lobbies

    constructor() {
        this.lobbies = new Map<LobbyBackType['id'], LobbyBackType>()
    }

    getLobby(id: string | undefined) {
        if (id !== undefined){
            return this.lobbies.get(id)
        }
    }

    getAllLobbies(isPublic?: boolean) {
        const lobbies = [...this.lobbies.values()]
        if (isPublic !== undefined){
            return lobbies.filter(lobby => lobby.isPublic == isPublic)
        }
        return lobbies
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

    getAllLobbiesForFront(isPublic?: boolean) {
        const lobbies = this.getAllLobbies(isPublic)  
        const lobbiesForFront: LobbyFrontType[] = []
        lobbies.forEach(lobby => {
            const usersForFront: UserFrontType[] = []
            lobby.users.forEach(user => {
                usersForFront.push({
                    userId: user.userId,
                    lobbyId: user.lobbyId,
                    imageName: user.imageName,
                    username: user.username
                })
            }) 
            lobbiesForFront.push({
                id: lobby.id,
                name: lobby.name,
                isPublic: lobby.isPublic,
                users: usersForFront
            })
        })
        return lobbiesForFront
    }

    saveLobby(session: UserBackType, lobbyName: LobbyFrontType['name'], isPublic: LobbyFrontType['isPublic']) {
        const users = new Map<UserBackType['sessionId'], UserBackType>()
        users.set(session.sessionId, session)
        const newBackLobby: LobbyBackType = {
            id: randomUUID(),
            name: lobbyName,
            isPublic: isPublic,
            createdAt: Date.now(),
            users: users}
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
            logger.removedUserFromLobby(user.sessionId, lobbyId)
            user.lobbyId = undefined
        }
        return lobby
    }

}