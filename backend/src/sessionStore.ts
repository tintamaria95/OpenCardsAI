import { UserBackType } from './types'

export class InMemorySessionsStore {
  private sessions

  constructor() {
    this.sessions = new Map<string, UserBackType>()
  }

  findSession(id: string) {
    return this.sessions.get(id)
  }

  saveSession(id: string, user: UserBackType): void {
    this.sessions.set(id, user)
  }

  findAllSessions() {
    return [...this.sessions.values()]
  }
}
