import { useSocketContext } from "../../contexts/SocketContext"

type PhaseContractProp = {
    maxContractValue: number,
    playerHand: string[]
}

export function PhaseContract({maxContractValue, playerHand}: PhaseContractProp){
    const {socket} = useSocketContext()

        function handleClick(index: number){
            socket.emit('req-update-gameState', 'setContract', index)
        }
    
    return (
        <>
        <section>
                <h3>Cards in Hand</h3>
                <ul>
                    {playerHand.map((card, index) => (
                        <li key={index}><>{index} - {card}</></li>
                    ))}
                </ul>
            </section>
        <ul>
            {Array.from({length: maxContractValue + 1}, (_, index) => {
                return (<li key={index} onClick={() => handleClick(index)}>{index}</li>)
            })}
        </ul>
        </>
    )
}