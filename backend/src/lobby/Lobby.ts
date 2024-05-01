import { User, UserFrontType } from "./User"
import { AsyncGameSK } from "../games/skullKing/AsyncGameSK"
import { lobbyLogger } from "../logger"

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

    constructor(id: string, name: string, isPublic: boolean, users: Map<User['sessionId'], User>) {
        this.id = id
        this.name = name
        this.isPublic = isPublic
        this.users = users

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
    }

    removeUserfromLobby(user: User) {
        if (!this.isUserInLobby(user.sessionId)) {
            lobbyLogger.userNotInLobby(user.sessionId, this.id)
            return
        } else {
            this.users.delete(user.sessionId)
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
            lobbyLogger.replacedUserByBot(user.sessionId, this.id)
        }
    }
}