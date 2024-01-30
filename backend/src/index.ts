import express, { Request, Response } from 'express'
import { createServer } from 'http'
import bodyParser from 'body-parser'
import * as socketio from 'socket.io'
import * as path from 'path'
import logger from './logger'
import { LobbyInfosType, PlayerType } from './types'
import { addUserToLobby, handleUserJoinsLobby, removeUserFromLobby, addNewLobbyToList, ROOMPUBLICLOBBY, removeLobbyFromList, userLobby, handleUserLeftLobby, emitCreateLobby, emitSetLobbyList, emitAckLobbyCreated } from './handleLobbyChanges'
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

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../index.html'))
})

// Lobby list in RAM
let publicLobbyList: LobbyInfosType[] = []
let privateLobbyList: LobbyInfosType[] = []


io.on('connection', (socket) => {
  logger.info(`New user connected: ${socket.id}`)

  
  socket.on('join-publiclobby', () => {
    socket.join(ROOMPUBLICLOBBY)
    emitSetLobbyList(io, publicLobbyList)
  })


  socket.on('left-publiclobby', () => {
    socket.leave(ROOMPUBLICLOBBY)
  })


  socket.on('req-create-lobby', (lobbyInfos: LobbyInfosType) => {
    if (lobbyInfos.isPublic) {
      addNewLobbyToList(publicLobbyList, lobbyInfos)
      socket.join(lobbyInfos.id)
      emitAckLobbyCreated(io, lobbyInfos)

      socket.leave(ROOMPUBLICLOBBY)
      emitCreateLobby(io, lobbyInfos)

    } else {
      addNewLobbyToList(privateLobbyList, lobbyInfos)
      socket.join(lobbyInfos.id)
      emitAckLobbyCreated(io, lobbyInfos)
    }
  })


  socket.on('join-currentlobby', (lobbyId: LobbyInfosType['id'], playerInfos: PlayerType, isPublic: boolean) => {
    if (isPublic) {
      handleUserJoinsLobby(io, socket, publicLobbyList, lobbyId, playerInfos)
    } else {
      handleUserJoinsLobby(io, socket, privateLobbyList, lobbyId, playerInfos)
    }
  })


  socket.on('left-currentlobby', (lobbyId: LobbyInfosType['id'], playerId: PlayerType['id'], isPublic: boolean) => {
    if (isPublic) { handleUserLeftLobby(io, socket, publicLobbyList, lobbyId, playerId) } else {
      handleUserLeftLobby(io, socket, privateLobbyList, lobbyId, playerId)
    }

    socket.leave(lobbyId)
    socket.join(ROOMPUBLICLOBBY)
  }
  )


  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`)
    let lobbyId = userLobby(publicLobbyList, socket.id)
    if (lobbyId !== undefined) {
      handleUserLeftLobby(io, socket, publicLobbyList, lobbyId, socket.id)
    }
  })
})



httpServer.listen(PORT, () => {
  logger.info(`Back-end running: Listening on http://localhost:${PORT}`)
})
