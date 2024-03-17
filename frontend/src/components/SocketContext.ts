import { createContext, useContext } from "react"
import { io, Socket } from "socket.io-client"

type SocketContent = {
    socket: Socket
  }
  export const SocketContext = createContext<SocketContent>({
    socket: io('', {autoConnect: false})
  })

  export const useSocketContext = () => useContext(SocketContext)