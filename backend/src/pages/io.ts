import { Server } from 'socket.io'
import logger from '../logger'
import { LobbyInfosType } from '../type/LobbyInfo'
import { handleLeaveLobby, handleJoinLobby } from './inLobby'

function handleIOCounter(io: Server) {
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

function handleIo(io: Server, lobbiesList: LobbyInfosType[]) {
    io.on('connection', (socket) => {
        logger.info(`New user connected: ${socket.id}`)

        socket.on('leave-lobby', (infos : {lobbyId: string, playerId: string}) => {
            handleLeaveLobby(socket, lobbiesList, infos)
        })

        socket.on('join-lobby', (infos: {lobbyId: string, playerInfo: {id: string, name: string}}) => {
            handleJoinLobby(socket, lobbiesList, infos)
        })

        socket.on('disconnect', () => {
            logger.info(`User disconnected: ${socket.id}`)
        })
    })
}

export { handleIOCounter, handleIo }