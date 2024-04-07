import { Card } from "./Card"
export function Hand(cardIds: string[]) {
    return (
        <>
            <h3>My hand</h3>
            <ul>
                {cardIds.map((cardId, index) => (
                    <li key={index}><Card id={cardId} index={index}/></li>
                ))}
            </ul>
        </>
    )
}