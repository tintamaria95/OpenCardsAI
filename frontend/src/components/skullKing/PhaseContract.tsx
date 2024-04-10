import { useSocketContext } from "../../contexts/SocketContext"

type PhaseContractProp = {
    maxContractValue: number,
    playerHand: string[]
}

export function PhaseContract({maxContractValue, playerHand}: PhaseContractProp){
    const {socket} = useSocketContext()

        function handleClick(contractValue: number){
            socket.emit('req-update-gameState', {type: 'setContract', contractValue: contractValue})
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
            <section>
                <h3>Click on the contract value you seek to respect</h3>
                <ul>
                    {Array.from({ length: maxContractValue + 1 }, (_, index) => {
                        return (<li key={index} onClick={() => handleClick(index)}>{index}</li>)
                    })}
                </ul>
            </section>
        </>
    )
}