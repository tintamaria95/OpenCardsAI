import { useSocketContext } from "../global/contexts/SocketContext"

export default function PlayButton(){

    const {socket } = useSocketContext()

    function handleClickPlay(){
        socket.emit('req-join-lobby')
    }

    return (
            <button onClick={handleClickPlay}>Play</button>
        )
}