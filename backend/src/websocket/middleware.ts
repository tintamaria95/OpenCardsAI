import { Socket } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'
import { randomUUID } from 'crypto'
import { lobbyLogger } from '../logger'
import { InMemorySessionsStore } from '../lobby/sessionStore'

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
  const newSessionId = randomUUID()
  const newUserId = randomUUID()
  const username = 'User' + Math.floor(Math.random() * 1000).toString()

  socket.handshake.auth.sessionId = newSessionId
  sessionStore.saveSession(newSessionId, {
    sessionId: newSessionId,
    userId: newUserId,
    username: username,
    imageName: '_',
    createdAt: Date.now(),
    isBot: false
  })
  if (isVerbose) {
    lobbyLogger.createdNewSession(newSessionId, newUserId, username)
  }
  next()
}
