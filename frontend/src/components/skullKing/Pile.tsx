import { Card } from "./Card"
export function Pile(cardIds: string[]) {
    return (
        <>
            <h3>Pile</h3>
            <ul>
                {cardIds.map((cardId, index) => (
                    <li key={index}><Card id={cardId} index={index}/></li>
                ))}
            </ul>
        </>
    )
}