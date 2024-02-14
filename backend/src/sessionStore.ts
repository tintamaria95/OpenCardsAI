import { PlayerType } from "./types"



export class InMemorySessionsStore {

    private sessions

    constructor() {
        this.sessions = new Map<string, PlayerType>()
    }

    findSession(id: string) {
        return this.sessions.get(id)
    }

    saveSession(id: string, player: PlayerType): void {
        this.sessions.set(id, player)
    }

    findAllSessions() {
        return [...this.sessions.values()]
    }
}