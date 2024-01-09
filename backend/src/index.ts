import express, { Request, Response } from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const PORT = 3000
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  /* options */
})

io.on('connection', (socket) => {
  console.log(socket.id)
})

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!')
})

httpServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
