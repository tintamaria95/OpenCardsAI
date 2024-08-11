import { Link } from "react-router-dom"
import { PhaseContract } from "./PhaseContract"
import { PhasePlayCard } from "./PhasePlayCard"
import { useLobbyContext } from "../../lobby/contexts/LobbyContext"
import { CountDown } from "../Countdown"
import { useGameContext } from "../contexts/GameContext"
import { useSocketContext } from "../../global/contexts/SocketContext"
import { useEffect } from "react"

export function SkullKing() {

    const { currentLobby } = useLobbyContext()
    const { count, setCount, state } = useGameContext()
    const { socket } = useSocketContext()

    useEffect(() => {
        socket.emit('req-get-gameState')
    }, [])

    return (
        <>
            <Link to={'/'}>Back to menu</Link>
            {(!state.isGameEnded) ? (
                <>
                    <div>--------</div>
                    <CountDown count={count} setCount={setCount} />
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
                    ) : (
                        <>
                        </>
                    )}
                </>
            ) : (
                <>
                    <h1>Game ended</h1>
                    Final scores:
                    <ul>
                        {state.scores.map((_, index) => (
                            <li key={index}>Score {currentLobby?.users[index].username}: {state.scores[index]}</li>
                        ))}
                    </ul>
                </>)}

        </>)
}