import express, { Request, Response } from 'express'
import { createServer } from 'http'
import bodyParser from 'body-parser'
import * as socketio from 'socket.io'
import * as path from 'path'
import logger from './logger'
import { LobbyInfosType, PlayerType } from './types'
import { handleUserJoinsLobby, addNewLobbyToList, ROOMPUBLICLOBBY, userLobby, handleUserLeftLobby, emitCreateLobby, emitSetLobbyList, emitAckLobbyCreated } from './handleLobbyChanges'
import * as cors from 'cors'

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

// Lobby list in RAM
const publicLobbyList: LobbyInfosType[] = []
const privateLobbyList: LobbyInfosType[] = []

app.get('/', (req: Request, res: Response) => {
  res.render(path.join(__dirname, '../index.ejs'), {
    public: publicLobbyList,
    private: privateLobbyList})
})


io.on('connection', (socket) => {
  logger.info(`New user connected: ${socket.id}`)

  
  socket.on('join-publiclobby', async () => {
    await socket.join(ROOMPUBLICLOBBY)
    emitSetLobbyList(io, publicLobbyList)
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


  socket.on('join-currentlobby', async (lobbyId: LobbyInfosType['id'], playerInfos: PlayerType, isPublic: boolean) => {
    if (isPublic) {
      await handleUserJoinsLobby(io, socket, publicLobbyList, lobbyId, playerInfos)
    } else {
      await handleUserJoinsLobby(io, socket, privateLobbyList, lobbyId, playerInfos)
    }
  })


  socket.on('left-currentlobby', async (lobbyId: LobbyInfosType['id'], playerId: PlayerType['id'], isPublic: boolean) => {
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
    logger.info(`User disconnected: ${socket.id}`)
    const lobbyId = userLobby(publicLobbyList, socket.id)
    if (lobbyId !== undefined) {
      handleUserLeftLobby(io, socket, publicLobbyList, lobbyId, socket.id)
    }
  })
})



httpServer.listen(PORT, () => {
  logger.info(`Back-end running: Listening on http://localhost:${PORT}`)
})
