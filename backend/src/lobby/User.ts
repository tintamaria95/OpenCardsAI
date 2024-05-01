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

    socketId2LobbyId: Map<string, string | undefined>
    createdAt: number

    constructor(sessionId: string, userId: string, username: string, imageName: string, isBot: boolean){
        this.sessionId = sessionId
        this.userId = userId
        this.username = username
        this.imageName = imageName
        this.isBot = isBot

        this.socketId2LobbyId = new  Map<string, string>()
        this.createdAt = Date.now()

    }
}