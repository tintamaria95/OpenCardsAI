import { ChangeEvent, FormEvent, useState } from "react"
import { useSocketContext } from "./SocketContext"
import { useUserContext } from "./UserContext"



export function Username() {
  const {username, setUsername} = useUserContext()
  const [isModifying, setIsModifying] = useState(false)
  const {socket} = useSocketContext()

  function handleChange(e: ChangeEvent<HTMLInputElement>){
    setUsername(e.target.value)
  }

  function handleSubmitChanges(e: FormEvent) {
    e.preventDefault()
    setIsModifying(true)
  }

  function handleSubmitValidate(e: FormEvent){
    e.preventDefault()
    socket.emit('update-username', username)
    localStorage.setItem('username', username)
    setIsModifying(false)
  }

  return (
    (isModifying) ? (
      <form onSubmit={handleSubmitValidate}>
        <input type="text" onChange={handleChange} placeholder={username} />
        <button type="submit">Validate pseudo</button>
      </form>
    ) : (
      <form onSubmit={handleSubmitChanges}>
      <label>{username}</label>
      <button type="submit">change pseudo</button>
    </form>)
  )
}