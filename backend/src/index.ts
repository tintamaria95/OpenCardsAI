import express, { Request, Response } from 'express'
import { createServer } from 'http'
import * as socketio from 'socket.io'
import * as path from 'path'
import getDatabase from './database/main'
import logger from './logger'
import { handlePublicLobbiesReq } from './pages/publiclobby'
import { handleIOConnection } from './pages/io'

const PORT = 3000

getDatabase().catch(() => {
  logger.error(
    'SQLite: Error while trying to get/connect to the database object.'
  )
})

const app = express()

const httpServer = createServer(app)
const io = new socketio.Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173'
  }
})

app.use(express.static('public'))

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../index.html'))
})

// Request to browse game lobbies. Send JSON list of available public lobbies
app.get('/publiclobby', (req: Request, res: Response) => {
  handlePublicLobbiesReq(res).catch(() => {
    logger.error('Error while loading public lobbies')
  })
})

// Request to create a new lobby. Send an acknowlegement for new lobby creation and infos to join websocket room.
app.post('/publiclobby', (req: Request, res: Response) => {
  // handlePublicLobbiesReq(res).catch(() => {
  //   logger.error('Error while loading public lobbies')
  // })
})

// io connection example
handleIOConnection(io)

httpServer.listen(PORT, () => {
  logger.info(`Back-end running: Listening on http://localhost:${PORT}`)
})
