import winston from 'winston'
import * as dotenv from 'dotenv'

dotenv.config()

const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  // transports: [
  //   new winston.transports.File({ filename: 'warn.log', level: 'warn' })
  // ]
})

if (process.env.NODE_ENV !== 'PROD') {
  winstonLogger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
      level: 'debug'
    })
  )
}

class MainLogger {
  logger: winston.Logger
  constructor(logger: winston.Logger){
    this.logger = logger
  }
  DEVmodeWarnString = 'If DEV mode, might be due to second re-effect (ignore if it is the case).'

  
  backendRunning(port: number){
    this.logger.info(`Back-end running: Listening on http://localhost:${port}`)
  }

  // Middleware
  showSessionId(sessionId: string){
    this.logger.debug(`Middleware: User sessionId: ${sessionId}`)
  }

  confirmSessionIdInSessionStore(userId: string, username: string){
    this.logger.debug(`Middleware: sessionId is in sessionStore:
      -> userId: ${userId}
      -> username: ${username}`)
  }

  denySessionIdInSessionStore(){
    this.logger.debug(`Middleware: sessionId not found`)
  }

  createdNewSession(sessionId: string, userId: string, username: string){
    this.logger.debug(`Middleware: Created new session:
      -> sessionId: ${sessionId}
      -> userId: ${userId}
      -> username: ${username}`)

  }

  // After Connection

  userConnected(sessionId: string){
    this.logger.debug(`User connected | sessionId: ${sessionId}`)
  }

  userDisconnected(sessionId: string){
    this.logger.debug(`User disconnected | sessionId: ${sessionId}`)
  }

  userUpdatedUsername(sessionId: string, newUsername: string){
    this.logger.debug(`User updated username: ${newUsername} | sessionId: ${sessionId}`)
  }

  addUserToLobby(userId: string, lobbyId: string){
    this.logger.debug(`Called addUserToLobby function | userId: ${userId} | lobbyId: ${lobbyId}`)
  }
  removeUserFromLobby(userId: string, lobbyId: string){
    this.logger.debug(`Called removeUserFromLobby function | userId: ${userId} | lobbyId: ${lobbyId}`)
  }

  // Warnings
  userAlreadyInLobby(userId: string, lobbyId: string){
    this.logger.warn(`User with id "${userId}" already in lobby with id "${lobbyId}". ${this.DEVmodeWarnString}`)
  }
  userNotInLobby(userId: string, lobbyId: string){
    this.logger.warn(`User with id "${userId}" not in lobby with id "${lobbyId}". ${this.DEVmodeWarnString}`)
  }
  undefinedLobby(lobbyId: string){
    this.logger.warn(`Lobby with id "${lobbyId}" is undefined in lobbyList. ${this.DEVmodeWarnString}`)
  }

  // Errors

  sessionNotFound(sessionId: string){
      this.logger.error(`Session not found | sessionId: ${sessionId}`)
    }



  }




const logger = new MainLogger(winstonLogger)

export default logger
