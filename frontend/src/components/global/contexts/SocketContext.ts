import { createContext, useContext } from 'react'
import { Socket } from 'socket.io-client'
import socket from '../../../socket'

type SocketContent = {
  socket: Socket
}
export const SocketContext = createContext<SocketContent>({
  socket: socket
})

export const useSocketContext = () => useContext(SocketContext)
