import express, { Request, Response } from 'express'
import { createServer } from 'http'
import * as socketio from 'socket.io'
import * as path from 'path'

const PORT = 3000

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
  console.log(`New user connected: ${socket.id}`)

  socket.on('increment', () => {
    console.log('increment')
    io.emit('increment')
  })

  socket.on('decrement', () => {
    console.log('decrement')
    io.emit('decrement')
  })

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
