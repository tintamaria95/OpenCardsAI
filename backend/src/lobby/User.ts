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

    createdAt: number

    lobbyId?: string

    constructor(sessionId: string, userId: string, username: string, imageName: string, isBot: boolean){
        this.sessionId = sessionId
        this.userId = userId
        this.username = username
        this.imageName = imageName
        this.isBot = isBot

        this.createdAt = Date.now()

    }
}