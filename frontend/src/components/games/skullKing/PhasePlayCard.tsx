import { useLobbyContext } from "../../lobby/contexts/LobbyContext"
import { Playable } from "./Playable"

type PhasePlayCardProp = {
    nbTricks: number[],
    contracts: number[],
    pileCards: string[],
    playerHand: string[]
}

export function PhasePlayCard({ nbTricks, contracts, pileCards, playerHand }: PhasePlayCardProp) {
    const { currentLobby } = useLobbyContext()
    return (
        <>
            <h2>Play card phase</h2>
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
                <h4>Click on the card you want to play</h4>
                <ul>
                    {playerHand.map((cardId, index) => (
                        <li key={index}><Playable card={<>{cardId}</>} cardId={cardId} /></li>
                    ))}
                </ul>
            </section>

        </>
    )
} 