import express, { Request, Response } from 'express'
import { createServer } from 'http'
import bodyParser from 'body-parser'
import * as socketio from 'socket.io'
import * as path from 'path'
import lobbyLogger from './logger'
import { LobbyBackType } from './types'
import { ROOMPUBLICLOBBY, handleUserLeftLobby } from './handleLobbyChanges'
import * as cors from 'cors'
import { InMemorySessionsStore } from './sessionStore'
import { randomUUID } from 'crypto'
import { InMemoryLobbiesStore } from './lobbyStore'

const PORT = 3000

const app = express()

const httpServer = createServer(app)
const io = new socketio.Server(httpServer, {
  cors: {
    origin: 'http://localhost:8080'
  }
})

const corsOptions = {
  origin: "http://localhost:8080",
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
const lobbyStore = new InMemoryLobbiesStore()

app.get('/', (req: Request, res: Response) => {
  res.render(path.join(__dirname, '../index.ejs'), {
    public: lobbyStore.getAllLobbies(true),
    private: lobbyStore.getAllLobbies(false),
    sessions: sessionStore.findAllSessions()
  })
})

io.use((socket, next) => {
  const isShowlog = false
  const sessionId = socket.handshake.auth.sessionId as string
  if (isShowlog) { lobbyLogger.showSessionId(sessionId) }
  if (sessionId) {
    const session = sessionStore.findSession(sessionId)
    if (session) {
      socket.handshake.auth.sessionId = sessionId
      if (isShowlog) { lobbyLogger.confirmSessionIdInSessionStore(session.userId, session.username) }
      return next()
    }
  }
  if (isShowlog) { lobbyLogger.denySessionIdInSessionStore() }
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
    lobbyLogger.createdNewSession(newSessionId, newUserId, username)
  } next()
})

io.on('connection', (socket) => {

  socket.onAny((event) => { console.log(`got ${event}`) })

  const sessionId = socket.handshake.auth.sessionId as string
  const session = sessionStore.findSession(sessionId)
  if (!session) {
    lobbyLogger.sessionNotFound(sessionId)
    return Error('Session not found')
  }

  // socket.join(session.userId)
  io.to(socket.id).emit('session', session)

  lobbyLogger.userConnected(sessionId)

  socket.on('update-username',(username: string) => {
    session.username = username
    sessionStore.saveSession(sessionId, { ...session, username: username })
    lobbyLogger.userUpdatedUsername(sessionId, username)
  })

  socket.on('join-menu', async () => {
    if (session.lobbyId !== undefined){
      await handleUserLeftLobby(io, socket, lobbyStore, session, sessionStore)
    }
  })

  socket.on('join-publiclobby', async () => {
    await socket.join(ROOMPUBLICLOBBY)
  })

  socket.on('left-publiclobby', async () => {
    await socket.leave(ROOMPUBLICLOBBY)
  })

  socket.on('req-lobbylist', () => {
    io.to(socket.id).emit('update-lobbylist-setall', lobbyStore.getAllLobbiesForFront(true))
  })

  socket.on('req-create-lobby', async (lobbyName: string, isPublic: boolean) => {
      const lobbyId = lobbyStore.saveLobby(session, lobbyName, isPublic)
      session.lobbyId = lobbyId
      const lobbyForFront = lobbyStore.getLobbyForFront(lobbyId)
      await socket.leave(ROOMPUBLICLOBBY)
      await socket.join(lobbyId)

      io.to(lobbyId).emit('res-join-lobby', 'success', lobbyForFront)
      if (isPublic){
      io.to(ROOMPUBLICLOBBY).emit('update-lobbylist-addlobby', lobbyForFront)}
  })

  socket.on('req-join-lobby', async (lobbyId: LobbyBackType['id']) => {
    const lobby = lobbyStore.getLobby(lobbyId)
    if (lobby !== undefined) {
      if (lobbyStore.isUserInLobby(sessionId, lobby)) {
        lobbyLogger.userAlreadyInLobby(sessionId, lobbyId)
        io.to(lobbyId).emit('res-join-lobby', 'userAlreadyInLobby', lobbyStore.getLobbyForFront(lobbyId))
      } else {
        lobbyStore.addUserToLobby(session, lobbyId)
        await socket.leave(ROOMPUBLICLOBBY)
        await socket.join(lobbyId)
        session.lobbyId = lobbyId
        io.to(lobbyId).emit('res-join-lobby', 'success', lobbyStore.getLobbyForFront(lobbyId))
      }
    } else {
      lobbyLogger.undefinedLobby(lobbyId)
      io.to(socket.id).emit('res-join-lobby', 'undefinedLobby', undefined)
    }
  })

  socket.on('req-update-lobby', () => {
    if (session.lobbyId !== undefined) {
      if (lobbyStore.getLobby(session.lobbyId) !== undefined){
      io.to(session.lobbyId).emit('update-lobby', lobbyStore.getLobbyForFront(session.lobbyId))}
      else{
        lobbyLogger.logger.error('sessionId !== undefined but unknown in both public and private stores.')
      }
    }
    else {
      io.to(socket.id).emit('update-lobby', undefined)
    }
  })

  socket.on('disconnect', async () => { 
    lobbyLogger.userDisconnected(sessionId)
    await handleUserLeftLobby(io, socket, lobbyStore, session, sessionStore) })

})

httpServer.listen(PORT, () => {
  lobbyLogger.backendRunning(PORT)
})
