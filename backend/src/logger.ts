import winston from 'winston'
import * as dotenv from 'dotenv'
import { LobbyBackType, UserBackType } from './types'

dotenv.config()

const winstonLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.json()
  // transports: [
  //   new winston.transports.File({ filename: 'warn.log', level: 'warn' })
  // ]
})

if (process.env.NODE_ENV !== 'production') {
  winstonLogger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
      level: 'debug'
    })
  )
}

export class MainLogger {
  logger: winston.Logger
  constructor(logger: winston.Logger) {
    this.logger = logger
  }

  backendRunning(port: number) {
    this.logger.info(`Back-end running: Listening on http://localhost:${port}`)
  }

  // Middleware
  showSessionId(sessionId: UserBackType['sessionId']) {
    this.logger.debug(`Middleware: User sessionId: ${sessionId}`)
  }

  confirmSessionIdInSessionStore(
    userId: UserBackType['userId'],
    username: UserBackType['username']
  ) {
    this.logger.debug(`Middleware: sessionId is in sessionStore:
      -> userId: ${userId}
      -> username: ${username}`)
  }

  denySessionIdInSessionStore() {
    this.logger.debug(`Middleware: sessionId not found`)
  }

  createdNewSession(
    sessionId: UserBackType['sessionId'],
    userId: UserBackType['userId'],
    username: UserBackType['username']
  ) {
    this.logger.debug(`Middleware: Created new session:
      -> sessionId: ${sessionId}
      -> userId: ${userId}
      -> username: ${username}`)
  }

  // After Connection

  userConnected(sessionId: UserBackType['sessionId']) {
    this.logger.debug(`User connected | sessionId: ${sessionId}`)
  }

  userDisconnected(sessionId: UserBackType['sessionId']) {
    this.logger.debug(`User disconnected | sessionId: ${sessionId}`)
  }

  userUpdatedUsername(
    sessionId: UserBackType['sessionId'],
    newUsername: UserBackType['username']
  ) {
    this.logger.debug(
      `User updated username: ${newUsername} | sessionId: ${sessionId}`
    )
  }

  addUserToLobby(
    sessionId: UserBackType['sessionId'],
    lobbyId: LobbyBackType['id']
  ) {
    this.logger.debug(
      `Called addUserToLobby function | sessionId: ${sessionId} | lobbyId: ${lobbyId}`
    )
  }
  removeUserFromLobby(
    sessionId: UserBackType['sessionId'],
    lobbyId: LobbyBackType['id']
  ) {
    this.logger.debug(
      `Called removeUserFromLobby function | sessionId: ${sessionId} | lobbyId: ${lobbyId}`
    )
  }
  removedUserFromLobby(
    sessionId: UserBackType['sessionId'],
    lobbyId: LobbyBackType['id']
  ) {
    this.logger.debug(
      `User with sessionId "${sessionId}" has been removed from lobby with id "${lobbyId}"`
    )
  }

  // Warnings
  userAlreadyInLobby(
    sessionId: UserBackType['sessionId'],
    lobbyId: LobbyBackType['id']
  ) {
    this.logger.warn(
      `User with sessionId "${sessionId}" already in lobby with id "${lobbyId}".`
    )
  }
  userNotInLobby(
    sessionId: UserBackType['sessionId'],
    lobbyId: LobbyBackType['id']
  ) {
    this.logger.warn(
      `User with sessionId "${sessionId}" not in lobby with id "${lobbyId}".`
    )
  }
  undefinedLobby(lobbyId: LobbyBackType['id'] | undefined) {
    if (lobbyId == undefined) {
      this.logger.warn('LobbyId is undefined.')
    } else {
      this.logger.warn(`Lobby with id "${lobbyId}" is undefined in lobbyList.`)
    }
  }

  // Errors

  sessionNotFound(sessionId: UserBackType['sessionId']) {
    this.logger.error(`Session not found | sessionId: ${sessionId}`)
  }
}

const lobbyLogger = new MainLogger(winstonLogger)

export default lobbyLogger
