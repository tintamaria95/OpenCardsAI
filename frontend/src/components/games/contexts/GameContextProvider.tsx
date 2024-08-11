import { ReactElement, useState, useEffect } from 'react'
import { GameContext } from './GameContext'
import { PlayerFrontState } from '../../../types'
import { useSocketContext } from '../../global/contexts/SocketContext'

export function GameContextProvider({ children }: { children: ReactElement }) {

    const [count, setCount] = useState(20)
    const [state, setState] = useState<PlayerFrontState>({
        isGameEnded: false,
        roundIndex: 1,
        roundFirstPlayerIndex: 0,
        possiblePlayers: [],
        possibleActions: [],
        contracts: [],
        nbTricks: [],
        pileCards: [],
        scores: [],
        playerHand: []
    })

    const { socket } = useSocketContext()

    useEffect(() => {
        function updateGameState(state: PlayerFrontState) {
            const chronoValue = state.chronoValue
            if (chronoValue !== undefined) {
                setCount(chronoValue)
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
