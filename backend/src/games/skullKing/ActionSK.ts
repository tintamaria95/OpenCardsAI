export type ActionSetContract = {
    type: 'setContract',
    contractValue: number
}

export type ActionPlayCard = {
    type: 'playCard'
    cardId: string
    scaryMaryChoice?: 'pirate' | 'escape'
}

export type ActionSK = ActionSetContract | ActionPlayCard
