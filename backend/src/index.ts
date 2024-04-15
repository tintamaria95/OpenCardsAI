import express, { Request, Response } from 'express'
import { createServer } from 'http'
import bodyParser from 'body-parser'
import { Server } from 'socket.io'
import * as path from 'path'
import { lobbyLogger } from './logger'
import { Lobby } from './lobby/Lobby'
import { ROOMPUBLICLOBBY } from './lobby/handleLobbyChanges'
import * as cors from 'cors'
import { InMemorySessionsStore } from './lobby/sessionStore'
import { InMemoryLobbiesStore } from './lobby/lobbyStore'
import { checkSessionId } from './websocket/middleware'
import {
  disconnect,
  getSessionGame,
  getSessionLobby,
  joinMenu,
  reqCreateLobby,
  reqJoinLobby, 
  reqLobbyList,
  reqUpdateGameState,
  updateUsername
} from './websocket/events'
import { AsyncGameSK } from './games/skullKing/AsyncGameSK'
import { Action } from './games/commonClasses/Action'
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
  checkSessionId(socket, sessionStore, next)
})

io.on('connection', async (socket) => {
  const sessionId = socket.handshake.auth.sessionId as string
  lobbyLogger.userConnected(sessionId)

  const session = sessionStore.findSession(sessionId)
  if (!session) {
    lobbyLogger.sessionNotFound(sessionId)
    return Error('Session not found')
  }

  await socket.join(session.sessionId)
  io.to(socket.id).emit('session', session)

  socket.onAny((event) => {
    console.log(`got ${event}`)
  })

  socket.on('update-username', (username: string) =>
    updateUsername(username, sessionStore, session)
  )

  socket.on('join-menu',  () => {
    joinMenu(io, socket, lobbyStore, session)
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

  socket.on('req-join-lobby', (lobbyId: Lobby['id']) =>
    reqJoinLobby(
      lobbyId,
      io,
      socket,
      ROOMPUBLICLOBBY,
      lobbyStore,
      session
    )
  )

  socket.on('req-get-gameState', () => {
    const lobby = getSessionLobby(lobbyStore, session)
    if (lobby === undefined) { return }
    const game = getSessionGame(lobby)
    if (game === undefined) { return }
    io.to(session.sessionId).emit('gameState', game.getPlayerState(session.sessionId))
  })

  socket.on('req-update-gameState', (action: Action) => {
    const lobby = getSessionLobby(lobbyStore, session)
    if (lobby === undefined) { return }
    const game = getSessionGame(lobby)
    if (game === undefined) { return }
    reqUpdateGameState(io, lobby, game, sessionId, action)
  })

  socket.on('req-start-game', () => {
    const lobby = getSessionLobby(lobbyStore, session)
    if (lobby === undefined) { return }
    if (lobby.game !== undefined) {
      lobbyLogger.logger.debug(`Error: Game already started: Received request to start game in lobby with id "${lobby.id} | sessionId ${sessionId}"`)
      return
    }
    const players: PlayerSK[] = [...lobby.users.values()].map(user => new PlayerSK(user.sessionId, user.username))
    const deck = new DeckSK()
    const game = new AsyncGameSK(players, deck)
    lobby.game = game
    io.to(lobby.id).emit('res-start-game')
  })

  socket.on('disconnect', () =>
    disconnect(io, socket, lobbyStore, session)
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
