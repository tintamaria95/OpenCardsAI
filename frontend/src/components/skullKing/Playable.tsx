import { ReactElement } from "react";
import { useSocketContext } from "../../contexts/SocketContext";

type PlayableProp = {
    card: ReactElement,
    cardId: string
}

export function Playable({ card, cardId }: PlayableProp) {
    const { socket } = useSocketContext()


    function handleClickPlayCard() {
        socket.emit('req-update-gameState', { type: 'playCard', cardId: cardId })
    }

    return (
        <div onClick={handleClickPlayCard}>{card}</div>
    )
}