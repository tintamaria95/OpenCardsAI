import { useEffect } from "react";

export function CountDown({count, setCount}: {count: number, setCount: React.Dispatch<React.SetStateAction<number>>}){
    
    useEffect(() => {
        const intervalId = setInterval(() => {
            setCount(prevCount => Math.max(0, Math.abs(prevCount - 1)))
            // setCount(prevCount => prevCount - 1)
        }, 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [])
    return (
        <div>{count}</div>
    )
}