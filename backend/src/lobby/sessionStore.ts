import { User } from "./User"

export class InMemorySessionsStore {
  private sessions

  constructor() {
    this.sessions = new Map<string, User>()
  }

  findSession(id: string) {
    return this.sessions.get(id)
  }

  saveSession(id: string, user: User): void {
    this.sessions.set(id, user)
  }

  findAllSessions() {
    return [...this.sessions.values()]
  }
}
