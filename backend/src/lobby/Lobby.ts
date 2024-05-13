import { User, UserFrontType } from "./User"
import { AsyncGameSK } from "../games/skullKing/AsyncGameSK"
import { lobbyLogger } from "../logger"
import { randomUUID } from "crypto"

export type LobbyFrontType = {
    id: string
    name: string
    isPublic: boolean
    users: UserFrontType[]
    isGameStarted: boolean
}

export class Lobby {
    id: string
    name: string
    isPublic: boolean
    createdAt: number
    users: Map<User['sessionId'], User>
    game?: AsyncGameSK

    constructor(name: string, isPublic: boolean, users: Map<User['sessionId'], User>) {
        this.name = name
        this.isPublic = isPublic
        this.users = users

        this.id = randomUUID()
        this.createdAt = Date.now()
    }

    getFront(): LobbyFrontType {
        const usersFront = [...this.users.values()].map(
            (user): UserFrontType => {
                return {
                    userId: user.userId,
                    imageName: user.imageName,
                    username: user.username,
                    lobbyId: this.id
                }
            })
        return {
            id: this.id,
            name: this.name,
            isPublic: this.isPublic,
            users: usersFront,
            isGameStarted: this.game !== undefined
        }
    }

    isOngoingGame(){
        return this.game !== undefined
    }

    getNonBotPlayers(){
        return [...this.users.values()].filter(user => !user.isBot)
    }

    isEmpty() {
        if (this.users.size === 0 || [...this.users.values()].map(user => user['isBot']).every(x => x)) {
            return true
        }
        return false
    }

    isUserInLobby(sessionId: User['sessionId']) {
        const user = this.users.get(sessionId)
        if (user !== undefined) {
            if (!user.isBot) {
                return true
            }
        }
        return false
    }

    isBotInLobby(sessionId: User['sessionId']) {
        const user = this.users.get(sessionId)
        if (user !== undefined) {
            if (user.isBot) {
                return true
            }
        }
        return false
    }

    addUserToLobby(socketId: string, user: User) {
        this.users.set(user.sessionId, user)
        user.socketId2LobbyId.set(socketId, this.id)
        user.lobbyId2SocketId.set(this.id, socketId)
    }

    removeUserfromLobby(user: User) {
        if (!this.isUserInLobby(user.sessionId)) {
            lobbyLogger.userNotInLobby(user.sessionId, this.id)
            return
        } else {
            this.users.delete(user.sessionId)
            const socketId = user.lobbyId2SocketId.get(this.id)
            if (socketId !== undefined) {
                user.socketId2LobbyId.delete(socketId)
            }
            user.lobbyId2SocketId.delete(this.id)
            lobbyLogger.removedUserFromLobby(user.sessionId, this.id)
        }
    }

    replaceUserByBot(user: User) {
        if (!this.isUserInLobby(user.sessionId)) {
            lobbyLogger.userNotInLobby(user.sessionId, this.id)
            return
        } else {
            const bot: User = {
                ...user,
                username: `${user.username}-O-Bot`,
                isBot: true
            }
            this.users.set(user.sessionId, bot)
            const socketId = user.lobbyId2SocketId.get(this.id)
            if (socketId !== undefined) {
                user.socketId2LobbyId.delete(socketId)
            }
            user.lobbyId2SocketId.delete(this.id)
            lobbyLogger.replacedUserByBot(user.sessionId, this.id)
        }
    }
}