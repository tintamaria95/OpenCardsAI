import { Server } from 'socket.io'
import logger from '../logger'

function handleIOConnection(io: Server) {
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
}

export { handleIOConnection }