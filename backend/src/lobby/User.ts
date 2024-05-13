import { randomUUID } from "crypto"

export type UserFrontType = {
    userId: string
    username: string
    imageName: string
    lobbyId?: string
  }

export class User {

    sessionId: string
    userId: string
    username: string
    imageName: string
    isBot: boolean

    socketId2LobbyId: Map<string, string>
    lobbyId2SocketId: Map<string, string>
    createdAt: number

    constructor(username: string, imageName: string, isBot: boolean){

        this.username = username
        this.imageName = imageName
        this.isBot = isBot

        this.sessionId = randomUUID()
        this.userId = randomUUID()
        this.socketId2LobbyId = new  Map<string, string>()
        this.lobbyId2SocketId = new  Map<string, string>()
        this.createdAt = Date.now()

    }
}