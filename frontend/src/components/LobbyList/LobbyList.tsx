import { useState, useEffect } from 'react'
import { backEndUrl } from '../../main'


export default function LobbyList() {
    const [lobbiesList, setLobbiesList] = useState([{ name: 'name', numberOfPlayers: 111, status: 'status' }])
    const [isLoading, setIsLoading] = useState(true)
    const [fetchError, setFetchError] = useState("")

    useEffect(() => {
        refresh()
    }, [])

    async function refresh() {
        setIsLoading(true)
        fetch(backEndUrl + '/publiclobby')
            .then(res => res.json())
            .then((res) => {
                setLobbiesList(res)
                console.log(lobbiesList)
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
                        <button onClick={refresh}>Refresh</button>
                        <ul>
                            {lobbiesList.map((lobby, index) => (
                                <li key={index}>
                                    <div id='lobbyname'>{lobby.name}</div>
                                    <div>{lobby.numberOfPlayers}</div>
                                    <div>{lobby.status}</div>
                                    <button>Rejoindre</button>
                                </li>
                            ))}
                        </ul>
                        {(fetchError !== "")? (<div>Error: {fetchError}</div>): (<></>)}
                    </>)}
        </>)
}

