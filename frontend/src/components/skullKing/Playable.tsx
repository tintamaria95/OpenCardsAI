import { ReactElement, useState } from "react";
import { useSocketContext } from "../../contexts/SocketContext";
import { ActionPlayCard } from "../../action/ActionSK";

type PlayableProp = {
    card: ReactElement,
    cardId: string
}

export function Playable({ card, cardId }: PlayableProp) {
    const [isScaryMary] = useState(isScaryMaryCard())
    const { socket } = useSocketContext()

    function isScaryMaryCard(){
        return cardId === 'scaryMary'
    }

    function handleClickPlayCard(scaryMaryChoice?: 'pirate' | 'escape') {
        const action: ActionPlayCard = {
            type: "playCard",
             cardId: cardId,
             scaryMaryChoice: scaryMaryChoice
        }
        socket.emit('req-update-gameState', action)
    }

    return (
        isScaryMary ? (
            <>
                <div>{card}</div>
                <ul>
                    <li onClick={() => handleClickPlayCard('pirate')}>{'('}Pirate Scary Mary{')'}</li>
                    <li onClick={() => handleClickPlayCard('escape')}>{'('}Escape Scary Mary{')'}</li>
                </ul>
            </>)
            : (
                <div onClick={() => handleClickPlayCard()}>{card}</div>
            )
    )
}