import { useState, useEffect } from 'react'
import { backEndUrl } from '../../App/App'
import LobbyToJoin from '../LobbyToJoin/LobbyToJoin'
import LobbyToCreate from '../LobbyToCreate/LobbyToCreate'


export default function LobbyList() {
    const [lobbiesList, setLobbiesList] = useState([{socketId: '', name: '0', numberOfPlayers: 0, status: '0' }])
    const [isLoading, setIsLoading] = useState(true)
    const [fetchError, setFetchError] = useState("")

    useEffect(() => {
        refreshLobbies()
    }, [])

    // --- REFRESH WITHOUT WEBSOCKET MIGHT RESULT IN MORE INCOHERENCE (CHANGES TO MAKE LATER)
    async function refreshLobbies() {
        setIsLoading(true)
        fetch(backEndUrl + '/publiclobby')
            .then(res => res.json())
            .then((res) => {
                setLobbiesList(res)
                setIsLoading(false)
            },
                (error) => {
                    setIsLoading(false)
                    setFetchError(error)
                    console.log(error)
                })
    }

    return (
        <>
            {(isLoading) ?
                (
                    <div>LOADING...</div>
                ) : (
                    <>
                        <button onClick={refreshLobbies}>Refresh Lobby list</button>
                        <div></div>
                        <LobbyToCreate/>
                        <div>--- Existing lobbies ---</div>
                        <ul>
                            {lobbiesList.map((lobby, index) => (
                                <li key={index}>
                                    <LobbyToJoin socketId={lobby.socketId} name={lobby.name} numberOfPlayers={lobby.numberOfPlayers} status={lobby.status}/>
                                </li>
                            ))}
                        </ul>
                        {(fetchError !== "")? (<div>Error: {fetchError}</div>): (<></>)}
                    </>)}
        </>)
}

