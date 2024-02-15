import express, { Request, Response } from 'express'
import { createServer } from 'http'
import bodyParser from 'body-parser'
import * as socketio from 'socket.io'
import * as path from 'path'
import logger from './logger'
import { LobbyBackType, LobbyFrontType, UserBackType } from './types'
import { handleUserJoinsLobby, ROOMPUBLICLOBBY, handleUserLeftLobby } from './handleLobbyChanges'
import * as cors from 'cors'
import { InMemorySessionsStore } from './sessionStore'
import { randomUUID } from 'crypto'
import { InMemoryLobbiesStore } from './lobbyStore'

const PORT = 3000

const app = express()

const httpServer = createServer(app)
const io = new socketio.Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173'
  }
})

const corsOptions = {
  origin: "http://localhost:5173",
  methods: 'GET,POST,DELETE',
  credentials: true
}



app.use(express.static('public'))
app.use(bodyParser.json())
app.use(cors.default(corsOptions))

// EJS
app.set('view engine', 'ejs')

// users sessions
const sessionStore = new InMemorySessionsStore()
// Lobby list in RAM
const publicLobbyStore = new InMemoryLobbiesStore()
const privateLobbyStore = new InMemoryLobbiesStore()

app.get('/', (req: Request, res: Response) => {
  res.render(path.join(__dirname, '../index.ejs'), {
    public: publicLobbyStore.findAllLobbies(),
    private: privateLobbyStore.findAllLobbies(),
    sessions: sessionStore.findAllSessions()
  })
})

io.use((socket, next) => {
  const isShowlog = false
  const sessionId = socket.handshake.auth.sessionId as string
  if (isShowlog) { logger.showSessionId(sessionId) }
  if (sessionId) {
    const session = sessionStore.findSession(sessionId)
    if (session) {
      socket.handshake.auth.sessionId = sessionId
      if (isShowlog) {logger.confirmSessionIdInSessionStore(session.userId, session.username)} 
      return next()
    }
  }
  if (isShowlog) { logger.denySessionIdInSessionStore()}
  const newSessionId = randomUUID()
  const newUserId = randomUUID()
  const username = 'User' + Math.floor(Math.random() * 1000).toString()

  socket.handshake.auth.sessionId = newSessionId
  sessionStore.saveSession(newSessionId, {
    sessionId: newSessionId,
    userId: newUserId,
    lobbyId: undefined,
    username: username,
    imageName: "_",
    createdAt: Date.now()
  })
  if (isShowlog) {
    logger.createdNewSession(newSessionId, newUserId, username)
  } next()
})

io.on('connection', async (socket) => {

  socket.onAny((event) => {console.log(`got ${event}`)})

  const sessionId = socket.handshake.auth.sessionId as string
  const session = sessionStore.findSession(sessionId)
  if (!session){
    logger.sessionNotFound(sessionId)
    return Error('Session not found')}
  
  socket.join(session.userId)
  io.to(session.userId).emit('session', session)

  logger.userConnected(sessionId)

  socket.on('update-username', (username: string) => {
    sessionStore.saveSession(sessionId, {...session, username: username})
    logger.userUpdatedUsername(sessionId, username)
  })

  socket.on('join-publiclobby', async () => {
    await socket.join(ROOMPUBLICLOBBY)
    io.to(session.userId).emit('res-set-lobbylist', publicLobbyStore.findAllLobbies())
  })


  socket.on('left-publiclobby', async () => {
    await socket.leave(ROOMPUBLICLOBBY)
  })


  socket.on('req-create-lobby', async (lobbyName: string, isPublic: boolean) => {
    if (isPublic) {
      const backLobbyId = publicLobbyStore.saveLobby(session, lobbyName, isPublic)
      session.lobbyId = backLobbyId
      const lobby = publicLobbyStore.getLobbyForFront(backLobbyId)
      await socket.leave(ROOMPUBLICLOBBY)
      await socket.join(backLobbyId)

      io.to(backLobbyId).emit('ack-lobby-created', lobby)
      io.to(ROOMPUBLICLOBBY).emit('res-create-lobby', lobby)

    } else {
      const backLobbyId = privateLobbyStore.saveLobby(session, lobbyName, isPublic)
      session.lobbyId = backLobbyId
      const lobby = privateLobbyStore.getLobbyForFront(backLobbyId)
      await socket.leave(ROOMPUBLICLOBBY)
      await socket.join(backLobbyId)
      
      io.to(backLobbyId).emit('ack-lobby-created', lobby)
    }
  })

  socket.on('req-join-lobby', async (lobbyId: LobbyBackType['id'], sessionId: UserBackType['sessionId']) =>{
    const lobby = publicLobbyStore.getLobby(lobbyId)
    if (lobby !== undefined){
      if (!publicLobbyStore.isUserInLobby(sessionId, lobby)){
        socket.to(session.userId).emit('res-join-lobby', lobby)
      } else{
        logger.userAlreadyInLobby(sessionId, lobbyId)
      }
    } else { logger.undefinedLobby(lobbyId)}
  })


  socket.on('join-currentlobby', async (lobbyId: LobbyBackType['id'], isPublic: boolean) => {
    await socket.leave(ROOMPUBLICLOBBY)
    await socket.join(lobbyId)
    if (isPublic) {
      handleUserJoinsLobby(io, publicLobbyStore, lobbyId, session)
    } else {
      handleUserJoinsLobby(io, privateLobbyStore, lobbyId, session)
    }
  })


  socket.on('left-currentlobby', async () => {
    const prevLobby = publicLobbyStore.getLobby(session.lobbyId)
    if (prevLobby === undefined) { logger.undefinedLobby(session.lobbyId) } 
    else {
      if (prevLobby.isPublic) {
        handleUserLeftLobby(io, socket, publicLobbyStore, prevLobby.id, session)
      }
      else {
        handleUserLeftLobby(io, socket, privateLobbyStore, prevLobby.id, session)
      }
      await socket.leave(prevLobby.id)
    }
    await socket.join(ROOMPUBLICLOBBY)
  }
  )


  socket.on('disconnect', () => {
    logger.userDisconnected(sessionId)
    const lobbyId = session.lobbyId
    if (lobbyId !== undefined) {
      handleUserLeftLobby(io, socket, publicLobbyStore, lobbyId, session)
    }
  })
})



httpServer.listen(PORT, () => {
  logger.backendRunning(PORT)
})
