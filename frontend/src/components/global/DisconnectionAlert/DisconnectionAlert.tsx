import './DisconnectionAlert.css'
import { useEffect, useState } from 'react'
import { useSocketContext } from '../contexts/SocketContext'

export function DisconnectionAlert() {
  const { socket } = useSocketContext()
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    function handleConnect() {
      setIsConnected(true)
    }

    function handleDisconnect() {
      setIsConnected(false)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [socket])

  return isConnected ? (
    <></>
  ) : (
    <div className="overlay">
      <div className="centered-content">Disconnected</div>
    </div>
  )
}
