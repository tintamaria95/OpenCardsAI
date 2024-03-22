import { Socket, io } from 'socket.io-client'

let socket: Socket
if (process.env.REACT_APP_API_URL == undefined) {
  socket = io({
    autoConnect: false
  })
} else {
  socket = io(process.env.REACT_APP_API_URL, {
    autoConnect: false
  })
}
const sessionId = localStorage.getItem('sessionId')
socket.auth = { sessionId: sessionId }
socket.connect()

export default socket
