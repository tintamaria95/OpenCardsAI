export class InMemorySessionsStore {

    private sessions

    constructor() {
        this.sessions = new Map<string, string>()
    }

    findSession(id: string) {
        return this.sessions.get(id)
    }

    saveSession(id: string, session: string): void {
        this.sessions.set(id, session)
    }

    findAllSessions() {
        return [...this.sessions.values()]
    }
}