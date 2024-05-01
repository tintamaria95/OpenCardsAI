import { createContext, useContext } from 'react'
import { PlayerFrontState } from '../../../types'
import { Dispatch, SetStateAction } from 'react'

type GameContent = {
    count: number
    setCount: Dispatch<SetStateAction<number>>
    state: PlayerFrontState
}

export const GameContext = createContext<GameContent>({
    count: 10,
    setCount: () => {},
    state:  {
        roundIndex: 1,
        roundFirstPlayerIndex:0,
        possiblePlayers: [],
        possibleActions: [],
        contracts: [],
        nbTricks: [],
        pileCards: [],
        scores: [],
        playerHand: [],
        isResetChrono: true
    }
})

export const useGameContext = () => useContext(GameContext)
