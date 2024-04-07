import { useCurrentLobbyContext } from "../../contexts/CurrentLobbyContext"
import { Playable } from "./Playable"

type PhasePlayCardProp = {
    nbTricks: number[],
    contracts: number[],
    pileCards: string[],
    playerHand: string[]
}

export function PhasePlayCard({ nbTricks, contracts, pileCards, playerHand }: PhasePlayCardProp) {
    const { currentLobby } = useCurrentLobbyContext()
    return (
        <>
            <section>
                <h3>Contracts</h3>
                <ul>
                    {nbTricks.map((playerNbTricks, index) => (
                        <li key={index}>{currentLobby?.users[index].username}: {playerNbTricks} / {contracts[index]}</li>
                    ))}
                </ul>
            </section>
            <section>
                <h3>Pile</h3>
                <ul>
                    {pileCards.map((card, index) => (
                        <li key={index}>{index} - {card}</li>
                    ))}
                </ul>
            </section>
            <section>
                <h3>Cards in Hand</h3>
                <ul>
                    {playerHand.map((cardId, index) => (
                        <li key={index}><Playable card={<>{index} - {cardId}</>} cardId={cardId} /></li>
                    ))}
                </ul>
            </section>

        </>
    )
} 