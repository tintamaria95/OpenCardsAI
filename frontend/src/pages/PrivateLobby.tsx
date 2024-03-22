import { Link } from 'react-router-dom'
import LobbyToCreate from '../components/LobbyToCreate'
import { useSocketContext } from '../contexts/SocketContext'
import { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'

function PrivateLobby() {
  const [invitCode, setInvitCode] = useState("Code d'invitation")
  const { socket } = useSocketContext()

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setInvitCode(e.target.value)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    socket.emit('req-join-lobby', invitCode)
  }

  return (
    <>
      <h1>PrivateLobby</h1>
      <form onSubmit={handleSubmit}>
        <label>As-tu un code d&apos;invitation ?</label>
        <input
          type="text"
          placeholder={"Code d'invitation"}
          onChange={handleChange}
        />
        <button type="submit">Rejoindre lobby privé</button>
      </form>
      <div></div>
      <span>
        <LobbyToCreate isPublic={false} />
      </span>
      <div>
        <Link to={'/'}>retour</Link>
      </div>
    </>
  )
}

export default PrivateLobby
