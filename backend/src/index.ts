import express, { Request, Response } from 'express'
import { createServer } from 'http'
import bodyParser from 'body-parser'
import { Server } from 'socket.io'
import * as path from 'path'
import {lobbyLogger} from './logger'
import { LobbyBackType } from './types'
import { ROOMPUBLICLOBBY } from './handleLobbyChanges'
import * as cors from 'cors'
import { InMemorySessionsStore } from './sessionStore'
import { InMemoryLobbiesStore } from './lobbyStore'
import { checkSessionId } from './websocket/middleware'
import {
  disconnect,
  joinMenu,
  reqCreateLobby,
  reqJoinLobby,
  reqLobbyList,
  updateUsername
} from './websocket/events'
import { ActionsSK, AsyncGameSK } from './games/skullKing/AsyncGameSK'
import { PlayerSK } from './games/skullKing/PlayerSK'
import { DeckSK } from './games/skullKing/DeckSK'

const PORT = 3000

const app = express()

const httpServer = createServer(app)

// const allowedOrigin = [/\b\w*\.?martinld.fr\b/,  "localhost:8080", "localhost:5173"]
const allowedOrigin = '*'

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigin
  }
})

const corsOptions = {
  origin: allowedOrigin,
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
  checkSessionId(socket, sessionStore, lobbyLogger, next)
})

io.on('connection', (socket) => {
  const sessionId = socket.handshake.auth.sessionId as string
  lobbyLogger.userConnected(sessionId)

  const session = sessionStore.findSession(sessionId)
  if (!session) {
    lobbyLogger.sessionNotFound(sessionId)
    return Error('Session not found')
  }

  socket.join(session.sessionId)
  io.to(socket.id).emit('session', session)

  socket.onAny((event) => {
    console.log(`got ${event}`)
  })

  socket.on('update-username', (username: string) =>
    updateUsername(username, sessionStore, session, lobbyLogger)
  )

  socket.on('join-menu', () =>{
    joinMenu(io, socket, lobbyStore, sessionStore, session)
  })

  socket.on('join-publiclobby', async () => {
    await socket.join(ROOMPUBLICLOBBY)
  })

  socket.on('left-publiclobby', async () => {
    await socket.leave(ROOMPUBLICLOBBY)
  })

  socket.on('req-lobbylist', () => reqLobbyList(io, socket, lobbyStore))

  socket.on('req-create-lobby', (lobbyName: string, isPublic: boolean) =>
    reqCreateLobby(
      lobbyName,
      isPublic,
      io,
      socket,
      ROOMPUBLICLOBBY,
      lobbyStore,
      session
    )
  )

  socket.on('req-join-lobby', (lobbyId: LobbyBackType['id']) =>
    reqJoinLobby(
      lobbyId,
      io,
      socket,
      ROOMPUBLICLOBBY,
      lobbyStore,
      session,
      lobbyLogger
    )
  )

  socket.on('req-get-gameState', () => {
    const lobbyId = session.lobbyId
    if (lobbyId == undefined) {
      lobbyLogger.undefinedLobby(lobbyId)
      return
    }
    const lobby = lobbyStore.getLobby(lobbyId)
    if (lobby === undefined) {
      lobbyLogger.undefinedLobby(lobbyId)
      return
    }
    const game = lobby.game
    if (game === undefined) {
      lobbyLogger.undefinedGame(lobbyId)
      return
    }
    lobby.users.forEach(user => io.to(user.sessionId).emit('gameState', game.getPlayerState(user.sessionId)))
    socket.on('req-update-gameState', (actionType: ActionsSK, action: number) => {
      game.updateState(actionType, action, sessionId)
      lobby.users.forEach(user => io.to(user.sessionId).emit('gameState', game.getPlayerState(user.sessionId)))
    })
  })


  socket.on('req-start-game', () => {
    const lobbyId = session.lobbyId
    if (lobbyId !== undefined){
      const lobby  = lobbyStore.getLobby(lobbyId)
      if (lobby !== undefined){
        const players: PlayerSK[] = []
        lobby.users.forEach(user => {
          players.push(new PlayerSK(user.sessionId, user.username))})
        const deck = new DeckSK()
        const game = new AsyncGameSK(players, deck)
        lobby.game = game
        io.to(lobbyId).emit('res-start-game')
      }
    }
  })

  socket.on('disconnect', () =>
    disconnect(io, socket, lobbyStore, session, sessionStore, lobbyLogger)
  )
})

httpServer.listen(PORT, () => {
  lobbyLogger.backendRunning(PORT)
})

process.on('SIGINT', () => {
  console.log('Received SIGINT signal')
  httpServer.close(() => {
    console.log('Server is closed properly')
    process.exit(0)
  })
})
io
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal')
  httpServer.close(() => {
    console.log('Server is closed properly')
    process.exit(0)
  })
})
