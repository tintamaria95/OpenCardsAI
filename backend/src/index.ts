import express, { Request, Response } from 'express'
import { createServer } from 'http'
import * as socketio from 'socket.io'
import * as path from 'path'
import getDatabase from './database/main'
import logger from './logger'

const PORT = 3000

getDatabase()
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

io.on('connection', (socket) => {
  logger.info(`New user connected: ${socket.id}`)

  socket.on('increment', () => {
    logger.info('increment')
    io.emit('increment')
  })

  socket.on('decrement', () => {
    logger.info('decrement')
    io.emit('decrement')
  })

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`)
  })
})

httpServer.listen(PORT, () => {
  logger.info(`Back-end running: Listening on http://localhost:${PORT}`)
})
