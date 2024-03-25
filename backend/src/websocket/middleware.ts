import { Socket } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'
import { randomUUID } from 'crypto'
import { MainLogger } from '../logger'
import { InMemorySessionsStore } from '../sessionStore'

export function checkSessionId(
  socket: Socket,
  sessionStore: InMemorySessionsStore,
  logger: MainLogger,
  next: (err?: ExtendedError | undefined) => void
) {
  const isVerbose = false
  const sessionId = socket.handshake.auth.sessionId as string
  if (isVerbose) {
    logger.showSessionId(sessionId)
  }
  if (sessionId) {
    const session = sessionStore.findSession(sessionId)
    if (session) {
      socket.handshake.auth.sessionId = sessionId
      if (isVerbose) {
        logger.confirmSessionIdInSessionStore(session.userId, session.username)
      }
      return next()
    }
  }
  if (isVerbose) {
    logger.denySessionIdInSessionStore()
  }
  const newSessionId = randomUUID()
  const newUserId = randomUUID()
  const username = 'User' + Math.floor(Math.random() * 1000).toString()

  socket.handshake.auth.sessionId = newSessionId
  sessionStore.saveSession(newSessionId, {
    sessionId: newSessionId,
    userId: newUserId,
    lobbyId: undefined,
    username: username,
    imageName: '_',
    createdAt: Date.now()
  })
  if (isVerbose) {
    logger.createdNewSession(newSessionId, newUserId, username)
  }
  next()
}
