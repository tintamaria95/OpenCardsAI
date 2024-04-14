import winston from 'winston'
import * as dotenv from 'dotenv'
import { Lobby } from './lobby/Lobby'
import { User } from './lobby/User'
import * as fs from 'fs'

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

fs.writeFileSync('game.log', '')
const gameLogger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'game.log', level: 'debug' })
    ,
    new winston.transports.Console()
  ]
})

export class MainLogger {
  logger: winston.Logger
  constructor(logger: winston.Logger) {
    this.logger = logger
  }

  backendRunning(port: number) {
    this.logger.info(`Back-end running: Listening on http://localhost:${port}`)
  }

  // Middleware
  showSessionId(sessionId: User['sessionId']) {
    this.logger.debug(`Middleware: User sessionId: ${sessionId}`)
  }

  confirmSessionIdInSessionStore(
    userId: User['userId'],
    username: User['username']
  ) {
    this.logger.debug(`Middleware: sessionId is in sessionStore:
      -> userId: ${userId}
      -> username: ${username}`)
  }

  denySessionIdInSessionStore() {
    this.logger.debug(`Middleware: sessionId not found`)
  }

  createdNewSession(
    sessionId: User['sessionId'],
    userId: User['userId'],
    username: User['username']
  ) {
    this.logger.debug(`Middleware: Created new session:
      -> sessionId: ${sessionId}
      -> userId: ${userId}
      -> username: ${username}`)
  }

  // After Connection

  userConnected(sessionId: User['sessionId']) {
    this.logger.debug(`User connected | sessionId: ${sessionId}`)
  }

  userDisconnected(sessionId: User['sessionId']) {
    this.logger.debug(`User disconnected | sessionId: ${sessionId}`)
  }

  userUpdatedUsername(
    sessionId: User['sessionId'],
    newUsername: User['username']
  ) {
    this.logger.debug(
      `User updated username: ${newUsername} | sessionId: ${sessionId}`
    )
  }

  removeUserFromLobby(
    sessionId: User['sessionId'],
    lobbyId: Lobby['id']
  ) {
    this.logger.debug(
      `Called removeUserFromLobby function | sessionId: ${sessionId} | lobbyId: ${lobbyId}`
    )
  }
  removedUserFromLobby(
    sessionId: User['sessionId'],
    lobbyId: Lobby['id']
  ) {
    this.logger.debug(
      `User has been removed from lobby with id "${lobbyId}"| sessionId "${sessionId}"`
    )
  }

  replacedUserByBot(
    sessionId: User['sessionId'],
    lobbyId: Lobby['id']
  ) {
    this.logger.debug(
      `User has been replaced by a bot in lobby with id "${lobbyId}"| sessionId "${sessionId}"`
    )
  }

  // Warnings
  userAlreadyInLobby(
    sessionId: User['sessionId'],
    lobbyId: Lobby['id']
  ) {
    this.logger.warn(
      `User with sessionId "${sessionId}" already in lobby with id "${lobbyId}".`
    )
  }
  userNotInLobby(
    sessionId: User['sessionId'],
    lobbyId: Lobby['id']
  ) {
    this.logger.warn(
      `User with sessionId "${sessionId}" not in lobby with id "${lobbyId}".`
    )
  }
  undefinedLobby(lobbyId: Lobby['id'] | undefined) {
    if (lobbyId == undefined) {
      this.logger.warn('LobbyId is undefined.')
    } else {
      this.logger.warn(`Lobby with id "${lobbyId}" is undefined in lobbyList.`)
    }
  }

  undefinedGame(lobbyId: Lobby['id']){
    this.logger.warn(`Lobby with id '${lobbyId}' has an undefined 'game' property.`)
  }

  // Errors

  sessionNotFound(sessionId: User['sessionId']) {
    this.logger.error(`Session not found | sessionId: ${sessionId}`)
  }
}

const lobbyLogger = new MainLogger(winstonLogger)

export {lobbyLogger, gameLogger}
