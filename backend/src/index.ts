import express, { Request, Response } from 'express'
import { createServer } from 'http'
import bodyParser from 'body-parser'
import * as socketio from 'socket.io'
import * as path from 'path'
import logger from './logger'
import { LobbyInfo } from './type/LobbyInfo'
import { handlePublicLobbiesGET, handlePublicLobbiesPOST } from './pages/publiclobby'
import { handleIOConnection } from './pages/io'
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
const lobbiesList: LobbyInfo[] = [{
  name:"test",
  numberOfPlayers: 2,
  status: "OK"
}]

// Request to browse game lobbies. Send JSON list of available public lobbies
app.get('/publiclobby', (req: Request, res: Response) => {
  handlePublicLobbiesGET(res, lobbiesList).catch(() => {
    logger.error('Error while loading public lobbies')
  })
})

// Request to create a new lobby. Send an acknowlegement for new lobby creation and infos to join websocket room.
app.post('/publiclobby', (req: Request, res: Response) => {
  handlePublicLobbiesPOST(req, res, lobbiesList)
})

// io connection example
handleIOConnection(io)

httpServer.listen(PORT, () => {
  logger.info(`Back-end running: Listening on http://localhost:${PORT}`)
})
