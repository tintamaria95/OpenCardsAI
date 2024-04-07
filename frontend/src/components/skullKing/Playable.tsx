import { ReactElement } from "react";
import { useSocketContext } from "../../contexts/SocketContext";

export function Playable({card, index} :{card: ReactElement, index: number}){
    const { socket } = useSocketContext()

    
    function handleClickPlayCard(){
        socket.emit('req-update-gameState', 'playCard', index)
    }
    
    return (
    <div onClick={handleClickPlayCard}>{card}</div>
    )
}