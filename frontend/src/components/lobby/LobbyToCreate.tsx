import { FormEvent, useState } from 'react'
import { useSocketContext } from '../global/contexts/SocketContext'
import { useUserContext } from './contexts/UserContext'
import { ChangeEvent } from 'react'

type LobbyToCreatePropType = {
  isPublic: boolean
}

export default function LobbyToCreate({ isPublic }: LobbyToCreatePropType) {
  const { socket } = useSocketContext()
  const { username } = useUserContext()
  const defaultLobbyName = username + "'s lobby"
  const [lobbyName, setLobbyName] = useState(defaultLobbyName)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault()
    setLobbyName(e.target.value)
  }

  function handleSubmitCreateNewLobby(e: FormEvent) {
    e.preventDefault()
    if (lobbyName === '') {
      socket.emit('req-create-lobby', defaultLobbyName, isPublic)
    } else {
      socket.emit('req-create-lobby', lobbyName, isPublic)
    }
  }

  return (
    <form onSubmit={handleSubmitCreateNewLobby}>
      <input
        type="text"
        onChange={handleChange}
        placeholder={defaultLobbyName}
      />
      <button type="submit">Create new lobby</button>
    </form>
  )
}
