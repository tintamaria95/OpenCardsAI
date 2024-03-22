import { ChangeEvent, FormEvent, useState } from 'react'
import { useSocketContext } from '../contexts/SocketContext'
import { useUserContext } from '../contexts/UserContext'

export function Username() {
  const { username, setUsername } = useUserContext()
  const [isModifying, setIsModifying] = useState(false)
  const [isEmptyString, setIsEmptyString] = useState(false)
  const { socket } = useSocketContext()

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setUsername(e.target.value)
  }

  function handleSubmitChanges(e: FormEvent) {
    e.preventDefault()
    setIsModifying(true)
  }

  function handleSubmitValidate(e: FormEvent) {
    e.preventDefault()
    if (username === '') {
      setIsEmptyString(true)
    } else {
      socket.emit('update-username', username)
      localStorage.setItem('username', username)
      setIsModifying(false)
      setIsEmptyString(false)
    }
  }

  return isModifying ? (
    <>
      <form onSubmit={handleSubmitValidate}>
        <input type="text" onChange={handleChange} placeholder={username} />
        <button type="submit">Validate pseudo</button>
      </form>
      {isEmptyString ? (<div>Error: Pseudo must contain at least one character</div>): (<div></div>)}
    </>
  ) : (
    <form onSubmit={handleSubmitChanges}>
      <label>{username}</label>
      <button type="submit">Change pseudo</button>
    </form>
  )
}
