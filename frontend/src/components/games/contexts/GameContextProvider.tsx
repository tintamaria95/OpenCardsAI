import { ReactElement, useState, useEffect } from 'react'
import { GameContext } from './GameContext'
import { PlayerFrontState } from '../../../types'
import { useSocketContext } from '../../global/contexts/SocketContext'

export function GameContextProvider({ children }: { children: ReactElement }) {

    const [count, setCount] = useState(10)
    const [state, setState] = useState<PlayerFrontState>({
        roundIndex: 1,
        roundFirstPlayerIndex: 0,
        possiblePlayers: [],
        possibleActions: [],
        contracts: [],
        nbTricks: [],
        pileCards: [],
        scores: [],
        playerHand: [],
        isResetChrono: true
    })

    const { socket } = useSocketContext()

    useEffect(() => {
        function updateGameState(state: PlayerFrontState) {
            if (state.isResetChrono) {
                setCount(10)
            }
            setState(state)
        }

        socket.on('gameState', updateGameState)
        return () => {
            socket.off('gameState', updateGameState)
        }
    }, [socket])




    return (
        <GameContext.Provider value={{ count, setCount, state }}>
            {children}
        </GameContext.Provider>
    )
}
