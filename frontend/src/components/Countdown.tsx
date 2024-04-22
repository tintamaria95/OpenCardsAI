import { useEffect, useState } from "react";

export function useCountdown(value: number){
    const [count, setCount] = useState(value)

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCount(prevCount => prevCount - 1)
        }, 1000)

        return () => {
            clearInterval(intervalId)
        }
    }), []

    return { count, setCount }
}