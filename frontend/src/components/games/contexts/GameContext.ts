import { createContext, useContext } from 'react'
import { PlayerFrontState } from '../../../types'
import { Dispatch, SetStateAction } from 'react'

type GameContent = {
    count: number
    setCount: Dispatch<SetStateAction<number>>
    state: PlayerFrontState
}

export const GameContext = createContext<GameContent>({
    count: 20,
    setCount: () => {},
    state:  {
        isGameEnded: false,
        roundIndex: 1,
        roundFirstPlayerIndex:0,
        possiblePlayers: [],
        possibleActions: [],
        contracts: [],
        nbTricks: [],
        pileCards: [],
        scores: [],
        playerHand: []
    }
})

export const useGameContext = () => useContext(GameContext)
