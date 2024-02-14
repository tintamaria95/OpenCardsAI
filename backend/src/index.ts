import express, { Request, Response } from 'express'
import { createServer } from 'http'
import bodyParser from 'body-parser'
import * as socketio from 'socket.io'
import * as path from 'path'
import logger from './logger'
import { LobbyInfosType, PlayerType } from './types'
import { handleUserJoinsLobby, addNewLobbyToList, ROOMPUBLICLOBBY, userLobby, handleUserLeftLobby, emitCreateLobby, emitAckLobbyCreated, emitSetLobbyListToUser } from './handleLobbyChanges'
import * as cors from 'cors'
import { InMemorySessionsStore } from './sessionStore'
import { randomUUID } from 'crypto'

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

// Players sessions
const sessionStore = new InMemorySessionsStore()
// Lobby list in RAM
const publicLobbyList: LobbyInfosType[] = []
const privateLobbyList: LobbyInfosType[] = []

app.get('/', (req: Request, res: Response) => {
  res.render(path.join(__dirname, '../index.ejs'), {
    public: publicLobbyList,
    private: privateLobbyList,
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
    emitSetLobbyListToUser(io, publicLobbyList, socket.id)
  })


  socket.on('left-publiclobby', async () => {
    await socket.leave(ROOMPUBLICLOBBY)
  })


  socket.on('req-create-lobby', async (lobbyInfos: LobbyInfosType) => {
    if (lobbyInfos.isPublic) {
      addNewLobbyToList(publicLobbyList, lobbyInfos)
      await socket.join(lobbyInfos.id)
      emitAckLobbyCreated(io, lobbyInfos)

      await socket.leave(ROOMPUBLICLOBBY)
      emitCreateLobby(io, lobbyInfos)

    } else {
      addNewLobbyToList(privateLobbyList, lobbyInfos)
      await socket.join(lobbyInfos.id)
      emitAckLobbyCreated(io, lobbyInfos)
    }
  })

  socket.on('req-join-lobby', async(lobbyId: LobbyInfosType['id'], playerId: PlayerType['sessionId']) =>{
    
  })


  socket.on('join-currentlobby', async (lobbyId: LobbyInfosType['id'], playerInfos: PlayerType, isPublic: boolean) => {
    await socket.leave(ROOMPUBLICLOBBY)
    await socket.join(lobbyId)
    if (isPublic) {
      handleUserJoinsLobby(io, socket, publicLobbyList, lobbyId, playerInfos)
    } else {
      handleUserJoinsLobby(io, socket, privateLobbyList, lobbyId, playerInfos)
    }
  })


  socket.on('left-currentlobby', async (lobbyId: LobbyInfosType['id'], playerId: PlayerType['userId'], isPublic: boolean) => {
    if (isPublic) {
      handleUserLeftLobby(io, socket, publicLobbyList, lobbyId, playerId)
    }
    else {
      handleUserLeftLobby(io, socket, privateLobbyList, lobbyId, playerId)
    }
    await socket.leave(lobbyId)
    await socket.join(ROOMPUBLICLOBBY)
  }
  )


  socket.on('disconnect', () => {
    logger.userDisconnected(sessionId)
    const lobbyId = userLobby(publicLobbyList, socket.id)
    if (lobbyId !== undefined) {
      handleUserLeftLobby(io, socket, publicLobbyList, lobbyId, socket.id)
    }
  })
})



httpServer.listen(PORT, () => {
  logger.backendRunning(PORT)
})
