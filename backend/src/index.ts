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
    public: publicLobbyStore.getAllLobbies(),
    private: privateLobbyStore.getAllLobbies(),
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
      if (isShowlog) { logger.confirmSessionIdInSessionStore(session.userId, session.username) }
      return next()
    }
  }
  if (isShowlog) { logger.denySessionIdInSessionStore() }
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

  socket.onAny((event) => { console.log(`got ${event}`) })

  const sessionId = socket.handshake.auth.sessionId as string
  const session = sessionStore.findSession(sessionId)
  if (!session) {
    logger.sessionNotFound(sessionId)
    return Error('Session not found')
  }

  // socket.join(session.userId)
  io.to(socket.id).emit('session', session)

  logger.userConnected(sessionId)

  socket.on('update-username', (username: string) => {
    session.username = username
    sessionStore.saveSession(sessionId, { ...session, username: username })
    logger.userUpdatedUsername(sessionId, username)
  })

  socket.on('join-publiclobby', async () => {
    await socket.join(ROOMPUBLICLOBBY)
    io.to(socket.id).emit('update-lobbylist-setall', publicLobbyStore.getAllLobbiesForFront())
  })


  socket.on('left-publiclobby', async () => {
    await socket.leave(ROOMPUBLICLOBBY)
  })


  socket.on('req-create-lobby', async (lobbyName: string, isPublic: boolean) => {
    if (isPublic) {
      const lobbyId = publicLobbyStore.saveLobby(session, lobbyName, isPublic)
      session.lobbyId = lobbyId
      const lobbyForFront = publicLobbyStore.getLobbyForFront(lobbyId)
      await socket.leave(ROOMPUBLICLOBBY)
      await socket.join(lobbyId)

      io.to(lobbyId).emit('res-join-lobby', 'success', lobbyForFront)
      io.to(ROOMPUBLICLOBBY).emit('update-lobbylist-addlobby', lobbyForFront)
    } else {
      const lobbyId = privateLobbyStore.saveLobby(session, lobbyName, isPublic)
      session.lobbyId = lobbyId
      const lobby = privateLobbyStore.getLobbyForFront(lobbyId)
      await socket.leave(ROOMPUBLICLOBBY)
      await socket.join(lobbyId)

      io.to(lobbyId).emit('res-join-lobby', 'success', lobby)
    }
  })

  socket.on('req-join-lobby', async (lobbyId: LobbyBackType['id']) => {
    const lobby = publicLobbyStore.getLobby(lobbyId)
    if (lobby !== undefined) {
      if (publicLobbyStore.isUserInLobby(sessionId, lobby)) {
        logger.userAlreadyInLobby(sessionId, lobbyId)
        io.to(lobbyId).emit('res-join-lobby', 'userAlreadyInLobby', publicLobbyStore.getLobbyForFront(lobbyId))
      } else {
        publicLobbyStore.addUserToLobby(session, lobbyId)
        await socket.leave(ROOMPUBLICLOBBY)
        await socket.join(lobbyId)
        session.lobbyId = lobbyId
        io.to(lobbyId).emit('res-join-lobby', 'success', publicLobbyStore.getLobbyForFront(lobbyId))
      }
    } else {
      logger.undefinedLobby(lobbyId)
      io.to(socket.id).emit('res-join-lobby', 'undefinedLobby', undefined)
    }
  })
    
  socket.on('left-lobby', async () => {
    if (session.lobbyId !== undefined) {
      if (publicLobbyStore.getLobby(session.lobbyId) !== undefined) {
        await socket.leave(session.lobbyId)
        handleUserLeftLobby(io, publicLobbyStore, session.lobbyId, session)
      }
      else if (privateLobbyStore.getLobby(session.lobbyId) !== undefined) {
        await socket.leave(session.lobbyId)
        handleUserLeftLobby(io, privateLobbyStore, session.lobbyId, session)
      } else {
        logger.undefinedLobby(session.lobbyId)
      }
    }
    await socket.join(ROOMPUBLICLOBBY)
  }
  )


  socket.on('disconnect', async () => {
    logger.userDisconnected(sessionId)
    if (session.lobbyId !== undefined) {
      await socket.leave(session.lobbyId)
      handleUserLeftLobby(io, publicLobbyStore, session.lobbyId, session)
    }
  })
})



httpServer.listen(PORT, () => {
  logger.backendRunning(PORT)
})
