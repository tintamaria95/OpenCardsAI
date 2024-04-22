import { useEffect, useState } from "react"
import { useSocketContext } from "../../contexts/SocketContext"
import {
    PlayerFrontState
} from "../../types"
import { PhaseContract } from "./PhaseContract"
import { PhasePlayCard } from "./PhasePlayCard"
import { useCurrentLobbyContext } from "../../contexts/CurrentLobbyContext"
import { useCountdown } from "../Countdown"
import { useUserContext } from "../../contexts/UserContext"

export function SkullKing() {
    const { socket } = useSocketContext()
    const { currentLobby } = useCurrentLobbyContext()
    const { sessionId } = useUserContext()
    const {count, setCount} = useCountdown(10)
    const [state, setState] = useState<PlayerFrontState>({
        roundIndex: 1,
        roundFirstPlayerIndex:0,
        possiblePlayers: [],
        possibleActions: [],
        contracts: [],
        nbTricks: [],
        pileCards: [],
        scores: [],
        playerHand: []
    })

    useEffect(() => {
        socket.on('gameState', updateGameState)
        socket.emit('req-get-gameState')
        return () => {
            socket.off('gameState', updateGameState)
        }
    }, [socket])

    function updateGameState(state: PlayerFrontState) {
        console.log('got gameState Event')
        if (sessionId !== undefined) {
            if (!(state.possibleActions.includes("setContract") && !state.possiblePlayers.includes(sessionId))) {
                setCount(10)
                setState(state)
            }
        }
    }

    return (
        <>
            <div>{JSON.stringify(state)}</div>
            <h2>CountDown: {count}</h2>
            <h3>ROUND {state.roundIndex}</h3>
            <h3>First player this round: {currentLobby?.users[state.roundFirstPlayerIndex].username}</h3>
            <ul>
                {state.scores.map((_, index) => (
                    <li key={index}>Score {currentLobby?.users[index].username}: {state.scores[index]}</li>
                ))}
            </ul>
            <h3>Waiting for player&#40;s&#41;: {state.possiblePlayers}</h3>
            {state.possibleActions[0] === "setContract" ? (
                <PhaseContract
                    maxContractValue={state.roundIndex}
                    playerHand={state.playerHand} />
            ) : (<></>)}
            {state.possibleActions[0] === "playCard" ? (
                <PhasePlayCard
                    nbTricks={state.nbTricks}
                    contracts={state.contracts}
                    pileCards={state.pileCards}
                    playerHand={state.playerHand} />
            ) : (<></>)}
        </>)
}