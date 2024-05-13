import { Socket } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'
import { randomUUID } from 'crypto'
import { lobbyLogger } from '../logger'
import { InMemorySessionsStore } from '../lobby/sessionStore'
import { User } from '../lobby/User'

export function checkSessionId(
  socket: Socket,
  sessionStore: InMemorySessionsStore,
  next: (err?: ExtendedError | undefined) => void
) {
  const isVerbose = false
  const sessionId = socket.handshake.auth.sessionId as string
  if (isVerbose) {
    lobbyLogger.showSessionId(sessionId)
  }
  if (sessionId) {
    const session = sessionStore.findSession(sessionId)
    if (session) {
      socket.handshake.auth.sessionId = sessionId
      if (isVerbose) {
        lobbyLogger.confirmSessionIdInSessionStore(session.userId, session.username)
      }
      return next()
    }
  }
  if (isVerbose) {
    lobbyLogger.denySessionIdInSessionStore()
  }
  const username = 'User' + Math.floor(Math.random() * 1000).toString()
  const user = new User(username, '_', false)
  socket.handshake.auth.sessionId = user.sessionId
  sessionStore.saveSession(user.sessionId, user)
  
  if (isVerbose) {
    lobbyLogger.createdNewSession(user.sessionId, user.userId, username)
  }
  next()
}
